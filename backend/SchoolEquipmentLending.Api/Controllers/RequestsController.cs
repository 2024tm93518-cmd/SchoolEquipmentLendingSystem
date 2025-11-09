using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolEquipmentLending.Api.Data;
using SchoolEquipmentLending.Api.DTOs;
using SchoolEquipmentLending.Api.Models;

namespace SchoolEquipmentLending.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RequestsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public RequestsController(AppDbContext db){ _db = db; }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRequestDto dto)
        {
            var item = await _db.Items.FindAsync(dto.ItemId);
            if (item == null)
                return NotFound(new { msg = "Item not found" });

            var overlap = await _db.Requests.AnyAsync(r =>
                r.ItemId == dto.ItemId &&
                (r.Status == "approved" || r.Status == "issued") &&
                !(r.RequestedTo < dto.RequestedFrom || r.RequestedFrom > dto.RequestedTo)
            );

            if (overlap)
                return BadRequest(new { msg = "Item already booked for the selected period" });

            var idClaim = User.Claims.FirstOrDefault(c =>
                c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub ||
                c.Type == System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

            if (string.IsNullOrEmpty(idClaim))
                return Unauthorized(new { msg = "User ID not found in token claims" });

            if (!int.TryParse(idClaim, out var requesterId))
                return BadRequest(new { msg = "Invalid user ID format in token" });

            var req = new Request
            {
                RequesterId = requesterId,
                ItemId = dto.ItemId,
                Quantity = dto.Quantity,
                RequestedFrom = dto.RequestedFrom,
                RequestedTo = dto.RequestedTo,
                Notes = dto.Notes,
                Status = "pending"
            };

            _db.Requests.Add(req);
            await _db.SaveChangesAsync();

            return Ok(req);
        }


        [Authorize]
        [HttpGet]
        public async Task<IActionResult> List(
    [FromQuery] int page = 1,
    [FromQuery] int limit = 10)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var role = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;

            IQueryable<Request> query;

            if (role == "admin" || role == "staff")
            {
                // Admin/staff see all requests
                query = _db.Requests
                    .Include(r => r.Item)
                    .Include(r => r.Requester)
                    .OrderByDescending(r => r.RequestedFrom);
            }
            else
            {
                // Student sees only their requests
                var idClaim = User.Claims.FirstOrDefault(c =>
                    c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub ||
                    c.Type == System.Security.Claims.ClaimTypes.NameIdentifier
                )?.Value;

                if (string.IsNullOrEmpty(idClaim))
                    return Unauthorized(new { msg = "User ID not found in token claims" });

                if (!int.TryParse(idClaim, out var id))
                    return BadRequest(new { msg = "Invalid user ID format in token" });

                query = _db.Requests
                    .Include(r => r.Item)
                    .Include(r => r.Requester)
                    .Where(r => r.RequesterId == id)
                    .OrderByDescending(r => r.RequestedFrom);
            }

            var totalRequests = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalRequests / (double)limit);

            var requests = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return Ok(new
            {
                page,
                limit,
                totalRequests,
                totalPages,
                requests
            });
        }


        [Authorize(Roles = "staff,admin")]
        [HttpPost("{id}/decide")]
        public async Task<IActionResult> Decide(int id, [FromBody] DecisionDto dto)
        {
            var action = dto.Action?.ToLower();
            var req = await _db.Requests.Include(r => r.Item).FirstOrDefaultAsync(r => r.Id == id);
            if (req == null) return NotFound();
            if (action == "approve") req.Status = "approved";
            else if (action == "reject") req.Status = "rejected";
            else if (action == "issue")
            {
                if (req.Item.AvailableQuantity < req.Quantity) return BadRequest(new { msg = "Not enough items available" });
                req.Status = "issued";
                req.Item.AvailableQuantity -= req.Quantity;
            }
            else if (action == "return")
            {
                req.Status = "returned";
                req.Item.AvailableQuantity += req.Quantity;
            }
            await _db.SaveChangesAsync();
            return Ok(req);
        }
    }
}

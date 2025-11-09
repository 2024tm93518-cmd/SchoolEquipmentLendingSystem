using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolEquipmentLending.Api.Data;
using SchoolEquipmentLending.Api.Models;

namespace SchoolEquipmentLending.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ItemsController(AppDbContext db){ _db = db; }

        [Authorize]
        [HttpGet("search")]
        public async Task<IActionResult> SearchItems(
     [FromQuery] string q)
        {
            var query = _db.Items.AsQueryable();

            if (!string.IsNullOrEmpty(q))
                query = query.Where(i => EF.Functions.Like(i.Name, $"%{q}%"));

          
                query = query.Where(i => i.AvailableQuantity > 0);

            var items = await query.ToListAsync();
            return Ok(items);
        }


        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Item item)
        {
            item.AvailableQuantity = item.TotalQuantity;
            _db.Items.Add(item);
            await _db.SaveChangesAsync();
            return Ok(item);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Item updates)
        {
            var item = await _db.Items.FindAsync(id);
            if (item == null) return NotFound();
            item.Name = updates.Name;
            item.Category = updates.Category;
            item.Condition = updates.Condition;
            item.TotalQuantity = updates.TotalQuantity;
            item.AvailableQuantity = updates.AvailableQuantity;
            item.Description = updates.Description;
            await _db.SaveChangesAsync();
            return Ok(item);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _db.Items.FindAsync(id);
            if (item == null) return NotFound();
            _db.Items.Remove(item);
            await _db.SaveChangesAsync();
            return Ok(new { msg = "Deleted" });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllItems([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var totalItems = await _db.Items.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)limit);

            var items = await _db.Items
                .OrderBy(i => i.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return Ok(new
            {
                page,
                limit,
                totalItems,
                totalPages,
                items
            });
        }

    }
}

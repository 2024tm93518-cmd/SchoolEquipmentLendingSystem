using Microsoft.AspNetCore.Mvc;
using SchoolEquipmentLending.Api.DTOs;

namespace SchoolEquipmentLending.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        public AuthController(IAuthService auth) { _auth = auth; }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupDto dto)
        {
            try { var res = await _auth.Signup(dto); return Ok(res); }
            catch (Exception ex) { return BadRequest(new { msg = ex.Message }); }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try { var res = await _auth.Login(dto); return Ok(res); }
            catch (Exception ex) { return BadRequest(new { msg = ex.Message }); }
        }
    }
}

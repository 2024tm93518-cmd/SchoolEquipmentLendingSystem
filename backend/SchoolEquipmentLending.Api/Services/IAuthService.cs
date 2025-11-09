using SchoolEquipmentLending.Api.DTOs;
namespace SchoolEquipmentLending.Api
{
    public interface IAuthService
    {
        Task<AuthResultDto> Signup(SignupDto dto);
        Task<AuthResultDto> Login(LoginDto dto);
    }
}

namespace SchoolEquipmentLending.Api.DTOs
{
    public class SignupDto { public string Name {get;set;} public string Email {get;set;} public string Password {get;set;} public string Role {get;set;} }
    public class LoginDto { public string Email {get;set;} public string Password {get;set;} }
    public class AuthResultDto { public string Token {get;set;} public object User {get;set;} }
}

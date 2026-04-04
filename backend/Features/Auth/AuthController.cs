using backend.Features.Employees;
using backend.Features.Sessions;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Auth
{
  [ApiController]
  [Route("api/auth")]
  public class AuthController : ControllerBase
  {
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
      _authService = authService;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest input)
    {
      Console.WriteLine($"Login attempt for email: {input.Email}");
      Console.WriteLine($"Access key provided: {input.AccessKey}");
      if (string.IsNullOrWhiteSpace(input.Email) || string.IsNullOrWhiteSpace(input.AccessKey))
      {
        return Unauthorized(new AuthResponse { Success = false, Message = "Invalid credentials." });
      }

      var (success, token, employee) = await _authService.LoginAsync(input.Email, input.AccessKey);

      if (!success || token == null || employee == null)
      {
        return Unauthorized(new AuthResponse { Success = false, Message = "Invalid credentials." });
      }

      AppendAuthCookie(token);

      return Ok(new AuthResponse
      {
        Success = true,
        Message = "Login successful.",
        Employee = MapEmployee(employee)
      });
    }

    [HttpPost("fetch")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Fetch()
    {
      var token = GetTokenFromRequest();
      if (string.IsNullOrWhiteSpace(token))
      {
        return Unauthorized(new AuthResponse { Success = false, Message = "Unauthorized." });
      }

      var employee = await _authService.GetEmployeeFromTokenAsync(token);

      if (employee is null)
      {
        return Unauthorized(new AuthResponse { Success = false, Message = "Unauthorized." });
      }

      return Ok(new AuthResponse
      {
        Success = true,
        Message = "Session is valid.",
        Employee = MapEmployee(employee),
      });
    }

    [HttpPost("logout")]
    [ProducesResponseType(typeof(LogoutResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<LogoutResponse>> Logout()
    {
      var token = GetTokenFromRequest();
      if (!string.IsNullOrWhiteSpace(token))
      {
        await _authService.LogoutAsync(token);
      }

      Response.Cookies.Delete(SessionConstants.AuthCookieName);

      return Ok(new LogoutResponse
      {
        Success = true,
        Message = "Logged out successfully."
      });
    }

    private string? GetTokenFromRequest()
    {
      if (Request.Cookies.TryGetValue(SessionConstants.AuthCookieName, out var cookieToken) && !string.IsNullOrWhiteSpace(cookieToken))
      {
        return cookieToken;
      }

      var authHeader = Request.Headers.Authorization.ToString();
      if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
      {
        return authHeader[7..].Trim();
      }

      return null;
    }

    private void AppendAuthCookie(string token)
    {
      var expirationMinutes = int.Parse(HttpContext.RequestServices.GetRequiredService<IConfiguration>()["Jwt:ExpirationMinutes"] ?? "60");
      var cookieOptions = new CookieOptions
      {
        HttpOnly = true,
        Secure = Request.IsHttps,
        SameSite = SameSiteMode.Lax,
        Expires = DateTimeOffset.UtcNow.AddMinutes(expirationMinutes),
        Path = "/"
      };

      Response.Cookies.Append(SessionConstants.AuthCookieName, token, cookieOptions);
    }

    private static EmployeeDto MapEmployee(Employee employee)
    {
      return new EmployeeDto
      {
        Id = employee.Id,
        IdentityNumber = employee.IdentityNumber,
        Phone = employee.Phone,
        Salary = employee.Salary,
        Name = employee.Name,
        Email = employee.Email,
        Role = employee.Role.ToString(),
        Active = employee.Active,
        CreationDate = new DateTimeOffset(employee.CreationDate),
      };
    }

    public class LoginRequest
    {
      public string Email { get; set; } = string.Empty;
      public string AccessKey { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
      public bool Success { get; set; }
      public string Message { get; set; } = string.Empty;
      public EmployeeDto? Employee { get; set; }
    }

    public class LogoutResponse
    {
      public bool Success { get; set; }
      public string Message { get; set; } = string.Empty;
    }

    public class EmployeeDto
    {
      public int Id { get; set; }
      public string IdentityNumber { get; set; } = string.Empty;
      public string Phone { get; set; } = string.Empty;
      public float Salary { get; set; }
      public string Name { get; set; } = string.Empty;
      public string Email { get; set; } = string.Empty;
      public string Role { get; set; } = string.Empty;
      public bool Active { get; set; }
      public DateTimeOffset CreationDate { get; set; }
    }
  }
}

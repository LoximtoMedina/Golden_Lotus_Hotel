using backend.Features.Auth;
using backend.Features.Employees;

namespace backend.Features.Sessions
{
  public class SessionService
  {
    private readonly IAuthService _authService;

    public SessionService(IAuthService authService)
    {
      _authService = authService;
    }

    public async Task<bool> ValidateTokenAsync(string? token)
    {
      if (string.IsNullOrWhiteSpace(token))
        return false;

      return await _authService.ValidateTokenAsync(token);
    }

    public async Task<Employee?> GetEmployeeFromTokenAsync(string? token)
    {
      if (string.IsNullOrWhiteSpace(token))
        return null;

      return await _authService.GetEmployeeFromTokenAsync(token);
    }

    public string? GetTokenFromRequest(HttpContext context)
    {
      if (context.Request.Cookies.TryGetValue(SessionConstants.AuthCookieName, out var cookieToken)
          && !string.IsNullOrWhiteSpace(cookieToken))
      {
        return cookieToken;
      }

      var authorization = context.Request.Headers.Authorization.ToString();
      if (!string.IsNullOrWhiteSpace(authorization) && authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
      {
        return authorization[7..].Trim();
      }

      return null;
    }
  }
}
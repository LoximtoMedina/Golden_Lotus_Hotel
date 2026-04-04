using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Collections.Concurrent;
using backend.Features.Sessions;
using backend.Infrastructure;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using backend.Features.Employees;

namespace backend.Features.Auth
{
  public interface IAuthService
  {
    Task<(bool Success, string? Token, Employees.Employee? Employee)> LoginAsync(string email, string accessKey);
    Task<bool> ValidateTokenAsync(string? token);
    Task<Employees.Employee?> GetEmployeeFromTokenAsync(string? token);
    Task LogoutAsync(string? token);
  }

  public class AuthService : IAuthService
  {
    private readonly IConfiguration _configuration;
    private readonly IDbContextFactory<AppDbContext> _dbContextFactory;
    private readonly ConcurrentDictionary<string, Session> _activeSessions;

    public AuthService(IConfiguration configuration, IDbContextFactory<AppDbContext> dbContextFactory)
    {
      _configuration = configuration;
      _dbContextFactory = dbContextFactory;
      _activeSessions = new ConcurrentDictionary<string, Session>();
    }


    public async Task<(bool Success, string? Token, Employees.Employee? Employee)> LoginAsync(string email, string accessKey)
    {
      try
      {
        await using (var dbContext = await _dbContextFactory.CreateDbContextAsync())
        {
          var employee = await dbContext.Employees
            .FirstOrDefaultAsync(e => e.Email == email && e.Active);

          if (employee == null || employee.AccessKey != accessKey)
          {
            return (false, null, null);
          }

          var token = GenerateJwtToken(employee);

          // Store active session
          _activeSessions[token] = new Session
          {
            EmployeeId = employee.Id,
            Token = token,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(GetExpirationMinutes())
          };

          return (true, token, employee);
        }
      }
      catch
      {
        return (false, null, null);
      }
    }


    public Task<bool> ValidateTokenAsync(string? token)
    {
      if (string.IsNullOrWhiteSpace(token))
        return Task.FromResult(false);

      try
      {
        // Check if token is in active sessions and not expired
        if (_activeSessions.TryGetValue(token, out var session))
        {
          if (session.ExpiresAt > DateTime.UtcNow)
          {
            // Verify the token signature
            return Task.FromResult(VerifyTokenSignature(token));
          }
          else
          {
            // Remove expired session
            _activeSessions.TryRemove(token, out _);
            return Task.FromResult(false);
          }
        }

        return Task.FromResult(false);
      }
      catch
      {
        return Task.FromResult(false);
      }
    }

    /// <summary>
    /// Retrieves the Employee associated with a valid token.
    /// </summary>
    public async Task<Employees.Employee?> GetEmployeeFromTokenAsync(string? token)
    {
      try
      {
        if (!await ValidateTokenAsync(token))
          return null;

        if (token == null || !_activeSessions.TryGetValue(token, out var session))
          return null;

        await using (var dbContext = await _dbContextFactory.CreateDbContextAsync())
        {
          return await dbContext.Employees
            .FirstOrDefaultAsync(e => e.Id == session.EmployeeId && e.Active);
        }
      }
      catch
      {
        return null;
      }
    }

    /// <summary>
    /// Logs out an employee by invalidating their token.
    /// </summary>
    public async Task LogoutAsync(string? token)
    {
      if (!string.IsNullOrWhiteSpace(token))
      {
        _activeSessions.TryRemove(token, out _);
      }
      await Task.CompletedTask;
    }

    /// <summary>
    /// Generates a JWT token for an employee.
    /// </summary>
    private string GenerateJwtToken(Employees.Employee employee)
    {
      var jwtSecret = _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
      var jwtIssuer = _configuration["Jwt:Issuer"] ?? "GoldenLotusHotelBackend";
      var jwtAudience = _configuration["Jwt:Audience"] ?? "GoldenLotusHotelApi";
      var expirationMinutes = GetExpirationMinutes();

      var tokenHandler = new JwtSecurityTokenHandler();
      var key = Encoding.ASCII.GetBytes(jwtSecret);
      var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

      var claims = new List<Claim>
      {
        new Claim(ClaimTypes.NameIdentifier, employee.Id.ToString()),
        new Claim(ClaimTypes.Name, employee.Name),
        new Claim(ClaimTypes.Email, employee.Email),
        new Claim("role", employee.Role.ToString())
      };

      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(claims),
        Expires = expiresAt,
        Issuer = jwtIssuer,
        Audience = jwtAudience,
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
      };

      var token = tokenHandler.CreateToken(tokenDescriptor);
      return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// Verifies the signature of a JWT token.
    /// </summary>
    private bool VerifyTokenSignature(string token)
    {
      try
      {
        var jwtSecret = _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
        var key = Encoding.ASCII.GetBytes(jwtSecret);
        var tokenHandler = new JwtSecurityTokenHandler();

        tokenHandler.ValidateToken(token, new TokenValidationParameters
        {
          ValidateIssuerSigningKey = true,
          IssuerSigningKey = new SymmetricSecurityKey(key),
          ValidateIssuer = true,
          ValidIssuer = _configuration["Jwt:Issuer"],
          ValidateAudience = true,
          ValidAudience = _configuration["Jwt:Audience"],
          ValidateLifetime = true,
          ClockSkew = TimeSpan.Zero
        }, out SecurityToken validatedToken);

        return true;
      }
      catch
      {
        return false;
      }
    }

    private int GetExpirationMinutes()
    {
      return int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "60");
    }
  }
}
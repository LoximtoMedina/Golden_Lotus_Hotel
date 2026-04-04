namespace backend.Features.Sessions
{
  public class Session
  {
    public int EmployeeId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
  }

  public static class SessionConstants
  {
    public const string AuthCookieName = "glh_auth_token";
  }
}


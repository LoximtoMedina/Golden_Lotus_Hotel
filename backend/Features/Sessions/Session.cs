namespace backend.Features.Sessions
{
  public class Session
  {
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string SessionKey { get; set; } = string.Empty;
    public DateTime CreationDate { get; set; }
    public DateTime ExpirationDate { get; set; }
  }

  public static class SessionConstants
  {
    public const string AuthCookieName = "glh_auth_token";
  }
}


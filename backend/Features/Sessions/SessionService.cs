namespace backend.Features.Sessions
{
  public class SessionService
  {
    // Placeholder implementation until the real sessions module is built.
    public Task<bool> ValidateTokenAsync(string? token)
    {
      return Task.FromResult(!string.IsNullOrWhiteSpace(token));
    }
  }
}
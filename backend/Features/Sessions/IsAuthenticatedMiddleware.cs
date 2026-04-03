namespace backend.Features.Sessions
{
  public class IsAuthenticatedMiddleware
  {
    private readonly RequestDelegate _next;

    public IsAuthenticatedMiddleware(RequestDelegate next)
    {
      _next = next;
    }

    public async Task InvokeAsync(HttpContext context, SessionService sessionService)
    {
      string? authorization = context.Request.Headers.Authorization;
      string? token = null;

      if (!string.IsNullOrWhiteSpace(authorization) && authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
      {
        token = authorization[7..].Trim();
      }

      bool isAuthenticated = await sessionService.ValidateTokenAsync(token);
      if (!isAuthenticated)
      {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsJsonAsync(new { message = "Unauthorized" });
        return;
      }

      await _next(context);
    }
  }
}
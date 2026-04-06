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
      var path = context.Request.Path.Value ?? string.Empty;
      if (path.StartsWith("/api/auth", StringComparison.OrdinalIgnoreCase))
      {
        await _next(context);
        return;
      }

      var token = sessionService.GetTokenFromRequest(context);
      bool isAuthenticated = await sessionService.ValidateTokenAsync(token);
      if (!isAuthenticated)
      {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsJsonAsync(new { message = "Unauthorized" });
        return;
      }

      var employee = await sessionService.GetEmployeeFromTokenAsync(token);
      if (employee is null)
      {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsJsonAsync(new { message = "Unauthorized" });
        return;
      }

      context.Items["AuthenticatedEmployee"] = employee;

      await _next(context);
    }
  }
}
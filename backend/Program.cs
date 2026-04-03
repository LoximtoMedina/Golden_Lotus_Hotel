using backend.Features.Sessions;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<SessionService>();

// Add services to the container.
builder.Services.AddControllers();

var app = builder.Build();

var apiSpecDirectory = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "..", "api"));

if (Directory.Exists(apiSpecDirectory))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(apiSpecDirectory),
        RequestPath = "/api-spec",
        ServeUnknownFileTypes = true,
    });
}

app.UseHttpsRedirection();

var protectedPrefixes = new[]
{
    "/api/clients",
    "/api/employees",
    "/api/reservations",
    "/api/rooms",
    "/api/roomtypes",
};

app.UseWhen(
    context => protectedPrefixes.Any(prefix => context.Request.Path.StartsWithSegments(prefix, StringComparison.OrdinalIgnoreCase)),
    branch => branch.UseMiddleware<IsAuthenticatedMiddleware>());

app.MapControllers();

app.Run();

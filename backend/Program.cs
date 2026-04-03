using backend.Features.Sessions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<SessionService>();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
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

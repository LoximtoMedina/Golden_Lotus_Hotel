using backend.Features.Clients;
using backend.Features.Auth;
using backend.Features.Employees;
using backend.Features.Reservations;
using backend.Features.Rooms;
using backend.Features.RoomTypes;
using backend.Features.Sessions;
using backend.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
{
    foreach (var rawLine in File.ReadAllLines(envPath))
    {
        var line = rawLine.Trim();
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#"))
        {
            continue;
        }

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0)
        {
            continue;
        }

        var key = line[..separatorIndex].Trim();
        var value = line[(separatorIndex + 1)..].Trim().Trim('"');

        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(key)))
        {
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}

var builder = WebApplication.CreateBuilder(args);
var apiSpecDirectory = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "api"));

var connectionString = builder.Configuration.GetConnectionString("ConnectionString");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Missing database connection string. Set ConnectionStrings__ConnectionString in environment variables.");
}

builder.Services.AddDbContext<AppDbContext>(
    options =>
    options.UseSqlServer(
        connectionString
        ),
    contextLifetime: ServiceLifetime.Scoped,
    optionsLifetime: ServiceLifetime.Singleton
    );

builder.Services.AddDbContextFactory<AppDbContext>(
    options => options.UseSqlServer(connectionString)
    );

//Repositories
builder.Services.AddScoped<Repository<Client>>();
builder.Services.AddScoped<Repository<Employee>>();
builder.Services.AddScoped<Repository<Reservation>>();
builder.Services.AddScoped<Repository<Room>>();
builder.Services.AddScoped<Repository<RoomType>>();
builder.Services.AddScoped<ClientService>();
builder.Services.AddScoped<EmployeeService>();
builder.Services.AddScoped<ReservationService>();
builder.Services.AddScoped<RoomService>();
builder.Services.AddScoped<RoomTypeService>();
builder.Services.AddSingleton<IAuthService, AuthService>();
builder.Services.AddScoped<SessionService>();

// Add services to the container.
builder.Services.AddControllers();

// Register built-in OpenAPI document generation.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    if (Directory.Exists(apiSpecDirectory))
    {
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(apiSpecDirectory),
            RequestPath = "/api-spec",
            ServeUnknownFileTypes = true,
        });
    }
}

app.UseHttpsRedirection();

app.UseMiddleware<IsAuthenticatedMiddleware>();

app.MapControllers();

app.Run();


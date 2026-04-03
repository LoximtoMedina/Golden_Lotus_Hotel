using backend.Features.Clients;
using backend.Features.Employees;
using backend.Features.Reservations;
using backend.Features.Rooms;
using backend.Features.RoomTypes;
using backend.Infrastructure;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(
    options => 
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("ConnectionString")
        )
    );

//Repositories
builder.Services.AddScoped<Repository<Client>>();
builder.Services.AddScoped<Repository<Employee>>();
builder.Services.AddScoped<Repository<Reservation>>();
builder.Services.AddScoped<Repository<Room>>();
builder.Services.AddScoped<Repository<RoomType>>();

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
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

app.MapControllers();

app.Run();


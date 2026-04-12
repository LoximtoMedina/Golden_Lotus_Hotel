using backend.Features.Clients;
using backend.Features.Employees;
using backend.Features.Reservations;
using backend.Features.Sessions;
using backend.Features.Rooms;
using backend.Features.RoomTypes;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Tables
        public DbSet<Client> Clients { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Session> Sessions { get; set; }

        // Telling entity framework to mind its own business and transform the Role enum to a string in the database, otherwise it would use integers 
        // and that would be a problem if we ever change the order of the enum values
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Employee>()
                .Property(e => e.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Room>()
                .Property(r => r.State)
                .HasConversion<string>();

            modelBuilder.Entity<Reservation>()
                .Property(r => r.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Reservation>()
                .Property(r => r.Charge)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Client)
                .WithMany()
                .HasForeignKey(r => r.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reservation>()
                .Navigation(r => r.Client)
                .AutoInclude();
        }
    }
}

using backend.Infrastructure;
using Microsoft.Extensions.Logging;

namespace backend.Features.Reservations
{
  public class ReservationService : CrudServiceBase<Reservation, int>
  {
    private readonly Repository<Reservation> _repository;

    public ReservationService(Repository<Reservation> repository, ILogger<ReservationService> logger) : base(logger)
    {
      _repository = repository;
    }

    public Task<List<Reservation>> GetAllAsync()
    {
      return ReadAllAsync();
    }

    public Task<Reservation> GetByIdAsync(int id)
    {
      return ReadAsync(id);
    }

    protected override Task<List<Reservation>> HandleReadAllAsync()
    {
      return _repository.GetAll();
    }

    protected override Task<Reservation> HandleReadAsync(int id)
    {
      return _repository.GetById(id);
    }

    protected override async Task HandleCreateAsync(Reservation reservation)
    {
      if (reservation.CheckOutDate <= reservation.CheckInDate)
      {
        throw new ArgumentException("Check-out date must be after check-in date.");
      }

      reservation.Active = true;
      reservation.CreationDate = DateTime.UtcNow;
      await _repository.Create(reservation);
    }

    protected override Task HandleUpdateAsync(int id, Reservation reservation)
    {
      return _repository.Update(id, reservation);
    }

    protected override Task HandleDeleteAsync(int id)
    {
      return _repository.Delete(id);
    }

    protected override Task HandleRestoreAsync(int id)
    {
      return _repository.Restore(id);
    }
  }
}
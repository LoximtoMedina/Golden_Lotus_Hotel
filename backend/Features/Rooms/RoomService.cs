using backend.Infrastructure;
using Microsoft.Extensions.Logging;

namespace backend.Features.Rooms
{
  public class RoomService : CrudServiceBase<Room, int>
  {
    private readonly Repository<Room> _repository;

    public RoomService(Repository<Room> repository, ILogger<RoomService> logger) : base(logger)
    {
      _repository = repository;
    }

    public Task<List<Room>> GetAllAsync()
    {
      return ReadAllAsync();
    }

    public Task<Room> GetByIdAsync(int id)
    {
      return ReadAsync(id);
    }

    protected override Task<List<Room>> HandleReadAllAsync()
    {
      return _repository.GetAll();
    }

    protected override Task<Room> HandleReadAsync(int id)
    {
      return _repository.GetById(id);
    }

    protected override async Task HandleCreateAsync(Room room)
    {
      if (string.IsNullOrWhiteSpace(room.Number))
      {
        throw new ArgumentException("Room number is required.");
      }

      if (string.IsNullOrWhiteSpace(room.Description))
      {
        throw new ArgumentException("Room description is required.");
      }

      room.State = State.Avaliable;
      room.Active = true;
      room.CreationDate = DateTime.UtcNow;
      await _repository.Create(room);
    }

    protected override Task HandleUpdateAsync(int id, Room room)
    {
      return _repository.Update(id, room);
    }

    protected override async Task HandleDeleteAsync(int id)
    {
      Room room = await _repository.GetById(id);
      room.State = State.Maintenance;
      room.Active = false;
      await _repository.Update(id, room);
    }

    protected override async Task HandleRestoreAsync(int id)
    {
      Room room = await _repository.GetById(id);
      room.State = State.Avaliable;
      room.Active = true;
      await _repository.Update(id, room);
    }
  }
}
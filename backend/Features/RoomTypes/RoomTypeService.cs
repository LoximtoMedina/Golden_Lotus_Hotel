using backend.Infrastructure;
using Microsoft.Extensions.Logging;

namespace backend.Features.RoomTypes
{
  public class RoomTypeService : CrudServiceBase<RoomType, int>
  {
    private readonly Repository<RoomType> _repository;

    public RoomTypeService(Repository<RoomType> repository, ILogger<RoomTypeService> logger) : base(logger)
    {
      _repository = repository;
    }

    public Task<List<RoomType>> GetAllAsync()
    {
      return ReadAllAsync();
    }

    public Task<RoomType> GetByIdAsync(int id)
    {
      return ReadAsync(id);
    }

    protected override Task<List<RoomType>> HandleReadAllAsync()
    {
      return _repository.GetAll();
    }

    protected override Task<RoomType> HandleReadAsync(int id)
    {
      return _repository.GetById(id);
    }

    protected override async Task HandleCreateAsync(RoomType roomType)
    {
      if (string.IsNullOrWhiteSpace(roomType.Description))
      {
        throw new ArgumentException("Room type description is required.");
      }

      roomType.Active = true;
      roomType.CreationDate = DateTime.UtcNow;
      await _repository.Create(roomType);
    }

    protected override Task HandleUpdateAsync(int id, RoomType roomType)
    {
      return _repository.Update(id, roomType);
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
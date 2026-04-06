using backend.Infrastructure;
using Microsoft.Extensions.Logging;

namespace backend.Features.Clients
{
  public class ClientService : CrudServiceBase<Client, int>
  {
    private readonly Repository<Client> _repository;

    public ClientService(Repository<Client> repository, ILogger<ClientService> logger) : base(logger)
    {
      _repository = repository;
    }

    public Task<List<Client>> GetAllAsync()
    {
      return ReadAllAsync();
    }

    public Task<Client> GetByIdAsync(int id)
    {
      return ReadAsync(id);
    }

    protected override Task<List<Client>> HandleReadAllAsync()
    {
      return _repository.GetAll();
    }

    protected override Task<Client> HandleReadAsync(int id)
    {
      return _repository.GetById(id);
    }

    protected override async Task HandleCreateAsync(Client client)
    {
      if (string.IsNullOrWhiteSpace(client.Name))
      {
        throw new ArgumentException("Client name is required.");
      }

      client.Active = true;
      client.CreationDate = DateTime.UtcNow;
      await _repository.Create(client);
    }

    protected override Task HandleUpdateAsync(int id, Client client)
    {
      return _repository.Update(id, client);
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
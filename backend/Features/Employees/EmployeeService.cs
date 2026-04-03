using backend.Infrastructure;
using Microsoft.Extensions.Logging;

namespace backend.Features.Employees
{
  public class EmployeeService : CrudServiceBase<Employee, int>
  {
    private readonly Repository<Employee> _repository;

    public EmployeeService(Repository<Employee> repository, ILogger<EmployeeService> logger) : base(logger)
    {
      _repository = repository;
    }

    public Task<List<Employee>> GetAllAsync()
    {
      return ReadAllAsync();
    }

    public Task<Employee> GetByIdAsync(int id)
    {
      return ReadAsync(id);
    }

    protected override Task<List<Employee>> HandleReadAllAsync()
    {
      return _repository.GetAll();
    }

    protected override Task<Employee> HandleReadAsync(int id)
    {
      return _repository.GetById(id);
    }

    protected override async Task HandleCreateAsync(Employee employee)
    {
      if (string.IsNullOrWhiteSpace(employee.Name))
      {
        throw new ArgumentException("Employee name is required.");
      }

      // Set default values for new employees
      employee.Active = true;
      employee.CreationDate = DateTime.UtcNow;
      await _repository.Create(employee);
    }

    protected override Task HandleUpdateAsync(int id, Employee employee)
    {
      return _repository.Update(id, employee);
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
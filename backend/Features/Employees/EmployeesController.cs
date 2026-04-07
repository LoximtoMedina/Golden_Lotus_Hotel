using backend.Contracts;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace backend.Features.Employees
{
  [ApiController]
  [Route("api/employees")]
  public class EmployeesController : ControllerBase
  {
    private readonly EmployeeService _service;

    public EmployeesController(EmployeeService service)
    {
      _service = service;
    }

    [HttpPost("create")]
    [ProducesResponseType(typeof(EmployeeDataResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<EmployeeDataResponse>> Create(EmployeeCreateInput input)
    {
      try
      {
        var employee = new Employee
        {
          IdentityNumber = input.IdentityNumber,
          Phone = input.Phone,
          Salary = (decimal)input.Salary,
          Name = input.Name,
          Email = input.Email,
          AccessKey = input.AccessKey,
          Role = MapRole(input.Role),
        };

        await _service.CreateAsync(employee);

        return Ok(new EmployeeDataResponse
        {
          Status = Status.Success,
          Data = MapEmployee(employee),
        });
      }
      catch
      {
        return Ok(new EmployeeDataResponse { Status = Status.InternalError });
      }
    }

    [HttpPost("update")]
    [ProducesResponseType(typeof(EmployeeDataResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<EmployeeDataResponse>> Update(EmployeeUpdateInput input)
    {
      try
      {
        var employee = await _service.GetByIdAsync(input.EmployeeId);

        if (!string.IsNullOrWhiteSpace(input.IdentityNumber)) employee.IdentityNumber = input.IdentityNumber;
        if (!string.IsNullOrWhiteSpace(input.Phone)) employee.Phone = input.Phone;
        if (input.Salary > 0) employee.Salary = (decimal)input.Salary;
        if (!string.IsNullOrWhiteSpace(input.Name)) employee.Name = input.Name;
        if (!string.IsNullOrWhiteSpace(input.Email)) employee.Email = input.Email;
        if (!string.IsNullOrWhiteSpace(input.AccessKey)) employee.AccessKey = input.AccessKey;
        employee.Role = MapRole(input.Role);
        employee.Active = input.Active;

        await _service.UpdateAsync(input.EmployeeId, employee);

        return Ok(new EmployeeDataResponse
        {
          Status = Status.Success,
          Data = MapEmployee(employee),
        });
      }
      catch (Exception ex)
      {
        return Ok(new EmployeeDataResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError });
      }
    }

    [HttpPost("delete")]
    [ProducesResponseType(typeof(ResultResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ResultResponse>> Delete(DeleteEmployeeInput input)
    {
      try
      {
        await _service.DeleteAsync(input.EmployeeId);
        return Ok(new ResultResponse { Status = Status.Success, Result = true });
      }
      catch (Exception ex)
      {
        return Ok(new ResultResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError, Result = false });
      }
    }

    [HttpPost("restore")]
    [ProducesResponseType(typeof(ResultResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ResultResponse>> Restore(RestoreEmployeeInput input)
    {
      try
      {
        await _service.RestoreAsync(input.EmployeeId);
        return Ok(new ResultResponse { Status = Status.Success, Result = true });
      }
      catch (Exception ex)
      {
        return Ok(new ResultResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError, Result = false });
      }
    }

    [HttpPost("get")]
    [ProducesResponseType(typeof(EmployeeGetResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<EmployeeGetResponse>> Get(EmployeeGetInput input)
    {
      try
      {
        var ids = input.EmployeeIds?.ToHashSet() ?? [];
        var data = (await _service.GetAllAsync())
          .Where(e => ids.Contains(e.Id))
          .Select(MapEmployee)
          .ToList();

        return Ok(new EmployeeGetResponse
        {
          Status = Status.Success,
          Data = data,
        });
      }
      catch
      {
        return Ok(new EmployeeGetResponse { Status = Status.InternalError, Data = [] });
      }
    }

    [HttpPost("list")]
    [ProducesResponseType(typeof(EmployeeListResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<EmployeeListResponse>> List(EmployeeListInput input)
    {
      try
      {
        IEnumerable<Employee> query = await _service.GetAllAsync();

        if (!input.IncludeDeleted)
        {
          query = query.Where(e => e.Active);
        }

        if (input.Search is not null && !string.IsNullOrWhiteSpace(input.Search.Query))
        {
          var q = input.Search.Query.Trim();
          var searchIn = input.Search.SearchIn ?? [];

          query = query.Where(e =>
            (searchIn.Contains(SearchIn.IdentityNumber) && e.IdentityNumber.Contains(q, StringComparison.OrdinalIgnoreCase)) ||
            (searchIn.Contains(SearchIn.Phone) && e.Phone.Contains(q, StringComparison.OrdinalIgnoreCase)) ||
            (searchIn.Contains(SearchIn.Name) && e.Name.Contains(q, StringComparison.OrdinalIgnoreCase)) ||
            (searchIn.Contains(SearchIn.Email) && e.Email.Contains(q, StringComparison.OrdinalIgnoreCase)) ||
            (searchIn.Contains(SearchIn.Role) && e.Role.ToString().Contains(q, StringComparison.OrdinalIgnoreCase))
          );
        }

        if (input.Filters is not null)
        {
          query = query.Where(e => e.Role == MapRole(input.Filters.Role) && e.Active == input.Filters.Active);
        }

        query = (input.Sort?.By, input.Sort?.Order) switch
        {
          (SortBy.Name, SortOrder.Asc) => query.OrderBy(e => e.Name),
          (SortBy.Name, _) => query.OrderByDescending(e => e.Name),
          (SortBy.Role, SortOrder.Asc) => query.OrderBy(e => e.Role),
          (SortBy.Role, _) => query.OrderByDescending(e => e.Role),
          (SortBy.CreationDate, SortOrder.Asc) => query.OrderBy(e => e.CreationDate),
          _ => query.OrderByDescending(e => e.CreationDate),
        };

        var total = query.Count();
        var pageData = query
          .Skip(input.Page * input.Count)
          .Take(input.Count)
          .Select(MapEmployee)
          .ToList();

        return Ok(new EmployeeListResponse
        {
          Status = Status.Success,
          Data = pageData,
          Total = total,
          Page = input.Page,
        });
      }
      catch
      {
        return Ok(new EmployeeListResponse { Status = Status.InternalError, Data = [], Total = 0, Page = input.Page });
      }
    }

    private static Role MapRole(EmployeeCreateInputRole role)
    {
      return role switch
      {
        EmployeeCreateInputRole.Receptionist => Role.Receptionist,
        EmployeeCreateInputRole.Housekeeper => Role.Housekeeper,
        EmployeeCreateInputRole.Maintenance => Role.Maintenance,
        _ => Role.Manager,
      };
    }

    private static Role MapRole(EmployeeUpdateInputRole role)
    {
      return role switch
      {
        EmployeeUpdateInputRole.Receptionist => Role.Receptionist,
        EmployeeUpdateInputRole.Housekeeper => Role.Housekeeper,
        EmployeeUpdateInputRole.Maintenance => Role.Maintenance,
        _ => Role.Manager,
      };
    }

    private static Role MapRole(FiltersRole role)
    {
      return role switch
      {
        FiltersRole.Receptionist => Role.Receptionist,
        FiltersRole.Housekeeper => Role.Housekeeper,
        FiltersRole.Maintenance => Role.Maintenance,
        _ => Role.Manager,
      };
    }

    private static backend.Contracts.Employee MapEmployee(Employee entity)
    {
      return new backend.Contracts.Employee
      {
        Id = entity.Id,
        IdentityNumber = entity.IdentityNumber,
        Phone = entity.Phone,
        Salary = (double)entity.Salary,
        Name = entity.Name,
        Email = entity.Email,
        Role = entity.Role switch
        {
          Role.Receptionist => EmployeeRole.Receptionist,
          Role.Housekeeper => EmployeeRole.Housekeeper,
          Role.Maintenance => EmployeeRole.Maintenance,
          _ => EmployeeRole.Manager,
        },
        Active = entity.Active,
        CreationDate = new DateTimeOffset(entity.CreationDate),
      };
    }

    private static bool IsNotFound(Exception ex)
    {
      if (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
      {
        return true;
      }

      return ex.InnerException is not null && IsNotFound(ex.InnerException);
    }

    public class DeleteEmployeeInput
    {
      [JsonPropertyName("employeeId")]
      public int EmployeeId { get; set; }
    }

    public class RestoreEmployeeInput
    {
      [JsonPropertyName("employeeId")]
      public int EmployeeId { get; set; }
    }
  }
}

using backend.Contracts;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace backend.Features.Clients
{
  [ApiController]
  [Route("api/clients")]
  public class ClientsController : ControllerBase
  {
    private readonly ClientService _service;

    public ClientsController(ClientService service)
    {
      _service = service;
    }

    [HttpPost("create")]
    [ProducesResponseType(typeof(ClientDataResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ClientDataResponse>> Create(ClientCreateInput input)
    {
      try
      {
        var client = new Client
        {
          Name = input.Name,
          IdentityNumber = input.IdentityNumber,
          Phone = input.Phone,
        };

        await _service.CreateAsync(client);

        return Ok(new ClientDataResponse
        {
          Status = Status.Success,
          Data = MapClient(client),
        });
      }
      catch
      {
        return Ok(new ClientDataResponse { Status = Status.InternalError });
      }
    }

    [HttpPost("update")]
    [ProducesResponseType(typeof(ClientDataResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ClientDataResponse>> Update(ClientUpdateInput input)
    {
      try
      {
        var client = await _service.GetByIdAsync(input.ClientId);

        if (!string.IsNullOrWhiteSpace(input.Name)) client.Name = input.Name;
        if (!string.IsNullOrWhiteSpace(input.IdentityNumber)) client.IdentityNumber = input.IdentityNumber;
        if (!string.IsNullOrWhiteSpace(input.Phone)) client.Phone = input.Phone;
        client.Active = input.Active;

        await _service.UpdateAsync(input.ClientId, client);

        return Ok(new ClientDataResponse
        {
          Status = Status.Success,
          Data = MapClient(client),
        });
      }
      catch (Exception ex)
      {
        return Ok(new ClientDataResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError });
      }
    }

    [HttpPost("delete")]
    [ProducesResponseType(typeof(ResultResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ResultResponse>> Delete(DeleteClientInput input)
    {
      try
      {
        await _service.DeleteAsync(input.ClientId);
        return Ok(new ResultResponse { Status = Status.Success, Result = true });
      }
      catch (Exception ex)
      {
        return Ok(new ResultResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError, Result = false });
      }
    }

    [HttpPost("restore")]
    [ProducesResponseType(typeof(ResultResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ResultResponse>> Restore(RestoreClientInput input)
    {
      try
      {
        await _service.RestoreAsync(input.ClientId);
        return Ok(new ResultResponse { Status = Status.Success, Result = true });
      }
      catch (Exception ex)
      {
        return Ok(new ResultResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError, Result = false });
      }
    }

    [HttpPost("get")]
    [ProducesResponseType(typeof(ClientGetResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ClientGetResponse>> Get(ClientGetInput input)
    {
      try
      {
        var ids = input.ClientIds?.ToHashSet() ?? [];
        var data = (await _service.GetAllAsync())
          .Where(c => ids.Contains(c.Id))
          .Select(MapClient)
          .ToList();

        return Ok(new ClientGetResponse
        {
          Status = Status.Success,
          Data = data,
        });
      }
      catch
      {
        return Ok(new ClientGetResponse { Status = Status.InternalError, Data = [] });
      }
    }

    [HttpPost("list")]
    [ProducesResponseType(typeof(ClientListResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ClientListResponse>> List(ClientListInput input)
    {
      try
      {
        IEnumerable<Client> query = await _service.GetAllAsync();

        if (!input.IncludeDeleted)
        {
          query = query.Where(c => c.Active);
        }

        if (input.Search is not null && !string.IsNullOrWhiteSpace(input.Search.Query))
        {
          var q = input.Search.Query.Trim();
          var searchFields = input.Search.SearchIn ?? [];

          query = query.Where(c =>
            (searchFields.Contains(searchIn.Name) && c.Name.Contains(q, StringComparison.OrdinalIgnoreCase)) ||
            (searchFields.Contains(searchIn.IdentityNumber) && c.IdentityNumber.Contains(q, StringComparison.OrdinalIgnoreCase)) ||
            (searchFields.Contains(searchIn.Phone) && c.Phone.Contains(q, StringComparison.OrdinalIgnoreCase))
          );
        }

        query = (input.Sort?.By, input.Sort?.Order) switch
        {
          (Sort2By.Name, Sort2Order.Asc) => query.OrderBy(c => c.Name),
          (Sort2By.Name, _) => query.OrderByDescending(c => c.Name),
          (Sort2By.CreationDate, Sort2Order.Asc) => query.OrderBy(c => c.CreationDate),
          _ => query.OrderByDescending(c => c.CreationDate),
        };

        var total = query.Count();
        var pageData = query
          .Skip(input.Page * input.Count)
          .Take(input.Count)
          .Select(MapClient)
          .ToList();

        return Ok(new ClientListResponse
        {
          Status = Status.Success,
          Data = pageData,
          Total = total,
          Page = input.Page,
        });
      }
      catch
      {
        return Ok(new ClientListResponse { Status = Status.InternalError, Data = [], Total = 0, Page = input.Page });
      }
    }

    private static backend.Contracts.Client MapClient(Client entity)
    {
      return new backend.Contracts.Client
      {
        Id = entity.Id,
        Name = entity.Name,
        IdentityNumber = entity.IdentityNumber,
        Phone = entity.Phone,
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

    public class DeleteClientInput
    {
      [JsonPropertyName("clientId")]
      public int ClientId { get; set; }
    }

    public class RestoreClientInput
    {
      [JsonPropertyName("clientId")]
      public int ClientId { get; set; }
    }
  }
}

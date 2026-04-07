using backend.Contracts;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace backend.Features.RoomTypes
{
  [ApiController]
  [Route("api/room-types")]
  public class RoomTypesController : ControllerBase
  {
    private readonly RoomTypeService _service;

    public RoomTypesController(RoomTypeService service)
    {
      _service = service;
    }

    [HttpPost("create")]
    [ProducesResponseType(typeof(RoomTypeDataResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<RoomTypeDataResponse>> Create(RoomTypeCreateInput input)
    {
      try
      {
        var roomType = new RoomType
        {
          Description = input.Description,
          MaxOccupancy = input.MaxOccupancy,
          Price = (float)input.Price,
        };

        await _service.CreateAsync(roomType);

        return Ok(new RoomTypeDataResponse
        {
          Status = Status.Success,
          Data = MapRoomType(roomType),
        });
      }
      catch
      {
        return Ok(new RoomTypeDataResponse { Status = Status.InternalError });
      }
    }

    [HttpPost("update")]
    [ProducesResponseType(typeof(RoomTypeDataResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<RoomTypeDataResponse>> Update(RoomTypeUpdateInput input)
    {
      try
      {
        var roomType = await _service.GetByIdAsync(input.RoomTypeId);

        if (!string.IsNullOrWhiteSpace(input.Description)) roomType.Description = input.Description;
        if (input.MaxOccupancy > 0) roomType.MaxOccupancy = input.MaxOccupancy;
        if (input.Price > 0) roomType.Price = (float)input.Price;
        roomType.Active = input.Active;

        await _service.UpdateAsync(input.RoomTypeId, roomType);

        return Ok(new RoomTypeDataResponse
        {
          Status = Status.Success,
          Data = MapRoomType(roomType),
        });
      }
      catch (Exception ex)
      {
        return Ok(new RoomTypeDataResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError });
      }
    }

    [HttpPost("delete")]
    [ProducesResponseType(typeof(ResultResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ResultResponse>> Delete(DeleteRoomTypeInput input)
    {
      try
      {
        await _service.DeleteAsync(input.RoomTypeId);
        return Ok(new ResultResponse { Status = Status.Success, Result = true });
      }
      catch (Exception ex)
      {
        return Ok(new ResultResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError, Result = false });
      }
    }

    [HttpPost("restore")]
    [ProducesResponseType(typeof(ResultResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ResultResponse>> Restore(RestoreRoomTypeInput input)
    {
      try
      {
        await _service.RestoreAsync(input.RoomTypeId);
        return Ok(new ResultResponse { Status = Status.Success, Result = true });
      }
      catch (Exception ex)
      {
        return Ok(new ResultResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError, Result = false });
      }
    }

    [HttpPost("get")]
    [ProducesResponseType(typeof(RoomTypeGetResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<RoomTypeGetResponse>> Get(RoomTypeGetInput input)
    {
      try
      {
        var ids = input.RoomTypeIds?.ToHashSet() ?? [];
        var data = (await _service.GetAllAsync())
          .Where(rt => ids.Contains(rt.Id))
          .Select(MapRoomType)
          .ToList();

        return Ok(new RoomTypeGetResponse
        {
          Status = Status.Success,
          Data = data,
        });
      }
      catch
      {
        return Ok(new RoomTypeGetResponse { Status = Status.InternalError, Data = [] });
      }
    }

    [HttpPost("list")]
    [ProducesResponseType(typeof(RoomTypeListResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<RoomTypeListResponse>> List(RoomTypeListInput input)
    {
      try
      {
        IEnumerable<RoomType> query = await _service.GetAllAsync();

        if (!input.IncludeDeleted)
        {
          query = query.Where(rt => rt.Active);
        }

        if (input.Search is not null && !string.IsNullOrWhiteSpace(input.Search.Query))
        {
          var q = input.Search.Query.Trim();
          query = query.Where(rt => rt.Description.Contains(q, StringComparison.OrdinalIgnoreCase));
        }

        query = (input.Sort?.By, input.Sort?.Order) switch
        {
          (Sort3By.Description, Sort3Order.Asc) => query.OrderBy(rt => rt.Description),
          (Sort3By.Description, _) => query.OrderByDescending(rt => rt.Description),
          (Sort3By.MaxOccupancy, Sort3Order.Asc) => query.OrderBy(rt => rt.MaxOccupancy),
          (Sort3By.MaxOccupancy, _) => query.OrderByDescending(rt => rt.MaxOccupancy),
          (Sort3By.Price, Sort3Order.Asc) => query.OrderBy(rt => rt.Price),
          (Sort3By.Price, _) => query.OrderByDescending(rt => rt.Price),
          (Sort3By.CreationDate, Sort3Order.Asc) => query.OrderBy(rt => rt.CreationDate),
          _ => query.OrderByDescending(rt => rt.CreationDate),
        };

        var total = query.Count();
        var pageData = query
          .Skip(input.Page * input.Count)
          .Take(input.Count)
          .Select(MapRoomType)
          .ToList();

        return Ok(new RoomTypeListResponse
        {
          Status = Status.Success,
          Data = pageData,
          Total = total,
          Page = input.Page,
        });
      }
      catch
      {
        return Ok(new RoomTypeListResponse { Status = Status.InternalError, Data = [], Total = 0, Page = input.Page });
      }
    }

    private static backend.Contracts.RoomType MapRoomType(RoomType entity)
    {
      return new backend.Contracts.RoomType
      {
        Id = entity.Id,
        Description = entity.Description,
        MaxOccupancy = entity.MaxOccupancy,
        Price = entity.Price,
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

    public class DeleteRoomTypeInput
    {
      [JsonPropertyName("roomTypeId")]
      public int RoomTypeId { get; set; }
    }

    public class RestoreRoomTypeInput
    {
      [JsonPropertyName("roomTypeId")]
      public int RoomTypeId { get; set; }
    }
  }
}

using backend.Contracts;
using backend.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace backend.Features.Rooms
{
  [ApiController]
  [Route("api/rooms")]
  public class RoomsController : ControllerBase
  {
    private readonly RoomService _service;

    public RoomsController(RoomService service)
    {
      _service = service;
    }

    [HttpPost("create")]
    [ProducesResponseType(typeof(RoomDataResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<RoomDataResponse>> Create(RoomCreateInput input)
    {
      try
      {
        var room = new Room
        {
          Number = input.Number,
          RoomTypeId = input.RoomTypeId,
          Description = input.Description,
          State = MapState(input.State),
          Active = true,
        };

        await _service.CreateAsync(room);

        return Ok(new RoomDataResponse
        {
          Status = Status.Success,
          Data = MapRoom(room),
        });
      }
      catch
      {
        return Ok(new RoomDataResponse { Status = Status.InternalError });
      }
    }

    [HttpPost("update")]
    [ProducesResponseType(typeof(RoomDataResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<RoomDataResponse>> Update(RoomUpdateInput input)
    {
      try
      {
        var room = await _service.GetByIdAsync(input.RoomId);

        if (!string.IsNullOrWhiteSpace(input.Number)) room.Number = input.Number;
        if (input.RoomTypeId > 0) room.RoomTypeId = input.RoomTypeId;
        if (!string.IsNullOrWhiteSpace(input.Description)) room.Description = input.Description;
        room.State = MapState(input.State);
        room.Active = input.Active;

        await _service.UpdateAsync(input.RoomId, room);

        return Ok(new RoomDataResponse
        {
          Status = Status.Success,
          Data = MapRoom(room),
        });
      }
      catch (Exception ex)
      {
        return Ok(new RoomDataResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError });
      }
    }

    [HttpPost("delete")]
    [ProducesResponseType(typeof(ResultResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ResultResponse>> Delete(DeleteRoomInput input)
    {
      try
      {
        await _service.DeleteAsync(input.RoomId);
        return Ok(new ResultResponse { Status = Status.Success, Result = true });
      }
      catch (Exception ex)
      {
        return Ok(new ResultResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError, Result = false });
      }
    }

    [HttpPost("restore")]
    [ProducesResponseType(typeof(ResultResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ResultResponse>> Restore(RestoreRoomInput input)
    {
      try
      {
        await _service.RestoreAsync(input.RoomId);
        return Ok(new ResultResponse { Status = Status.Success, Result = true });
      }
      catch (Exception ex)
      {
        return Ok(new ResultResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError, Result = false });
      }
    }

    [HttpPost("get")]
    [ProducesResponseType(typeof(RoomGetResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<RoomGetResponse>> Get(RoomGetInput input)
    {
      try
      {
        var ids = input.RoomIds?.ToHashSet() ?? [];
        var data = (await _service.GetAllAsync())
          .Where(r => ids.Contains(r.Id))
          .Select(MapRoom)
          .ToList();

        return Ok(new RoomGetResponse
        {
          Status = Status.Success,
          Data = data,
        });
      }
      catch
      {
        return Ok(new RoomGetResponse { Status = Status.InternalError, Data = [] });
      }
    }

    [HttpPost("list")]
    [ProducesResponseType(typeof(RoomListResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<RoomListResponse>> List(RoomListInput input)
    {
      try
      {
        IEnumerable<Room> query = await _service.GetAllAsync();

        if (!input.IncludeDeleted)
        {
          query = query.Where(r => r.Active);
        }

        if (input.Search is not null && !string.IsNullOrWhiteSpace(input.Search.Query))
        {
          var q = input.Search.Query.Trim();
          var searchIn = input.Search.SearchIn ?? [];

          query = query.Where(r =>
            (searchIn.Contains(searchIn3.Number) && r.Number.Contains(q, StringComparison.OrdinalIgnoreCase)) ||
            (searchIn.Contains(searchIn3.Description) && r.Description.Contains(q, StringComparison.OrdinalIgnoreCase)) ||
            (searchIn.Contains(searchIn3.State) && r.State.ToString().Contains(q, StringComparison.OrdinalIgnoreCase))
          );
        }

        if (input.Filters is not null)
        {
          query = query.Where(r =>
            r.RoomTypeId == input.Filters.RoomTypeId &&
            r.State == MapState(input.Filters.State) &&
            r.Active == input.Filters.Active
          );
        }

        query = (input.Sort?.By, input.Sort?.Order) switch
        {
          (Sort4By.Number, Sort4Order.Asc) => query.OrderBy(r => r.Number),
          (Sort4By.Number, _) => query.OrderByDescending(r => r.Number),
          (Sort4By.State, Sort4Order.Asc) => query.OrderBy(r => r.State),
          (Sort4By.State, _) => query.OrderByDescending(r => r.State),
          (Sort4By.CreationDate, Sort4Order.Asc) => query.OrderBy(r => r.CreationDate),
          _ => query.OrderByDescending(r => r.CreationDate),
        };

        var total = query.Count();
        var pageData = query
          .Skip(input.Page * input.Count)
          .Take(input.Count)
          .Select(MapRoom)
          .Select(room => FieldSelector.Project(room, input.Fields))
          .ToList();

        return Ok(new
        {
          Status = Status.Success,
          Data = pageData,
          Total = total,
          Page = input.Page,
        });
      }
      catch
      {
        return Ok(new RoomListResponse { Status = Status.InternalError, Data = [], Total = 0, Page = input.Page });
      }
    }

    private static State MapState(RoomCreateInputState state)
    {
      return state switch
      {
        RoomCreateInputState.Occupied => State.Occupied,
        RoomCreateInputState.Maintenance => State.Maintenance,
        _ => State.Avaliable,
      };
    }

    private static State MapState(RoomUpdateInputState state)
    {
      return state switch
      {
        RoomUpdateInputState.Occupied => State.Occupied,
        RoomUpdateInputState.Maintenance => State.Maintenance,
        _ => State.Avaliable,
      };
    }

    private static State MapState(Filters2State state)
    {
      return state switch
      {
        Filters2State.Occupied => State.Occupied,
        Filters2State.Maintenance => State.Maintenance,
        _ => State.Avaliable,
      };
    }

    private static RoomState MapState(State state)
    {
      return state switch
      {
        State.Occupied => RoomState.Occupied,
        State.Maintenance => RoomState.Maintenance,
        _ => RoomState.Avaliable,
      };
    }

    private static backend.Contracts.Room MapRoom(Room entity)
    {
      return new backend.Contracts.Room
      {
        Id = entity.Id,
        Number = entity.Number,
        RoomTypeId = entity.RoomTypeId,
        Description = entity.Description,
        State = MapState(entity.State),
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

    public class DeleteRoomInput
    {
      [JsonPropertyName("roomId")]
      public int RoomId { get; set; }
    }

    public class RestoreRoomInput
    {
      [JsonPropertyName("roomId")]
      public int RoomId { get; set; }
    }
  }
}

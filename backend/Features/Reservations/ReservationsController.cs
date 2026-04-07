using backend.Contracts;
using backend.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace backend.Features.Reservations
{
  [ApiController]
  [Route("api/reservations")]
  public class ReservationsController : ControllerBase
  {
    private readonly ReservationService _service;

    public ReservationsController(ReservationService service)
    {
      _service = service;
    }

    [HttpPost("create")]
    [ProducesResponseType(typeof(ReservationDataResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ReservationDataResponse>> Create(ReservationCreateInput input)
    {
      try
      {
        var reservation = new Reservation
        {
          ClientId = input.ClientId,
          RoomId = input.RoomId,
          Status = MapStatus(input.Status),
          CheckInDate = input.CheckInDate.UtcDateTime,
          CheckOutDate = input.CheckOutDate.UtcDateTime,
          Charge = (float)input.Charge,
          Active = true,
        };

        await _service.CreateAsync(reservation);

        return Ok(new ReservationDataResponse
        {
          Status = Status.Success,
          Data = MapReservation(reservation),
        });
      }
      catch
      {
        return Ok(new ReservationDataResponse { Status = Status.InternalError });
      }
    }

    [HttpPost("update")]
    [ProducesResponseType(typeof(ReservationDataResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ReservationDataResponse>> Update(ReservationUpdateInput input)
    {
      try
      {
        var reservation = await _service.GetByIdAsync(input.ReservationId);

        if (input.ClientId > 0) reservation.ClientId = input.ClientId;
        if (input.RoomId > 0) reservation.RoomId = input.RoomId;
        reservation.Status = MapStatus(input.Status);
        if (input.CheckInDate != default) reservation.CheckInDate = input.CheckInDate.UtcDateTime;
        if (input.CheckOutDate != default) reservation.CheckOutDate = input.CheckOutDate.UtcDateTime;
        if (input.Charge > 0) reservation.Charge = (float)input.Charge;
        reservation.Active = input.Active;

        await _service.UpdateAsync(input.ReservationId, reservation);

        return Ok(new ReservationDataResponse
        {
          Status = Status.Success,
          Data = MapReservation(reservation),
        });
      }
      catch (Exception ex)
      {
        return Ok(new ReservationDataResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError });
      }
    }

    [HttpPost("delete")]
    [ProducesResponseType(typeof(ResultResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ResultResponse>> Delete(DeleteReservationInput input)
    {
      try
      {
        await _service.DeleteAsync(input.ReservationId);
        return Ok(new ResultResponse { Status = Status.Success, Result = true });
      }
      catch (Exception ex)
      {
        return Ok(new ResultResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError, Result = false });
      }
    }

    [HttpPost("restore")]
    [ProducesResponseType(typeof(ResultResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ResultResponse>> Restore(RestoreReservationInput input)
    {
      try
      {
        await _service.RestoreAsync(input.ReservationId);
        return Ok(new ResultResponse { Status = Status.Success, Result = true });
      }
      catch (Exception ex)
      {
        return Ok(new ResultResponse { Status = IsNotFound(ex) ? Status.NotFound : Status.InternalError, Result = false });
      }
    }

    [HttpPost("get")]
    [ProducesResponseType(typeof(ReservationGetResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ReservationGetResponse>> Get(ReservationGetInput input)
    {
      try
      {
        var ids = input.ReservationIds?.ToHashSet() ?? [];
        var data = (await _service.GetAllAsync())
          .Where(r => ids.Contains(r.Id))
          .Select(MapReservation)
          .ToList();

        return Ok(new ReservationGetResponse
        {
          Status = Status.Success,
          Data = data,
        });
      }
      catch
      {
        return Ok(new ReservationGetResponse { Status = Status.InternalError, Data = [] });
      }
    }

    [HttpPost("list")]
    [ProducesResponseType(typeof(ReservationListResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ReservationListResponse>> List(ReservationListInput input)
    {
      try
      {
        IEnumerable<Reservation> query = await _service.GetAllAsync();

        if (!input.IncludeDeleted)
        {
          query = query.Where(r => r.Active);
        }

        if (input.Search is not null && !string.IsNullOrWhiteSpace(input.Search.Query))
        {
          var q = input.Search.Query.Trim();
          query = query.Where(r => r.Status.ToString().Contains(q, StringComparison.OrdinalIgnoreCase));
        }

        if (input.Filters is not null)
        {
          query = query.Where(r =>
            r.ClientId == input.Filters.ClientId &&
            r.RoomId == input.Filters.RoomId &&
            r.Status == MapStatus(input.Filters.Status) &&
            r.Active == input.Filters.Active
          );
        }

        query = (input.Sort?.By, input.Sort?.Order) switch
        {
          (Sort5By.CheckInDate, Sort5Order.Asc) => query.OrderBy(r => r.CheckInDate),
          (Sort5By.CheckInDate, _) => query.OrderByDescending(r => r.CheckInDate),
          (Sort5By.CheckOutDate, Sort5Order.Asc) => query.OrderBy(r => r.CheckOutDate),
          (Sort5By.CheckOutDate, _) => query.OrderByDescending(r => r.CheckOutDate),
          (Sort5By.Status, Sort5Order.Asc) => query.OrderBy(r => r.Status),
          (Sort5By.Status, _) => query.OrderByDescending(r => r.Status),
          (Sort5By.CreationDate, Sort5Order.Asc) => query.OrderBy(r => r.CreationDate),
          _ => query.OrderByDescending(r => r.CreationDate),
        };

        var total = query.Count();
        var pageData = query
          .Skip(input.Page * input.Count)
          .Take(input.Count)
          .Select(MapReservation)
          .Select(reservation => FieldSelector.Project(reservation, input.Fields))
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
        return Ok(new ReservationListResponse { Status = Status.InternalError, Data = [], Total = 0, Page = input.Page });
      }
    }

    private static ReservationStatus MapStatus(ReservationCreateInputStatus status)
    {
      return status switch
      {
        ReservationCreateInputStatus.Confirmed => ReservationStatus.Confirmed,
        ReservationCreateInputStatus.CheckedIn => ReservationStatus.CheckedIn,
        ReservationCreateInputStatus.CheckedOut => ReservationStatus.CheckedOut,
        ReservationCreateInputStatus.Cancelled => ReservationStatus.Cancelled,
        _ => ReservationStatus.Pending,
      };
    }

    private static ReservationStatus MapStatus(ReservationUpdateInputStatus status)
    {
      return status switch
      {
        ReservationUpdateInputStatus.Confirmed => ReservationStatus.Confirmed,
        ReservationUpdateInputStatus.CheckedIn => ReservationStatus.CheckedIn,
        ReservationUpdateInputStatus.CheckedOut => ReservationStatus.CheckedOut,
        ReservationUpdateInputStatus.Cancelled => ReservationStatus.Cancelled,
        _ => ReservationStatus.Pending,
      };
    }

    private static ReservationStatus MapStatus(Filters3Status status)
    {
      return status switch
      {
        Filters3Status.Confirmed => ReservationStatus.Confirmed,
        Filters3Status.CheckedIn => ReservationStatus.CheckedIn,
        Filters3Status.CheckedOut => ReservationStatus.CheckedOut,
        Filters3Status.Cancelled => ReservationStatus.Cancelled,
        _ => ReservationStatus.Pending,
      };
    }

    private static backend.Contracts.ReservationStatus MapStatus(ReservationStatus status)
    {
      return status switch
      {
        ReservationStatus.Confirmed => backend.Contracts.ReservationStatus.Confirmed,
        ReservationStatus.CheckedIn => backend.Contracts.ReservationStatus.CheckedIn,
        ReservationStatus.CheckedOut => backend.Contracts.ReservationStatus.CheckedOut,
        ReservationStatus.Cancelled => backend.Contracts.ReservationStatus.Cancelled,
        _ => backend.Contracts.ReservationStatus.Pending,
      };
    }

    private static backend.Contracts.Reservation MapReservation(Reservation entity)
    {
      return new backend.Contracts.Reservation
      {
        Id = entity.Id,
        ClientId = entity.ClientId,
        RoomId = entity.RoomId,
        Status = MapStatus(entity.Status),
        CheckInDate = new DateTimeOffset(entity.CheckInDate),
        CheckOutDate = new DateTimeOffset(entity.CheckOutDate),
        Charge = entity.Charge,
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

    public class DeleteReservationInput
    {
      [JsonPropertyName("reservationId")]
      public int ReservationId { get; set; }
    }

    public class RestoreReservationInput
    {
      [JsonPropertyName("reservationId")]
      public int ReservationId { get; set; }
    }
  }
}

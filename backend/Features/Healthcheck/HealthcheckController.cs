using backend.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Healthcheck
{
  [ApiController]
  [Route("api/[controller]")]
  public class HealthcheckController : ControllerBase
  {
    [HttpGet("ping")]
    [ProducesResponseType(typeof(HealthcheckResponse), StatusCodes.Status200OK)]
    public ActionResult<HealthcheckResponse> Ping()
    {
      return Ok(new HealthcheckResponse
      {
        Status = Status.Success,
        Message = "pong",
      });
    }
  }
}
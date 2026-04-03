using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Healthcheck
{
  [ApiController]
  [Route("api/[controller]")]
  public class HealthcheckController : ControllerBase
  {
    [HttpGet("ping")]
    public IActionResult Ping()
    {
      return Ok(new
      {
        status = "success",
        message = "pong",
      });
    }
  }
}
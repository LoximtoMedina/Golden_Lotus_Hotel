using Microsoft.AspNetCore.Mvc;

namespace backend.Features.Test
{
  [ApiController]
  [Route("api/[controller]")]
  public class TestController : ControllerBase
  {
    [HttpGet("ping")]
    public IActionResult Ping()
    {
      return Ok(new
      {
        status = "success",
        message = "Backend is running",
      });
    }
  }
}
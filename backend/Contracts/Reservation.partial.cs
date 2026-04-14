namespace backend.Contracts
{
  public partial class Reservation
  {
    public Client? Client { get; set; }
    public Room? Room { get; set; }
  }
}
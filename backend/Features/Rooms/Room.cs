namespace backend.Features.Rooms
{
    public class Room
    {
        public int Id { get; set; }
        public string Number { get; set; }
        public int RoomTypeId { get; set; }
        public State Active { get; set; }
        public DateTime CreationDate { get; set; }
    }
}

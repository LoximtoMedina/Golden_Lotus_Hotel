namespace backend.Features.Rooms
{
    public class Room
    {
        public int Id { get; set; }
        public string Number { get; set; }
        public int RoomTypeId { get; set; }
        public string Description { get; set; }
        public State State { get; set; }
        public bool Active { get; set; }
        public DateTime CreationDate { get; set; }
    }
}

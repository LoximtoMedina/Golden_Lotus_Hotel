namespace backend.Features.RoomTypes
{
    public class RoomType
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public float Price { get; set; }
        public int MaxOccupancy { get; set; }
        public bool Active { get; set; }
        public DateTime CreationDate { get; set; }
    }
}

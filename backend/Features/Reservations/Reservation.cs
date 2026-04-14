using backend.Features.Rooms;

namespace backend.Features.Reservations
{
    public class Reservation
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public backend.Features.Clients.Client? Client { get; set; }
        public int RoomId { get; set; }
        public Room? Room { get; set; }
        public ReservationStatus Status { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public decimal Charge { get; set; }
        // Metadata
        public bool Active { get; set; }
        public DateTime CreationDate { get; set; }
    }
}

namespace backend.Features.Clients
{
    public class Client
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string IdentityNumber { get; set; }
        public string Phone { get; set; }
        public bool Active { get; set; }
        public DateTime CreationDate { get; set; }
    }
}

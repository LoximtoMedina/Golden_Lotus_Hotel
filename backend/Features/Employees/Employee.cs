namespace backend.Features.Employees
{
    public class Employee
    {
        public int Id { get; set; }
        // Data about the employee
        public string IdentityNumber { get; set; }
        public string Phone { get; set; }
        public float Salary { get; set; }
        public string Name { get; set; }
        // Access related
        public string Email { get; set; }
        public string AccessKey { get; set; }
        public Role Role { get; set; }
        // Metadata
        public bool Active { get; set; }
        public DateTime CreationDate { get; set; }
    }
}

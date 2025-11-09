using System.ComponentModel.DataAnnotations;

namespace SchoolEquipmentLending.Api.Models
{
    public class Item
    {
        public int Id { get; set; }
        [Required] public string Name { get; set; }
        public string? Category { get; set; }
        public string Condition { get; set; } = "Good";
        public int TotalQuantity { get; set; } = 1;
        public int AvailableQuantity { get; set; } = 1;
        public string Description { get; set; }
    }
}

namespace SchoolEquipmentLending.Api.DTOs
{
    public class CreateRequestDto
    {
        public int ItemId { get; set; }
        public int Quantity { get; set; } = 1;
        public DateTime RequestedFrom { get; set; }
        public DateTime RequestedTo { get; set; }
        public string? Notes { get; set; }
    }

    public class DecisionDto
    {
        public string Action { get; set; }
    }
}

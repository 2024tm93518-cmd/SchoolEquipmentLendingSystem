using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolEquipmentLending.Api.Models
{
    public class Request
    {
        public int Id { get; set; }
        [Required] public int RequesterId { get; set; }
        [ForeignKey("RequesterId")] public User Requester { get; set; }
        [Required] public int ItemId { get; set; }
        [ForeignKey("ItemId")] public Item Item { get; set; }
        public int Quantity { get; set; } = 1;
        public string Status { get; set; } = "pending"; // pending, approved, rejected, issued, returned
        [Required] public DateTime RequestedFrom { get; set; }
        [Required] public DateTime RequestedTo { get; set; }
        public string Notes { get; set; }
    }
}

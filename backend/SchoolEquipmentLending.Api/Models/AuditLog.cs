using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolEquipmentLending.Api.Models
{
    public class AuditLog
    {
        public int Id { get; set; }

        [Required]
        public int RequestId { get; set; }

        [ForeignKey("RequestId")]
        public Request Request { get; set; }

        [Required]
        public string Action { get; set; }

        // PerformedBy can be a user id, username or role+id string depending on token claims
        public string PerformedBy { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public string Notes { get; set; }
    }
}
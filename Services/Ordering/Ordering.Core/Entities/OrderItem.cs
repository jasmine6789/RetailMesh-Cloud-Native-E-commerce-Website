using Ordering.Core.Common;

namespace Ordering.Core.Entities;

public class OrderItem : EntityBase
{
    public int OrderId { get; set; }
    public Order? Order { get; set; }
    public string? ProductId { get; set; }
    public string? ProductName { get; set; }
    public decimal? Price { get; set; }
    public int? Quantity { get; set; }
    public string? ImageFile { get; set; }
}

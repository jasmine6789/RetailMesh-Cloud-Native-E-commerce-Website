namespace Ordering.Application.Responses;

public class OrderItemResponse
{
    public string? ProductId { get; set; }
    public string? ProductName { get; set; }
    public decimal? Price { get; set; }
    public int? Quantity { get; set; }
    public string? ImageFile { get; set; }
}

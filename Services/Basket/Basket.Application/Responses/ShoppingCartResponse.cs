namespace Basket.Application.Responses;

public class ShoppingCartResponse
{
    public string UserName { get; set; }
    public List<ShoppingCartItemResponse> Items { get; set; } = new();

    public ShoppingCartResponse()
    {
    }

    public ShoppingCartResponse(string username)
    {
        UserName = username;
    }

    public decimal TotalPrice
    {
        get
        {
            if (Items == null || Items.Count == 0)
            {
                return 0;
            }

            decimal totalPrice = 0;
            foreach (var item in Items)
            {
                totalPrice += item.Price * item.Quantity;
            }

            return totalPrice;
        }
    }
}
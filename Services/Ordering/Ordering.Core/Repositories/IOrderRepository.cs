using Ordering.Core.Entities;

namespace Ordering.Core.Repositories;

public interface IOrderRepository : IAsyncRepository<Order>
{
    Task<IEnumerable<Order>> GetOrdersByUserName(string userName);
    Task<Order?> GetOrderByIdAndUserNameAsync(int id, string userName);
    Task<bool> ExistsByCorrelationIdAsync(string correlationId);
    Task<Order?> GetByCorrelationIdAsync(string correlationId);
}
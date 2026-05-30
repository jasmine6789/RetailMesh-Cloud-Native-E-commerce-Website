using Microsoft.EntityFrameworkCore;
using Ordering.Core.Entities;
using Ordering.Core.Repositories;
using Ordering.Infrastructure.Data;

namespace Ordering.Infrastructure.Repositories;

public class OrderRepository : RepositoryBase<Order>, IOrderRepository
{
    public OrderRepository(OrderContext dbContext) : base(dbContext)
    {
    }

    public async Task<IEnumerable<Order>> GetOrdersByUserName(string userName)
    {
        var orderList = await _dbContext.Orders
            .Include(o => o.Items)
            .Where(o => o.UserName == userName)
            .ToListAsync();
        return orderList;
    }

    public async Task<Order?> GetOrderByIdAndUserNameAsync(int id, string userName)
    {
        return await _dbContext.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserName == userName);
    }

    public async Task<bool> ExistsByCorrelationIdAsync(string correlationId)
    {
        if (string.IsNullOrWhiteSpace(correlationId))
        {
            return false;
        }

        return await _dbContext.Orders.AnyAsync(o => o.CorrelationId == correlationId);
    }

    public async Task<Order?> GetByCorrelationIdAsync(string correlationId)
    {
        if (string.IsNullOrWhiteSpace(correlationId))
        {
            return null;
        }

        return await _dbContext.Orders
            .FirstOrDefaultAsync(o => o.CorrelationId == correlationId);
    }
}
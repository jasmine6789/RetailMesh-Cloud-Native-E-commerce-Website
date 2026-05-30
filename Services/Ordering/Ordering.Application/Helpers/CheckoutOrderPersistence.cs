using Microsoft.EntityFrameworkCore;

namespace Ordering.Application.Helpers;

internal static class CheckoutOrderPersistence
{
    public static bool IsDuplicateCorrelationId(DbUpdateException exception)
    {
        var message = exception.InnerException?.Message ?? exception.Message;
        return message.Contains("IX_Orders_CorrelationId", StringComparison.OrdinalIgnoreCase) ||
               message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase);
    }
}

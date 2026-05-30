using Common.Mediator;
using Ordering.Application.Responses;

namespace Ordering.Application.Queries;

public class GetOrderByIdQuery : IRequest<OrderResponse?>
{
    public int Id { get; set; }
    public string UserName { get; set; }

    public GetOrderByIdQuery(int id, string userName)
    {
        Id = id;
        UserName = userName;
    }
}

using Common.Mediator;
using Ordering.Application.Mappers;
using Ordering.Application.Queries;
using Ordering.Application.Responses;
using Ordering.Core.Repositories;

namespace Ordering.Application.Handlers;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderResponse?>
{
    private readonly IOrderRepository _orderRepository;
    private readonly OrderMapper _mapper;

    public GetOrderByIdQueryHandler(IOrderRepository orderRepository, OrderMapper mapper)
    {
        _orderRepository = orderRepository;
        _mapper = mapper;
    }

    public async Task<OrderResponse?> Handle(
        GetOrderByIdQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UserName))
        {
            return null;
        }

        var order = await _orderRepository.GetOrderByIdAndUserNameAsync(
            request.Id,
            request.UserName);
        if (order == null)
        {
            return null;
        }

        return _mapper.ToOrderResponse(order);
    }
}

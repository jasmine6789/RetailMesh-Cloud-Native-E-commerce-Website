using Ordering.Application.Mappers;
using EventBus.Messages.Events;
using MassTransit;
using Common.Mediator;
using Ordering.Application.Commands;
using Ordering.Core.Repositories;

namespace Ordering.API.EventBusConsumer;

public class BasketOrderingConsumerV2 : IConsumer<BasketCheckoutEventV2>
{
    private readonly IMediator _mediator;
    private readonly OrderMapper _mapper;
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger<BasketOrderingConsumerV2> _logger;

    public BasketOrderingConsumerV2(
        IMediator mediator,
        OrderMapper mapper,
        IOrderRepository orderRepository,
        ILogger<BasketOrderingConsumerV2> logger)
    {
        _mediator = mediator;
        _mapper = mapper;
        _orderRepository = orderRepository;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<BasketCheckoutEventV2> context)
    {
        using var scope = _logger.BeginScope(
            "Consuming Basket Checkout Event for {correlationId} with version 2",
            context.Message.CorrelationId);

        if (!string.IsNullOrWhiteSpace(context.Message.CorrelationId) &&
            await _orderRepository.ExistsByCorrelationIdAsync(context.Message.CorrelationId))
        {
            _logger.LogWarning(
                "Duplicate checkout event detected and skipped. CorrelationId: {CorrelationId}, UserName: {UserName}",
                context.Message.CorrelationId,
                context.Message.UserName);
            return;
        }

        _logger.LogInformation("Basket Checkout Event Consumed: {Event}", context.Message);
        var cmd = _mapper.ToCheckoutOrderCommandV2(context.Message);
        var result = await _mediator.Send(cmd);
        _logger.LogInformation(
            "Basket Checkout Event completed with version 2. OrderId: {OrderId}",
            result);
    }
}

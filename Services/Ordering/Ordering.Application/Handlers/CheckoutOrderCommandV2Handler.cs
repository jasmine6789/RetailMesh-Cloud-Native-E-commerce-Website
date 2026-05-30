using Microsoft.EntityFrameworkCore;
using Ordering.Application.Commands;
using Ordering.Application.Helpers;
using Ordering.Application.Mappers;
using Common.Mediator;
using Microsoft.Extensions.Logging;
using Ordering.Core.Repositories;

namespace Ordering.Application.Handlers;

public class CheckoutOrderCommandV2Handler : IRequestHandler<CheckoutOrderCommandV2, int>
{
    private readonly IOrderRepository _orderRepository;
    private readonly OrderMapper _mapper;
    private readonly ILogger<CheckoutOrderCommandHandler> _logger;

    public CheckoutOrderCommandV2Handler(IOrderRepository orderRepository, OrderMapper mapper,
        ILogger<CheckoutOrderCommandHandler> logger)
    {
        _orderRepository = orderRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<int> Handle(CheckoutOrderCommandV2 request, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(request.CorrelationId))
        {
            var existing = await _orderRepository.GetByCorrelationIdAsync(request.CorrelationId);
            if (existing != null)
            {
                _logger.LogWarning(
                    "Duplicate checkout command skipped. CorrelationId: {CorrelationId}, OrderId: {OrderId}",
                    request.CorrelationId,
                    existing.Id);
                return existing.Id;
            }
        }

        var orderEntity = _mapper.ToOrder(request);

        try
        {
            var generatedOrder = await _orderRepository.AddAsync(orderEntity);
            _logger.LogInformation(
                "Order with Id {OrderId} successfully created with V2 Handler",
                generatedOrder.Id);
            return generatedOrder.Id;
        }
        catch (DbUpdateException ex) when (CheckoutOrderPersistence.IsDuplicateCorrelationId(ex))
        {
            if (string.IsNullOrWhiteSpace(request.CorrelationId))
            {
                throw;
            }

            var existing = await _orderRepository.GetByCorrelationIdAsync(request.CorrelationId);
            if (existing != null)
            {
                _logger.LogWarning(
                    ex,
                    "Unique constraint race on CorrelationId {CorrelationId}, returning OrderId {OrderId}",
                    request.CorrelationId,
                    existing.Id);
                return existing.Id;
            }

            throw;
        }
    }
}

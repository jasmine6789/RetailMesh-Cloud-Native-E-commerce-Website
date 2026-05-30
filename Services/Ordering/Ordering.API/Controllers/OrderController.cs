using Common.Auth;
using EventBus.Messages.Events;
using MassTransit;
using Common.Mediator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ordering.Application.Commands;
using Ordering.Application.Queries;
using Ordering.Application.Responses;
using System.Net;

namespace Ordering.API.Controllers;

[Authorize]
public class OrderController : ApiController
{
    private readonly IMediator _mediator;
    private readonly ILogger<OrderController> _logger;
    private readonly IPublishEndpoint _publishEndpoint;

    public OrderController(
        IMediator mediator,
        ILogger<OrderController> logger,
        IPublishEndpoint publishEndpoint)
    {
        _mediator = mediator;
        _logger = logger;
        _publishEndpoint = publishEndpoint;
    }

    [HttpGet("{userName}", Name = "GetOrdersByUserName")]
    [ProducesResponseType(typeof(IEnumerable<OrderResponse>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetOrdersByUserName(string userName)
    {
        var forbid = CurrentUser.ForbidIfUserNameMismatch(this, userName);
        if (forbid != null)
        {
            return forbid;
        }

        var query = new GetOrderListQuery(userName);
        var orders = await _mediator.Send(query);
        return Ok(orders);
    }

    [HttpGet("GetOrderById/{userName}/{id:int}", Name = "GetOrderById")]
    [ProducesResponseType(typeof(OrderResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<ActionResult<OrderResponse>> GetOrderById(string userName, int id)
    {
        var forbid = CurrentUser.ForbidIfUserNameMismatch(this, userName);
        if (forbid != null)
        {
            return forbid;
        }

        var query = new GetOrderByIdQuery(id, userName);
        var order = await _mediator.Send(query);
        if (order == null)
        {
            return NotFound();
        }

        return Ok(order);
    }

    [HttpPost(Name = "CheckoutOrder")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    public async Task<ActionResult<int>> CheckoutOrder([FromBody] CheckoutOrderCommand command)
    {
        var forbid = CurrentUser.ForbidIfUserNameMismatch(this, command.UserName);
        if (forbid != null)
        {
            return forbid;
        }

        var result = await _mediator.Send(command);

        if (result > 0)
        {
            var eventMessage = new OrderActivityEvent
            {
                ActivityType = OrderActivityType.Created,
                OrderId = result,
                Actor = command.UserName,
                TotalPrice = command.TotalPrice,
                OccurredAt = DateTime.UtcNow
            };

            await _publishEndpoint.Publish(eventMessage);
            _logger.LogInformation("OrderActivityEvent published for OrderId: {OrderId}", result);
        }

        return Ok(result);
    }

    [HttpPut(Name = "UpdateOrder")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<int>> UpdateOrder([FromBody] UpdateOrderCommand command)
    {
        var forbid = CurrentUser.ForbidIfUserNameMismatch(this, command.UserName);
        if (forbid != null)
        {
            return forbid;
        }

        await _mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}", Name = "DeleteOrder")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteOrder(int id)
    {
        var userName = CurrentUser.GetEmail(User);
        if (string.IsNullOrWhiteSpace(userName))
        {
            return Unauthorized();
        }

        var existing = await _mediator.Send(new GetOrderByIdQuery(id, userName));
        if (existing == null)
        {
            return NotFound();
        }

        var cmd = new DeleteOrderCommand { Id = id };
        await _mediator.Send(cmd);
        return NoContent();
    }
}

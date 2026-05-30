using Asp.Versioning;
using Basket.Application.Commands;
using Basket.Application.Mappers;
using Basket.Application.Queries;
using Basket.Application.Responses;
using Basket.Core.Entities;
using Common.Auth;
using EventBus.Messages.Common;
using MassTransit;
using Common.Mediator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Basket.API.Controllers;

[Authorize]
public class BasketController : ApiController
{
    public readonly IMediator _mediator;
    private readonly ISendEndpointProvider _sendEndpointProvider;
    private readonly ILogger<BasketController> _logger;

    public BasketController(
        IMediator mediator,
        ISendEndpointProvider sendEndpointProvider,
        ILogger<BasketController> logger)
    {
        _mediator = mediator;
        _sendEndpointProvider = sendEndpointProvider;
        _logger = logger;
    }

    [HttpGet]
    [Route("[action]/{userName}", Name = "GetBasketByUserName")]
    [ProducesResponseType(typeof(ShoppingCartResponse), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<ShoppingCartResponse>> GetBasket(string userName)
    {
        var forbid = CurrentUser.ForbidIfUserNameMismatch(this, userName);
        if (forbid != null)
        {
            return forbid;
        }

        var query = new GetBasketByUserNameQuery(userName);
        var basket = await _mediator.Send(query);
        return Ok(basket);
    }

    [HttpPost("CreateBasket")]
    [ProducesResponseType(typeof(ShoppingCartResponse), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<ShoppingCartResponse>> UpdateBasket(
        [FromBody] CreateShoppingCartCommand createShoppingCartCommand)
    {
        var forbid = CurrentUser.ForbidIfUserNameMismatch(this, createShoppingCartCommand.UserName);
        if (forbid != null)
        {
            return forbid;
        }

        var basket = await _mediator.Send(createShoppingCartCommand);
        return Ok(basket);
    }

    [HttpDelete]
    [Route("[action]/{userName}", Name = "DeleteBasketByUserName")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    public async Task<ActionResult> DeleteBasket(string userName)
    {
        var forbid = CurrentUser.ForbidIfUserNameMismatch(this, userName);
        if (forbid != null)
        {
            return forbid;
        }

        var cmd = new DeleteBasketByUserNameCommand(userName);
        return Ok(await _mediator.Send(cmd));
    }

    [Route("[action]")]
    [HttpPost]
    [ProducesResponseType((int)HttpStatusCode.Accepted)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> Checkout([FromBody] BasketCheckout basketCheckout)
    {
        var forbid = CurrentUser.ForbidIfUserNameMismatch(this, basketCheckout.UserName);
        if (forbid != null)
        {
            return forbid;
        }

        var query = new GetBasketByUserNameQuery(basketCheckout.UserName);
        var basket = await _mediator.Send(query);
        if (basket == null) return BadRequest();

        var eventMsg = BasketMapper.Instance.ToBasketCheckoutEvent(basketCheckout);
        eventMsg.TotalPrice = basket.TotalPrice;

        var sendEndpoint = await _sendEndpointProvider.GetSendEndpoint(
            new Uri($"queue:{EventBusConstant.BasketCheckoutQueue}"));
        await sendEndpoint.Send(eventMsg);

        _logger.LogInformation("Basket checkout event sent to {Queue} for {UserName}",
            EventBusConstant.BasketCheckoutQueue, basket.UserName);

        var deleteCmd = new DeleteBasketByUserNameCommand(basketCheckout.UserName);
        await _mediator.Send(deleteCmd);
        return Accepted();
    }
}

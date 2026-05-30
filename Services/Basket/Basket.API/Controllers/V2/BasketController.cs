using Asp.Versioning;
using Basket.Application.Commands;
using Basket.Application.Mappers;
using Basket.Application.Queries;
using Basket.Core.Entities;
using Common.Auth;
using EventBus.Messages.Common;
using EventBus.Messages.Events;
using MassTransit;
using Common.Mediator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Basket.API.Controllers.V2;

[ApiVersion("2")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
[Authorize]
public class BasketController : ControllerBase
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

    [Route("[action]")]
    [HttpPost]
    [ProducesResponseType((int)HttpStatusCode.Accepted)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> Checkout([FromBody] BasketCheckoutV2 basketCheckout)
    {
        if (!CurrentUser.MatchesUserName(User, basketCheckout.UserName))
        {
            return Forbid();
        }

        var query = new GetBasketByUserNameQuery(basketCheckout.UserName);
        var basket = await _mediator.Send(query);
        if (basket == null) return BadRequest();

        var eventMsg = BasketMapper.Instance.ToBasketCheckoutEventV2(basketCheckout);
        eventMsg.TotalPrice = basket.TotalPrice;
        eventMsg.Items = basket.Items?
            .Select(item => BasketMapper.Instance.ToBasketCheckoutItemEvent(item))
            .ToList() ?? new List<BasketCheckoutItemEvent>();

        var sendEndpoint = await _sendEndpointProvider.GetSendEndpoint(
            new Uri($"queue:{EventBusConstant.BasketCheckoutQueueV2}"));
        await sendEndpoint.Send(eventMsg);

        _logger.LogInformation(
            "Basket checkout event sent to {Queue} for {UserName}",
            EventBusConstant.BasketCheckoutQueueV2,
            basket.UserName);
        //remove the basket
        var deleteCmd = new DeleteBasketByUserNameCommand(basketCheckout.UserName);
        await _mediator.Send(deleteCmd);
        return Accepted();
    }
}
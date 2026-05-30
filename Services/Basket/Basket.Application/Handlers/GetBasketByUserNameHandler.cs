using Basket.Application.Mappers;
using Basket.Application.Queries;
using Basket.Application.Responses;
using Basket.Core.Entities;
using Basket.Core.Repositories;
using Common.Mediator;

namespace Basket.Application.Handlers;

public class GetBasketByUserNameHandler : IRequestHandler<GetBasketByUserNameQuery, ShoppingCartResponse>
{
    private readonly IBasketRepository _basketRepository;

    public GetBasketByUserNameHandler(IBasketRepository basketRepository)
    {
        _basketRepository = basketRepository;
    }

    public async Task<ShoppingCartResponse> Handle(GetBasketByUserNameQuery request,
        CancellationToken cancellationToken)
    {
        var shoppingCart = await _basketRepository.GetBasket(request.UserName);

        if (shoppingCart == null)
        {
            return new ShoppingCartResponse(request.UserName)
            {
                Items = new List<ShoppingCartItemResponse>(),
            };
        }

        shoppingCart.Items ??= new List<ShoppingCartItem>();

        return BasketMapper.Instance.ToShoppingCartResponse(shoppingCart);
    }
}
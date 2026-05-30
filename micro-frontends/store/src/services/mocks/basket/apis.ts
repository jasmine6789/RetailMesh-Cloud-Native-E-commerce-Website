import MockAdapter from 'axios-mock-adapter';
import { createEndpoint, createResponse } from '../utils';
import { readMockBasket, writeMockBasket } from './state';
import type { AddToCartInput } from '../../basket/input';

const ENDPOINT = '/api/mock/Basket';

function mapItems(payload: AddToCartInput) {
  return payload.Items.map((item) => ({
    productId: item.ProductId,
    productName: item.ProductName,
    price: item.Price,
    originalPrice: item.OriginalPrice,
    discountAmount: item.DiscountAmount,
    quantity: item.Quantity,
    imageFile: item.ImageFile ?? null,
    finalPrice: item.Price * item.Quantity,
  }));
}

export default function registerBasketMocks(mockAdapter: MockAdapter) {
  mockAdapter
    .onGet(createEndpoint(`${ENDPOINT}/GetBasket/:userName`))
    .reply((config) => {
      const userName = config.url?.split('/').pop() ?? 'guest';
      return [200, createResponse(readMockBasket(userName))];
    });

  mockAdapter.onPost(createEndpoint(`${ENDPOINT}/CreateBasket`)).reply((config) => {
    const payload = JSON.parse(config.data || '{}') as AddToCartInput;
    const existing = readMockBasket(payload.UserName);
    const incoming = mapItems(payload);

    const merged = new Map(
      existing.items.map((item) => [item.productId, { ...item }])
    );

    for (const item of incoming) {
      const current = merged.get(item.productId);
      if (current) {
        current.quantity += item.quantity;
        current.finalPrice = current.price * current.quantity;
      } else {
        merged.set(item.productId, item);
      }
    }

    const basket = writeMockBasket({
      userName: payload.UserName,
      items: Array.from(merged.values()),
    });

    return [200, createResponse(basket)];
  });
}

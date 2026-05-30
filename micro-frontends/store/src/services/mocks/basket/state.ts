import type { BasketResponse } from '../../basket/schemas';

const STORAGE_PREFIX = 'retailmesh-mock-basket:';

function storageKey(userName: string): string {
  return `${STORAGE_PREFIX}${userName}`;
}

export function readMockBasket(userName: string): BasketResponse {
  if (typeof window === 'undefined') {
    return { userName, items: [] };
  }

  const raw = sessionStorage.getItem(storageKey(userName));
  if (!raw) {
    return { userName, items: [], totalPrice: 0 };
  }

  try {
    return JSON.parse(raw) as BasketResponse;
  } catch {
    return { userName, items: [], totalPrice: 0 };
  }
}

export function writeMockBasket(basket: BasketResponse): BasketResponse {
  const totalPrice = basket.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const next = { ...basket, totalPrice };

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(storageKey(basket.userName), JSON.stringify(next));
  }

  return next;
}

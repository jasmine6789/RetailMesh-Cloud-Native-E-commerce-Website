/** Shared with account MFE via sessionStorage (same origin). */
const ALL_ORDERS_KEY = 'retailmesh-mock-orders:all';

export type StoredMockOrderItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageFile?: string | null;
};

export type StoredMockOrder = {
  id: number;
  userName: string;
  totalPrice: number;
  orderDate: string;
  status: string;
  items: StoredMockOrderItem[];
  firstName?: string | null;
  lastName?: string | null;
  emailAddress?: string | null;
  addressLine?: string | null;
  country?: string | null;
  state?: string | null;
  zipCode?: string | null;
  paymentMethod?: number | null;
};

function readAllOrders(): StoredMockOrder[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = sessionStorage.getItem(ALL_ORDERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as StoredMockOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllOrders(orders: StoredMockOrder[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(ALL_ORDERS_KEY, JSON.stringify(orders));
}

export function getMockOrders(userName: string): StoredMockOrder[] {
  const normalized = userName.trim().toLowerCase();
  return readAllOrders().filter(
    (order) => order.userName.trim().toLowerCase() === normalized
  );
}

export function appendMockOrder(order: StoredMockOrder): void {
  const existing = readAllOrders();
  writeAllOrders([order, ...existing]);
}

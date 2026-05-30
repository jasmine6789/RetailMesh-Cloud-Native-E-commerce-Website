import { z } from 'zod';
import { env } from '../../config';
import { createApiFactory } from '../factory/createApiFactory';
import { mapOrder } from './mappers';
import { orderResponseSchema } from './schemas';
import type { GetOrdersInput, GetOrderByIdInput } from './input';
import type { OrderResponse, Order } from './types';

export const apiFactory = createApiFactory('/Order', { version: '' });

export async function getOrders(request?: {
  params?: GetOrdersInput;
}): Promise<{ data: Order[] } | null> {
  const userName = request?.params?.userName || 'guest';

  try {
    const orders = await apiFactory<OrderResponse[], Order[]>(
      'GET',
      `/:userName`,
      { params: { ...request?.params, userName } },
      {
        transformer: (response) => {
          if (!response || !Array.isArray(response)) {
            return [];
          }
          const mappedOrders: Order[] = [];
          for (const orderResponse of response) {
            const validatedData = orderResponseSchema.parse(orderResponse);
            const order = mapOrder(validatedData);
            if (order) {
              mappedOrders.push(order);
            }
          }
          return mappedOrders;
        },
        responseSchema: z.array(orderResponseSchema),
        useMock: request?.params?.useMock ?? env.useMockData,
      }
    );

    return { data: orders ?? [] };
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any)?.response?.status;
    if (status === 404) {
      console.log('[Orders API] No orders found (404), returning empty array');
      return { data: [] };
    }

    console.error('[Orders API] Error fetching orders:', error);
    return { data: [] };
  }
}

export async function getOrderById(request?: {
  params?: GetOrderByIdInput;
}): Promise<{ data: Order | null } | null> {
  const orderId = request?.params?.orderId;
  const userName = request?.params?.userName;
  if (!orderId || Number.isNaN(orderId) || !userName) {
    return { data: null };
  }

  try {
    const order = await apiFactory<OrderResponse, Order>(
      'GET',
      `/GetOrderById/:userName/:orderId`,
      { params: { userName, orderId } },
      {
        transformer: (response) => {
          if (!response) {
            return null;
          }
          const validatedData = orderResponseSchema.parse(response);
          return mapOrder(validatedData);
        },
        responseSchema: orderResponseSchema,
        useMock: request?.params?.useMock ?? env.useMockData,
      }
    );

    return { data: order ?? null };
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any)?.response?.status;
    if (status === 404) {
      return { data: null };
    }

    console.error('[Orders API] Error fetching order by id:', error);
    return { data: null };
  }
}

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthUser } from '@ecommerce-platform/auth-provider';
import { resolveUserName as resolveAuthUserName } from '@ecommerce-platform/auth-provider';
import { env } from '../../config';
import { ReactQueryOptions } from '../types';
import * as apis from './apis';
import { orderKeys } from './keys';
import type { GetOrdersInput } from './input';

function resolveOrderUserName(user: AuthUser | null | undefined): string {
  const name = resolveAuthUserName(user);
  if (name) {
    return name;
  }
  return env.useMockData ? 'demo@retailmesh.com' : 'guest';
}

const ORDER_PLACED_EVENT = 'ecommerce:order:placed';

export function useGetOrders(
  input?: GetOrdersInput,
  options?: Omit<ReactQueryOptions, 'initialData'> & { user?: AuthUser | null }
) {
  const queryClient = useQueryClient();
  const { enabled = true, user: inputUser, ...queryOptions } = options || {};
  const userName = input?.userName || resolveOrderUserName(inputUser);

  useEffect(() => {
    function handleOrderPlaced(event: Event) {
      const detail = (event as CustomEvent<{ userName?: string }>).detail;
      const placedFor = detail?.userName || userName;
      queryClient.invalidateQueries({
        queryKey: orderKeys.get.create({ userName: placedFor }),
      });
      queryClient.invalidateQueries({
        queryKey: orderKeys.get.create({ userName }),
      });
    }

    window.addEventListener(ORDER_PLACED_EVENT, handleOrderPlaced);
    return () => window.removeEventListener(ORDER_PLACED_EVENT, handleOrderPlaced);
  }, [queryClient, userName]);

  return useQuery({
    ...queryOptions,
    queryKey: orderKeys.get.create({ ...input, userName }),
    queryFn: async () => {
      const result = await apis.getOrders({
        params: { ...input, userName, useMock: env.useMockData },
      });
      return result ?? null;
    },
    enabled: Boolean(enabled && (inputUser || env.useMockData)),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

function normalizeUserName(value?: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

export function useGetOrderById(
  orderId?: number,
  options?: Omit<ReactQueryOptions, 'initialData'> & { user?: AuthUser | null }
) {
  const { enabled = true, user: inputUser, ...queryOptions } = options || {};
  const userName = resolveOrderUserName(inputUser);
  const parsedOrderId = Number(orderId);
  const hasValidOrderId = Number.isFinite(parsedOrderId) && parsedOrderId > 0;

  return useQuery({
    ...queryOptions,
    queryKey: orderKeys.getById.create({ orderId: parsedOrderId, userName }),
    queryFn: async () => {
      const result = await apis.getOrderById({
        params: {
          orderId: parsedOrderId,
          userName: userName ?? undefined,
          useMock: env.useMockData,
        },
      });

      const order = result?.data ?? null;
      if (
        order &&
        userName &&
        normalizeUserName(order.userName) !== normalizeUserName(userName)
      ) {
        return null;
      }

      return order;
    },
    enabled: Boolean(enabled && hasValidOrderId && (inputUser || env.useMockData)),
    staleTime: 2 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

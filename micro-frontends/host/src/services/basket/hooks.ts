import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { resolveCartUserName } from './resolveCartUser';
import { getBasket } from './apis';
import { basketKeys } from './keys';
import type { Basket } from './schemas';

export function useBasket() {
  const { user, isLoading: authLoading } = useAuth();
  const userName = resolveCartUserName(user) ?? 'guest';

  const query = useQuery<Basket | null>({
    queryKey: basketKeys.getBasket.create({ userName }),
    queryFn: async () => {
      const response = await getBasket({ params: { userName } });
      return (response as Basket | null) ?? null;
    },
    enabled: !authLoading,
    staleTime: 30 * 1000,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const basket = query.data ?? null;

  return {
    basket,
    items: (basket?.items ?? []) as Basket['items'],
    itemCount: basket?.itemCount ?? 0,
    totalPrice: basket?.totalPrice ?? 0,
    isEmpty: basket?.isEmpty ?? true,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export const basketCacheKeys = {
  byUser: (userName: string) => basketKeys.getBasket.create({ userName }),
};

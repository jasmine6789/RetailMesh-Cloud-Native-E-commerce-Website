import { useQuery } from '@tanstack/react-query';
import { DEFAULT_CATEGORIES } from '../../constants/defaultCategories';
import { getAllCategories } from './api';
import { Category, Categories } from './types';
import { createCacheKeyWithScope } from '../factory/createCacheKeyFactory';

const createCacheKey = createCacheKeyWithScope('categories');

const CACHE_KEYS = {
  all: createCacheKey(['all']),
} as const;

function mergeWithDefaultCategories(apiCategories?: Categories): Categories {
  if (!apiCategories?.length) {
    return DEFAULT_CATEGORIES;
  }

  const apiNames = new Set(apiCategories.map((category) => category.name.toLowerCase()));
  const merged = [...apiCategories];

  for (const fallback of DEFAULT_CATEGORIES) {
    if (!apiNames.has(fallback.name.toLowerCase())) {
      merged.push(fallback);
    }
  }

  return merged;
}

/**
 * Hook to fetch all categories
 * - Uses React Query for automatic caching and deduplication
 * - Returns fallback data on error
 */
export function useCategories() {
  const query = useQuery({
    queryKey: CACHE_KEYS.all,
    queryFn: getAllCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  return {
    categories: mergeWithDefaultCategories(query.data),
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export type { Category, Categories };


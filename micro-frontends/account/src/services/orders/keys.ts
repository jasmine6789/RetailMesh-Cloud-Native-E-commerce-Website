import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';
import type { GetOrdersInput } from './input';

const createOrderKeys = createCacheKeyWithScope('_order');

export const orderKeys = {
  get: createCacheSection((input?: GetOrdersInput) =>
    createOrderKeys(['get', input?.userName])
  ),

  getById: createCacheSection((input?: { orderId?: number; userName?: string }) =>
    createOrderKeys(['getById', input?.orderId, input?.userName])
  ),

  all: createOrderKeys(['all']),
  detail: (userName?: string) => createOrderKeys(['get', userName]),
};


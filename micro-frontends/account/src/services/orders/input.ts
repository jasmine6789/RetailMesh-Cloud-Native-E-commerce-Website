import { z } from 'zod';

import { createApiInputFactory } from '../factory/createApiInputFactory';

export const getOrdersInput = createApiInputFactory(
  z.object({
    userName: z.string().optional(),
    useMock: z.boolean().optional(),
  })
);

export const getOrderByIdInput = createApiInputFactory(
  z.object({
    orderId: z.coerce.number(),
    userName: z.string().optional(),
    useMock: z.boolean().optional(),
  })
);

export type GetOrdersInput = z.infer<typeof getOrdersInput>;
export type GetOrderByIdInput = z.infer<typeof getOrderByIdInput>;

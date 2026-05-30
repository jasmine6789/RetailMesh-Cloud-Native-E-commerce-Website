import { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { env } from '../../config';
import { axiosClient } from '../httpClient';
import registerProductsMocks from './products/apis';
import registerBasketMocks from './basket/apis';

export function setupMock(axiosClient: AxiosInstance) {
  const mockAdapterClient = new MockAdapter(axiosClient, {
    onNoMatch: 'passthrough',
  });

  registerProductsMocks(mockAdapterClient);
  registerBasketMocks(mockAdapterClient);

  return {
    mockAdapterClient,
  };
}

export const mockClient = env.useMockData ? setupMock(axiosClient) : null;

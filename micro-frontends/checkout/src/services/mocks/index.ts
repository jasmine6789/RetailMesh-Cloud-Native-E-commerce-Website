import MockAdapter from 'axios-mock-adapter';
import { env } from '../../config';
import { axiosClient } from '../httpClient';
import registerBasketMocks from './basket/apis';

let mockAdapter: MockAdapter | null = null;

/**
 * Setup mock adapter for Axios client
 * Only sets up mocks when useMockData is enabled
 */
export function setupMocks() {
  if (!env.useMockData) {
    console.log(
      '[Mocks] Mock adapter skipped (production mode or useMockData=false)'
    );
    return;
  }

  if (mockAdapter) {
    console.warn('[Mocks] Mock adapter already initialized');
    return;
  }

  mockAdapter = new MockAdapter(axiosClient, {
    delayResponse: 200,
    onNoMatch: 'passthrough',
  });

  registerBasketMocks(mockAdapter);

  console.log('[checkout] Mock adapter initialized (basket + checkout)');
}

export function resetMocks() {
  if (mockAdapter) {
    mockAdapter.reset();
    console.log('[Mocks] Mock adapter reset');
  }
}

export function restoreMocks() {
  if (mockAdapter) {
    mockAdapter.restore();
    mockAdapter = null;
    console.log('[Mocks] Mock adapter restored');
  }
}

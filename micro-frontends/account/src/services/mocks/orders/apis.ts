import type { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createEndpoint, createResponse } from '../utils';
import { getMockOrders } from './state';
import { mockOrdersResponse } from './data';

function extractUserNameFromUrl(url?: string): string {
  const listMatch = url?.match(/\/Order\/([^/?#]+)/i);
  if (listMatch) {
    return decodeURIComponent(listMatch[1]);
  }

  const detailMatch = url?.match(/\/GetOrderById\/([^/]+)\/\d+/i);
  return decodeURIComponent(detailMatch?.[1] ?? 'guest');
}

function extractOrderIdFromUrl(url?: string): number | null {
  const match = url?.match(/\/GetOrderById\/[^/]+\/(\d+)/i);
  return match ? Number(match[1]) : null;
}

function buildOrdersResponse(config: AxiosRequestConfig) {
  const userName = extractUserNameFromUrl(config.url);
  return createResponse(getMockOrders(userName));
}

function buildOrderByIdResponse(config: AxiosRequestConfig): [number, unknown] {
  const orderId = extractOrderIdFromUrl(config.url);
  const userName = extractUserNameFromUrl(config.url);

  if (!orderId || !userName) {
    return [404, { message: 'Order not found' }];
  }

  const fromSession = getMockOrders(userName).find((order) => order.id === orderId);
  const fromSeed = mockOrdersResponse.find(
    (order) => order.id === orderId && order.userName === userName
  );
  const order = fromSession ?? fromSeed;

  if (!order) {
    return [404, { message: 'Order not found' }];
  }

  return [200, createResponse(order)];
}

export default function register(mockAdapter: MockAdapter) {
  // Account orders API: baseURL /api + url mock/Order/:userName (version is '')
  mockAdapter
    .onGet(createEndpoint('/api/mock/Order/:userName'))
    .reply(200, buildOrdersResponse);

  mockAdapter
    .onGet(/\/mock\/Order\/GetOrderById\/[^/]+\/\d+/)
    .reply((config) => buildOrderByIdResponse(config));

  mockAdapter
    .onGet(/\/Order\/GetOrderById\/[^/]+\/\d+/)
    .reply((config) => buildOrderByIdResponse(config));

  // Fallback when axios passes url without /api prefix
  mockAdapter
    .onGet(/\/mock\/Order\/[^/?#]+/)
    .reply(200, buildOrdersResponse);
}

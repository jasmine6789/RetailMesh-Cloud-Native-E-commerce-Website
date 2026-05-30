import React from 'react';
import { Typography, Space } from 'antd';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import type { AuthUser } from '@ecommerce-platform/auth-provider';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { useGetOrderById } from '../services/orders/hooks';
import { OrderDetailView } from '../components/OrderDetailView';

const { Title, Text } = Typography;

type OrderDetailPageProps = {
  config?: AppInjectorProps['config'];
  orderId: string;
};

function OrderDetailPage(props: OrderDetailPageProps) {
  const { config, orderId } = props;
  const { appContext, onNavigate, onError } = config || {};
  const { user: authUser } = useAuth();
  const contextUser = appContext?.user as AuthUser | undefined;
  const user = contextUser ?? authUser ?? undefined;
  const parsedOrderId = Number(orderId);

  const { data: order, isLoading } = useGetOrderById(parsedOrderId, {
    user,
  });

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Title level={2}>Order Details</Title>
      <Text type="secondary">Review your order information and shipping details</Text>
      <OrderDetailView
        order={order ?? null}
        isLoading={isLoading}
        onNavigate={onNavigate}
        onError={onError}
      />
    </Space>
  );
}

export default OrderDetailPage;

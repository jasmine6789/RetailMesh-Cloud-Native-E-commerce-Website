import React from 'react';
import {
  Typography,
  Card,
  Button,
  Descriptions,
  Tag,
  Space,
  Skeleton,
  Result,
  Table,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import type { OrderDetailViewProps } from '../types';
import type { OrderItem } from '../../services/orders/types';

const { Title, Text } = Typography;

const STATUS_COLORS: Record<string, string> = {
  delivered: 'green',
  shipped: 'blue',
  processing: 'orange',
  pending: 'yellow',
  cancelled: 'red',
};

function formatDate(value?: string | null): string {
  if (!value) {
    return 'N/A';
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatPaymentMethod(value?: number | null): string {
  if (value === 1) {
    return 'Credit / Debit Card';
  }
  if (value === 0) {
    return 'Standard Payment';
  }
  return 'N/A';
}

function maskCardNumber(value?: string | null): string {
  if (!value || value === '0000000000000000') {
    return 'N/A';
  }

  const digits = value.replace(/\s/g, '');
  if (digits.length <= 4) {
    return digits;
  }

  return `**** **** **** ${digits.slice(-4)}`;
}

function OrderDetailView(props: OrderDetailViewProps) {
  const { order, isLoading, onNavigate, onError } = props;
  const navigate = useNavigate();

  function handleBack() {
    try {
      navigate({ to: '/orders' });
    } catch (error) {
      onError?.(error as Error);
      onNavigate?.('/account/orders');
    }
  }

  if (isLoading) {
    return (
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Skeleton active />
          <Skeleton active />
        </Space>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card>
        <Result
          status="404"
          title="Order not found"
          subTitle="We could not find this order. It may have been removed or you may not have access."
          extra={
            <Button type="primary" onClick={handleBack}>
              Back to Order History
            </Button>
          }
        />
      </Card>
    );
  }

  const normalizedStatus = (order.status || 'pending').toLowerCase();
  const customerName = [order.firstName, order.lastName].filter(Boolean).join(' ') || 'N/A';
  const lineItems = order.items ?? [];

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: 'Unit Price',
      key: 'price',
      render: (_: unknown, record: OrderItem) =>
        `$${record.price?.toFixed(2) ?? '0.00'}`,
    },
    {
      title: 'Line Total',
      key: 'itemTotal',
      render: (_: unknown, record: OrderItem) =>
        `$${record.itemTotal?.toFixed(2) ?? '0.00'}`,
    },
  ];

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back to Order History
          </Button>
          <Tag color={STATUS_COLORS[normalizedStatus] || 'default'}>
            {normalizedStatus.toUpperCase()}
          </Tag>
        </Space>

        <Title level={3}>Order #{order.id}</Title>

        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Order Date">
            {formatDate(order.orderDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Total">
            <Text strong>${order.totalPrice?.toFixed(2) ?? '0.00'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Items">
            {order.totalItems ?? order.items?.length ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="Customer">{customerName}</Descriptions.Item>
          <Descriptions.Item label="Email">
            {order.emailAddress || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Shipping Address">
            {[order.addressLine, order.state, order.country, order.zipCode]
              .filter(Boolean)
              .join(', ') || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Payment Method">
            {formatPaymentMethod(order.paymentMethod)}
          </Descriptions.Item>
          <Descriptions.Item label="Card">
            {order.cardName && order.cardName !== 'N/A'
              ? `${order.cardName} (${maskCardNumber(order.cardNumber)})`
              : maskCardNumber(order.cardNumber)}
          </Descriptions.Item>
        </Descriptions>

        {lineItems.length > 0 && (
          <>
            <Title level={4}>Line Items</Title>
            <Table
              rowKey={(record) => `${record.productId}-${record.productName}`}
              columns={itemColumns}
              dataSource={lineItems}
              pagination={false}
              size="middle"
            />
          </>
        )}
      </Space>
    </Card>
  );
}

export default React.memo(OrderDetailView);

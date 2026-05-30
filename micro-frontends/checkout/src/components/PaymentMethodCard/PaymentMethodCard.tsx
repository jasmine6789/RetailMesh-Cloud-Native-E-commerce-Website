import React from 'react';

import { Card, Radio, Space, Typography, Input, Row, Col } from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
} from '@ant-design/icons';
import type { CardDetails } from '../../helpers/paymentValidation';

const { Text } = Typography;

type PaymentMethodCardProps = {
  paymentMethod: number;
  onPaymentMethodChange: (method: number) => void;
  cardDetails: CardDetails;
  onCardDetailsChange: (details: CardDetails) => void;
};

function PaymentMethodCard(props: PaymentMethodCardProps) {
  const {
    paymentMethod,
    onPaymentMethodChange,
    cardDetails,
    onCardDetailsChange,
  } = props;

  function updateCardField(field: keyof CardDetails, value: string) {
    onCardDetailsChange({
      ...cardDetails,
      [field]: value,
    });
  }

  return (
    <Card title="Payment Method" style={{ marginBottom: 24 }}>
      <Radio.Group
        value={paymentMethod}
        onChange={(e) => onPaymentMethodChange(e.target.value)}
        style={{ width: '100%' }}
      >
        <Space
          direction="vertical"
          size="middle"
          style={{ width: '100%' }}
        >
          <Radio value={0}>
            <Space>
              <DollarOutlined style={{ fontSize: 20 }} />
              <Space direction="vertical" size={0}>
                <Text strong>Cash on Delivery</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Pay when you receive your order
                </Text>
              </Space>
            </Space>
          </Radio>
          <Radio value={1}>
            <Space>
              <CreditCardOutlined style={{ fontSize: 20 }} />
              <Space direction="vertical" size={0}>
                <Text strong>Credit/Debit Card</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Pay securely with your card
                </Text>
              </Space>
            </Space>
          </Radio>
          <Radio value={2}>
            <Space>
              <BankOutlined style={{ fontSize: 20 }} />
              <Space direction="vertical" size={0}>
                <Text strong>Bank Transfer</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Pay via direct bank transfer
                </Text>
              </Space>
            </Space>
          </Radio>
        </Space>
      </Radio.Group>

      {paymentMethod === 1 && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Text>Name on card</Text>
            <Input
              placeholder="As shown on card"
              value={cardDetails.cardName}
              onChange={(e) => updateCardField('cardName', e.target.value)}
            />
          </Col>
          <Col xs={24}>
            <Text>Card number</Text>
            <Input
              placeholder="1234 5678 9012 3456"
              value={cardDetails.cardNumber}
              onChange={(e) => updateCardField('cardNumber', e.target.value)}
              maxLength={19}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Text>Expiration (MM/YY)</Text>
            <Input
              placeholder="MM/YY"
              value={cardDetails.expiration}
              onChange={(e) => updateCardField('expiration', e.target.value)}
              maxLength={5}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Text>CVV</Text>
            <Input
              placeholder="123"
              value={cardDetails.cvv}
              onChange={(e) => updateCardField('cvv', e.target.value)}
              maxLength={4}
              type="password"
            />
          </Col>
        </Row>
      )}
    </Card>
  );
}

export default React.memo(PaymentMethodCard);

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Spin,
  Space,
  Flex,
  Form,
  Input,
  Alert,
} from 'antd';
import { UserAddOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { brandGradient } from '../../config/theme';

const { Title, Text } = Typography;

const passwordRules = [
  { required: true, message: 'Password is required' },
  { min: 8, message: 'At least 8 characters' },
  {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    message: 'Include uppercase, lowercase, and a number',
  },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const from = (location.state as { from?: string })?.from || '/';

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const handleRegister = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
  }) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setFormError(message);
      console.error('Registration failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading && !submitting) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ minHeight: '100vh', background: brandGradient.start }}
      >
        <Space direction="vertical" align="center">
          <Spin
            indicator={
              <LoadingOutlined style={{ fontSize: 48, color: '#fff' }} spin />
            }
          />
          <Text style={{ color: '#fff', fontSize: 16 }}>Loading...</Text>
        </Space>
      </Flex>
    );
  }

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        minHeight: '100vh',
        background: brandGradient.start,
        padding: '48px 32px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 32,
          boxShadow: '0 25px 80px rgba(15, 23, 42, 0.35)',
          padding: '48px 40px',
          backdropFilter: 'blur(20px)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Title
            level={2}
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: brandGradient.start,
              marginBottom: 8,
            }}
          >
            Create account
          </Title>
          <Text type="secondary">Join RetailMesh to shop and track orders</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
          requiredMark={false}
        >
          <Form.Item name="firstName" label="First name">
            <Input size="large" placeholder="First name" autoComplete="given-name" />
          </Form.Item>

          <Form.Item name="lastName" label="Last name">
            <Input size="large" placeholder="Last name" autoComplete="family-name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input size="large" placeholder="you@example.com" autoComplete="email" />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={passwordRules}>
            <Input.Password
              size="large"
              placeholder="Password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Confirm password"
              autoComplete="new-password"
            />
          </Form.Item>

          {formError ? (
            <Alert
              type="error"
              message={formError}
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : null}

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<UserAddOutlined />}
              loading={submitting}
              block
              style={{
                height: 52,
                borderRadius: 16,
                background: brandGradient.start,
                border: 'none',
                fontWeight: 600,
              }}
            >
              Create account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign in
            </Link>
          </Text>
        </div>
      </Card>
    </Flex>
  );
};

export default RegisterPage;

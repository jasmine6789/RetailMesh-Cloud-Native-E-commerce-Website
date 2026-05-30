import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Spin,
  Space,
  Flex,
  Result,
  Form,
  Input,
  Alert,
} from 'antd';
import { LoginOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { brandGradient } from '../../config/theme';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const from = (location.state as { from?: string })?.from || '/';

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const handleLogin = async (values: { email: string; password: string }) => {
    setSubmitting(true);
    try {
      await login({ email: values.email, password: values.password });
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading && !submitting) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{
          minHeight: '100vh',
          background: brandGradient.start,
        }}
      >
        <Space direction="vertical" align="center">
          <Spin
            indicator={
              <LoadingOutlined style={{ fontSize: 48, color: '#fff' }} spin />
            }
          />
          <Text style={{ color: '#fff', fontSize: 16 }}>
            Checking authentication...
          </Text>
        </Space>
      </Flex>
    );
  }

  if (error && !submitting) {
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
            maxWidth: 500,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 32,
            boxShadow: '0 25px 80px rgba(15, 23, 42, 0.35)',
            padding: '40px',
          }}
          styles={{ body: { padding: 0 } }}
        >
          <Result
            status="error"
            title="Authentication Error"
            subTitle={error.message || 'An error occurred during authentication'}
            extra={[
              <Button
                type="primary"
                key="retry"
                onClick={() => form.submit()}
              >
                Try Again
              </Button>,
              <Button key="home" onClick={() => navigate('/')}>
                Go Home
              </Button>,
            ]}
          />
        </Card>
      </Flex>
    );
  }

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        minHeight: '100vh',
        height: '100vh',
        background: brandGradient.start,
        margin: 0,
        padding: '48px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 32,
          boxShadow:
            '0 25px 80px rgba(15, 23, 42, 0.35), 0 10px 30px rgba(51, 161, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          padding: '56px 48px',
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(20px)',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>
          <Title
            level={2}
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: brandGradient.start,
              marginBottom: 12,
              letterSpacing: '-0.5px',
            }}
          >
            Welcome
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Sign in with your RetailMesh account
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          initialValues={{ email: 'demo@retailmesh.com' }}
          requiredMark={false}
        >
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

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password
              size="large"
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          {submitting && error ? (
            <Alert
              type="error"
              message={error.message}
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : null}

          <Form.Item style={{ marginBottom: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<LoginOutlined />}
              loading={submitting}
              block
              style={{
                height: 56,
                borderRadius: 16,
                background: brandGradient.start,
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(51, 161, 255, 0.35)',
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create one
            </Link>
          </Text>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Demo: demo@retailmesh.com / Demo@12345
          </Text>
        </div>
      </Card>
    </Flex>
  );
};

export default LoginPage;

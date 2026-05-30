import { createFileRoute } from '@tanstack/react-router';
import OrderDetailPage from '../pages/OrderDetail';

export const Route = createFileRoute('/orders/$orderId')({
  component: OrderDetailRoute,
});

function OrderDetailRoute() {
  const { config } = Route.useRouteContext();
  const { orderId } = Route.useParams();

  return <OrderDetailPage config={config} orderId={orderId} />;
}

import { createFileRoute } from '@tanstack/react-router';
import OrdersPage from '../pages/Orders';

export const Route = createFileRoute('/orders/')({
  component: OrdersIndexRoute,
});

function OrdersIndexRoute() {
  const { config } = Route.useRouteContext();

  return <OrdersPage config={config} />;
}

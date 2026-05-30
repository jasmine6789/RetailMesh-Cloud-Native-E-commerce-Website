import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/orders')({
  component: OrdersLayoutRoute,
});

function OrdersLayoutRoute() {
  return <Outlet />;
}

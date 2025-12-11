import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { http } from '../lib/http';
import type { Order } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

async function fetchOrders(): Promise<Order[]> {
  const res = await http.get<Order[]>('/orders');
  return res.data;
}

export function OrdersListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading orders...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Failed to load orders.
      </p>
    );
  }

  const orders = data ?? [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have no orders yet.
            </p>
          ) : (
            <div className="divide-y">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 py-2 text-sm hover:underline"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Order #{order.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs uppercase text-muted-foreground">
                      {order.status}
                    </span>
                    <span className="font-semibold">
                      ${Number(order.totalPrice).toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



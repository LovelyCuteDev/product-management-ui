import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { http } from '../lib/http';
import type { Order } from './types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';

async function fetchOrder(id: string): Promise<Order> {
  const res = await http.get<Order>(`/orders/${id}`);
  return res.data;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
  });

  if (!id) {
    return <p className="text-sm text-destructive">Missing order id.</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading order...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Failed to load order.
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-destructive">
        Order not found.
      </p>
    );
  }

  const order = data;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Button asChild variant="ghost" className="w-fit">
        <Link to="/orders">&larr; Back to orders</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Order #{order.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">
                Placed:{' '}
                {new Date(order.createdAt).toLocaleString()}
              </span>
              <span className="text-xs uppercase text-muted-foreground">
                Status: {order.status}
              </span>
            </div>
            <span className="text-lg font-semibold">
              ${Number(order.totalPrice).toFixed(2)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Items</div>
            <div className="divide-y rounded-md border">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {item.product?.name ?? `Product #${item.productId}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ${Number(item.unitPrice).toFixed(2)} each
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">x {item.quantity}</span>
                    <span className="w-24 text-right text-sm font-medium">
                      {(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



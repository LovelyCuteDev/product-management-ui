import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { http } from '../lib/http';
import type { CartItem } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/toast';

async function fetchCart(): Promise<CartItem[]> {
  const res = await http.get<CartItem[]>('/cart');
  return res.data;
}

export function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });

  const updateMutation = useMutation({
    mutationFn: async (params: { id: number; quantity: number }) => {
      await http.put(`/cart/${params.id}`, { quantity: params.quantity });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      await http.delete(`/cart/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      addToast({
        title: 'Removed from cart',
        variant: 'success',
      });
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await http.post('/orders', {});
      return res.data as { id: number };
    },
    onSuccess: async (order) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cart'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ]);
      addToast({
        title: 'Order placed',
        description: `Order #${order.id} has been created.`,
        variant: 'success',
      });
      navigate(`/orders/${order.id}`);
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading cart...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Failed to load cart.
      </p>
    );
  }

  const items = data ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your cart is empty.
            </p>
            <Button asChild className="mt-4">
              <Link to="/products">Browse products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Cart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-md border px-3 py-2"
              >
                <div className="flex flex-1 flex-col">
                  <span className="font-medium">{item.product.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ${Number(item.product.price).toFixed(2)} each
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-20"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const next = parseInt(e.target.value, 10);
                      if (Number.isNaN(next) || next < 1) return;
                      updateMutation.mutate({ id: item.id, quantity: next });
                    }}
                  />
                  <span className="w-24 text-right text-sm font-medium">
                    ${(Number(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm font-medium">Subtotal</span>
            <span className="text-lg font-semibold">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-end gap-2">
            <Button asChild variant="outline">
              <Link to="/products">Continue shopping</Link>
            </Button>
            <Button
              type="button"
              disabled={placeOrderMutation.isPending}
              onClick={() => placeOrderMutation.mutate()}
            >
              {placeOrderMutation.isPending ? 'Placing order...' : 'Place order'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



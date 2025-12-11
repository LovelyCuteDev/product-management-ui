import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { type Product } from './types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../auth/AuthContext';
import { http } from '../lib/http';
import { useToast } from '../components/ui/toast';
import { API_CONFIG } from '../cosntants/api';

async function fetchProduct(id: string): Promise<Product> {
  const res = await http.get<Product>(`/products/${id}`);
  return res.data;
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });

  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await http.delete(`/products/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (vars: { productId: number; quantity: number }) => {
      await http.post('/cart', {
        productId: vars.productId,
        quantity: vars.quantity,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      addToast({
        title: 'Added to cart',
        description: 'Product was added to your cart.',
        variant: 'success',
      });
    },
  });

  if (!id) {
    return <p className="p-4 text-sm text-destructive">Missing product id.</p>;
  }

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Loading product...</p>;
  }

  if (error) {
    return (
      <p className="p-4 text-sm text-destructive">
        Failed to load product.
      </p>
    );
  }

  if (!data) {
    return (
      <p className="p-4 text-sm text-destructive">
        Product not found.
      </p>
    );
  }

  const product = data;
  const maxQuantity = product.stock;

  return (
    <div className="px-4 py-2">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Button asChild variant="ghost" className="w-fit">
          <Link to="/products">&larr; Back to products</Link>
        </Button>

        <Card>
          <CardHeader className="space-y-4">
            {product.images && product.images.length > 0 && (
              <img
                src={
                  product.images[0].url.startsWith('http')
                    ? product.images[0].url
                    : `${API_CONFIG.API_SERVER}${product.images[0].url}`
                }
                alt={product.name}
                className="h-64 w-full rounded-md object-cover"
              />
            )}
            <CardTitle className="text-2xl">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {product.description || 'No description'}
            </p>
            <div className="flex items-center justify-between gap-4 text-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-lg">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">
                    Stock: {product.stock}
                  </span>
                </div>
                {product.stock > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Quantity
                    </span>
                    <Input
                      type="number"
                      min={1}
                      max={maxQuantity}
                      className="h-8 w-20"
                      value={quantity}
                      onChange={(e) => {
                        const next = parseInt(e.target.value, 10);
                        if (Number.isNaN(next)) return;
                        const clamped = Math.min(
                          Math.max(next, 1),
                          maxQuantity,
                        );
                        setQuantity(clamped);
                      }}
                    />
                  </div>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  addToCartMutation.mutate({
                    productId: product.id,
                    quantity: Math.max(1, Math.min(quantity, maxQuantity || 1)),
                  })
                }
                disabled={addToCartMutation.isPending || product.stock <= 0}
              >
                {product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
              </Button>
            </div>
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link to={`/products/${product.id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



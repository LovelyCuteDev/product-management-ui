import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { type Product } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../auth/AuthContext';
import { http } from '../lib/http';
import { useToast } from '../components/ui/toast';
import { Input } from '../components/ui/input';
import { API_CONFIG } from '../cosntants/api';

interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

async function fetchProducts(params: { q: string }): Promise<ProductsResponse> {
  const res = await http.get<ProductsResponse>('/products', {
    params: {
      page: 1,
      limit: 12,
      q: params.q || undefined,
    },
  });
  return res.data;
}

async function addToCartRequest(productId: number) {
  await http.post('/cart', { productId, quantity: 1 });
}

export function ProductsListPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery<ProductsResponse, Error>({
    queryKey: ['products', { search }],
    queryFn: () => fetchProducts({ q: search }),
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: number) => addToCartRequest(productId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      addToast({
        title: 'Added to cart',
        description: 'Product was added to your cart.',
        variant: 'success',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-destructive">
        Failed to load products.
      </div>
    );
  }

  const products: Product[] = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="px-4 py-2">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
            {total > 0 && (
              <span className="text-xs text-muted-foreground">
                {total} product{total === 1 ? '' : 's'} found
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-48"
            />
            {user?.role === 'admin' && (
              <Button asChild>
                <Link to="/products/new">Add product</Link>
              </Button>
            )}
          </div>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products available yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product: Product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader className="space-y-2">
                  {product.images && product.images.length > 0 && (
                    <img
                      src={
                        product.images[0].url.startsWith('http')
                          ? product.images[0].url
                          : `${API_CONFIG.API_SERVER}${product.images[0].url}`
                      }
                      alt={product.name}
                      className="h-40 w-full rounded-md object-cover"
                    />
                  )}
                  <CardTitle className="line-clamp-1 text-base">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-3">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {product.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">Stock: {product.stock}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link to={`/products/${product.id}`}>View details</Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => addToCartMutation.mutate(product.id)}
                      disabled={addToCartMutation.isPending}
                    >
                      Add to cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



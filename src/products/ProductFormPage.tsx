import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Product } from './types';
import { useAuth } from '../auth/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { http } from '../lib/http';
import { useToast } from '../components/ui/toast';

async function fetchProduct(id: string): Promise<Product> {
  const res = await http.get<Product>(`/products/${id}`);
  return res.data;
}

interface UpsertPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);

  const { data: existingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setDescription(existingProduct.description ?? '');
      setPrice(existingProduct.price?.toString() ?? '');
      setStock(existingProduct.stock.toString());
    }
  }, [existingProduct]);

  const mutation = useMutation({
    mutationFn: async (payload: UpsertPayload) => {
      let productIdToUse: number | null = null;
      if (isEdit) {
        await http.put(`/products/${id}`, payload);
        productIdToUse = Number(id);
      } else {
        const res = await http.post<Product>('/products', payload);
        productIdToUse = res.data.id;
      }

      if (productIdToUse && files && files.length > 0) {
        const formData = new FormData();
        Array.from(files).forEach((file) => {
          formData.append('files', file);
        });
        await http.post(`/products/${productIdToUse}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['product', id] }),
      ]);
      addToast({
        title: isEdit ? 'Product updated' : 'Product created',
        variant: 'success',
      });
      navigate('/products');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? 'Failed to save product');
    },
  });

  if (!user || user.role !== 'admin') {
    return (
      <p className="p-4 text-sm text-destructive">
        You are not allowed to manage products.
      </p>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNumber = parseFloat(price);
    const stockNumber = parseInt(stock, 10);

    if (Number.isNaN(priceNumber) || Number.isNaN(stockNumber)) {
      setError('Price and stock must be valid numbers.');
      return;
    }

    mutation.mutate({
      name,
      description,
      price: priceNumber,
      stock: stockNumber,
    });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit product' : 'Create product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="images">Images</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setFiles(e.target.files)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/products')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending
                    ? isEdit
                      ? 'Saving...'
                      : 'Creating...'
                    : isEdit
                      ? 'Save changes'
                      : 'Create product'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



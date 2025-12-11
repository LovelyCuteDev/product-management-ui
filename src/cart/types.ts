import type { Product } from '../products/types';

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: Product;
}



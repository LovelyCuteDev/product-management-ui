export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  product?: {
    id: number;
    name: string;
  };
}

export interface Order {
  id: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  totalPrice: string;
  createdAt: string;
  items?: OrderItem[];
}



export type PaymentMethod = 'cash';

export type Product = {
  id: string;
  name: string;
  price: number;
  category?: string;
  available: boolean;
  imageUrl?: string;
};

export type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type Transaction = {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  change: number;
  syncStatus: 'pending' | 'synced';
};

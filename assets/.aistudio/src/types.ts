export interface Product {
  id: string;
  name: string;
  arabicName: string;
  price: number;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  dateTime: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  cashReceived: number;
  changeReturn: number;
}

export interface AndroidFile {
  name: string;
  path: string;
  language: 'kotlin' | 'xml' | 'gradle';
  code: string;
}

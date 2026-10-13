import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  total: number;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (order: Omit<Order, 'id' | 'status'>) => {
    console.log('Adding new order:', order);
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      status: 'pending',
    };
    console.log('Created order with ID:', newOrder.id);
    setOrders(prev => {
      const updatedOrders = [newOrder, ...prev];
      console.log('Updated orders list:', updatedOrders);
      return updatedOrders;
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    console.log(`Updating order ${orderId} status to:`, status);
    setOrders(prev => {
      const updatedOrders = prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      );
      console.log('Orders after status update:', updatedOrders);
      return updatedOrders;
    });
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

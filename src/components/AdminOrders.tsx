import { useState, useEffect } from "react";
import { API_URL } from "../config";
import { useLanguage } from '../contexts/LanguageContext';

// Type for API response: has flower.name
interface ApiOrderItem {
  quantity: number;
  price: number;
  flower: {
    name: string;
  };
}

interface ApiOrder {
  id: string;
  name: string;
  phone_number: string;
  address: string;
  telegram_username: string;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  items: ApiOrderItem[];
}

// Frontend type: has item.name (already extracted)
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderType {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    telegram_username: string;
  };
  items: OrderItem[];
  total: number;
  date: string;
  status: 'pending' | 'paid' | 'cancelled';
}

interface OrderItemProps {
  order: OrderType;
  onStatusChange: (orderId: string, status: string) => void;
  onDelete: (orderId: string) => void;
}

const OrderItem = ({ order, onStatusChange, onDelete }: OrderItemProps) => {
  const { t } = useLanguage();
  return (
    <>
      {/* Mobile Card View */}
      <div className="sm:hidden p-4 border-b border-[#f0e5ef] hover:bg-[#fff7fa] transition">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="font-semibold text-black">#{order.id}</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="font-medium text-black">{order.customer.name}</div>
          <div className="text-sm text-gray-500">{order.customer.phone}</div>
          <div className="text-sm text-gray-500 truncate">{order.customer.address}</div>
          {order.customer.telegram_username && (
            <div className="text-sm text-gray-500">@{order.customer.telegram_username}</div>
          )}
        </div>

        <div className="mb-3">
          <div className="text-sm font-medium text-gray-700">{t('a.orders.products')}:</div>
          {order.items.map((item, i) => (
            <div key={i} className="text-sm text-black">
              {item.quantity} x {item.name} — {item.total.toLocaleString()} UZS
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-3">
          <div className="font-medium text-black">{order.total.toLocaleString()} UZS</div>
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              order.status === 'paid'
                ? 'bg-green-100 text-green-800'
                : order.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            <option value="pending">{t('a.status.pending')}</option>
            <option value="paid">{t('a.status.paid')}</option>
            <option value="cancelled">{t('a.status.cancelled')}</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onDelete(order.id)}
            className="text-xs bg-[#ffeef0] hover:bg-red-200 text-[#e57373] px-3 py-1 rounded transition"
          >
            {t('a.orders.delete')}
          </button>
        </div>
      </div>

      {/* Desktop Table Row */}
      <div className="hidden sm:flex items-center px-6 py-4 hover:bg-[#fff7fa] transition text-sm">
        <div className="basis-[15%] font-medium text-black">{`#${order.id}`}</div>
        <div className="basis-[22%] text-black">
          <div className="font-medium truncate">{order.customer.name}</div>
          <div className="text-xs text-gray-500 truncate">{order.customer.phone}</div>
          <div className="text-xs text-gray-500 truncate">{order.customer.address}</div>
          {order.customer.telegram_username && (
            <div className="text-xs text-gray-500">@{order.customer.telegram_username}</div>
          )}
        </div>
        <div className="basis-[23%] text-black">
          {order.items.map((item, i) => (
            <div key={i} className="text-xs truncate">
              {item.quantity}x {item.name}
            </div>
          ))}
        </div>
        <div className="basis-[12%] font-medium text-black">{order.total.toLocaleString()} UZS</div>
        <div className="basis-[13%]">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium min-w-[120px] ${
              order.status === 'paid'
                ? 'bg-green-100 text-green-800'
                : order.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            <option value="pending">{t('a.status.pending')}</option>
            <option value="paid">{t('a.status.paid')}</option>
            <option value="cancelled">{t('a.status.cancelled')}</option>
          </select>
        </div>
        <div className="basis-[15%] flex items-center justify-between gap-2">
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {new Date(order.date).toLocaleString()}
          </div>
          <button
            onClick={() => onDelete(order.id)}
            className="text-xs bg-[#ffeef0] hover:bg-red-200 text-[#e57373] px-3 py-1 rounded transition min-w-[86px] text-center"
          >
            {t('a.orders.delete')}
          </button>
        </div>
      </div>
    </>
  );
};

interface AdminOrdersProps {
  makeAuthenticatedRequest?: (url: string, options?: RequestInit) => Promise<Response>;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ makeAuthenticatedRequest }) => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback function if no authenticated request function is provided
  const defaultAuthRequest = async (url: string, options: RequestInit = {}) => {
    const token = sessionStorage.getItem('adminToken');

    // Normalize headers to reliably set Authorization
    const hdrs = new Headers(options.headers as any);
    hdrs.set('Cache-Control', 'no-cache');
    hdrs.set('Pragma', 'no-cache');
    if (!hdrs.has('Content-Type')) hdrs.set('Content-Type', 'application/json');
    if (token && !hdrs.has('Authorization')) hdrs.set('Authorization', `Bearer ${token}`);

    return fetch(url, {
      ...options,
      headers: Object.fromEntries(hdrs.entries()),
    });
  };

  const authRequest = makeAuthenticatedRequest || defaultAuthRequest;

  // In AdminOrders.tsx, update the fetchOrders function to handle auth errors better:

  // In AdminOrders.tsx, replace the fetchOrders function with this:

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Add debugging
      console.log('Fetching orders with auth...');
      console.log('Admin token (sessionStorage):', sessionStorage.getItem('adminToken'));

      const response = await authRequest(`${API_URL}/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log('Orders response:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.log("Orders request failed with auth error:", response.status);
          const responseText = await response.text();
          console.log("Auth error response:", responseText);
          setOrders([]);
          setError(t('a.orders.noAccess'));
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const rawData = await response.json();
      console.log("Raw API response:", rawData);

      const apiOrders: ApiOrder[] = Array.isArray(rawData)
        ? rawData
        : rawData.orders || [];

      const mappedOrders: OrderType[] = apiOrders.map((order) => {
        const items = (order.items || []).map((item) => ({
          name: item.flower?.name || t('a.orders.unknownProduct'),
          quantity: item.quantity || 1,
          price: item.price || 0,
          total: (item.quantity || 0) * (item.price || 0),
        }));

        const total = items.reduce((sum, item) => sum + item.total, 0);

        return {
          id: order.id,
          customer: {
            name: order.name || t('a.orders.unknown'),
            phone: order.phone_number || t('a.orders.unknown'),
            address: order.address || t('a.orders.noAddress'),
            telegram_username: order.telegram_username || "",
          },
          items,
          total,
          date: order.created_at || new Date().toISOString(),
          status: order.status || 'pending',
        };
      });

      console.log("Mapped orders:", mappedOrders);
      setOrders(mappedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(t('a.orders.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      let response;
      try {
        response = await authRequest(`${API_URL}/orders/${orderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (authError) {
        if (authError instanceof Error && authError.message === "Authentication failed") {
          alert(t('a.orders.authError'));
          return;
        }
        throw authError;
      }

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus as any } : order
          )
        );
        alert(t('a.orders.statusUpdated'));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Status update failed:", errorData);
        alert(t('a.orders.statusError'));
      }
    } catch (err) {
      console.error("Network error:", err);
      alert(t('a.orders.networkError'));
    }
  };

  const handleDelete = async (orderId: string) => {
    const confirmed = window.confirm(t('a.orders.deleteConfirm'));
    if (!confirmed) return;

    try {
      let response;
      try {
        response = await authRequest(`${API_URL}/orders/${orderId}`, {
          method: "DELETE",
        });
      } catch (authError) {
        if (authError instanceof Error && authError.message === "Authentication failed") {
          alert(t('a.orders.authError'));
          return;
        }
        throw authError;
      }

      if (response.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        alert(t('a.orders.deleted'));
      } else {
        const errorText = await response.text().catch(() => "");
        console.error("Order delete failed:", response.status, errorText);
        alert(t('a.orders.deleteError'));
      }
    } catch (err) {
      console.error("Network error:", err);
      alert(t('a.orders.networkError'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
        <button
          onClick={fetchOrders}
          className="ml-4 text-sm bg-pink-500 text-white px-3 py-1 rounded"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8 px-4 sm:py-10">
      <div className="bg-[#fff4f7] rounded-xl shadow-lg w-full max-w-5xl p-5 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-black text-center sm:text-left">
          {t('a.orders.title')}
        </h2>

        <div className="bg-white rounded-lg shadow border border-[#f0e5ef] overflow-hidden">
          {/* Header */}
          <div className="hidden sm:flex bg-[#fdf6f9] border-b border-[#f0e5ef] text-black font-semibold px-6 py-3 text-sm">
            <div className="basis-[15%]">{t('a.orders.order')}</div>
            <div className="basis-[22%]">{t('a.orders.client')}</div>
            <div className="basis-[23%]">{t('a.orders.products')}</div>
            <div className="basis-[12%]">{t('a.orders.total')}</div>
            <div className="basis-[13%]">{t('a.orders.status')}</div>
            <div className="basis-[15%] flex justify-between"><span>{t('a.orders.date')}</span><span className="pr-2">{t('a.orders.action')}</span></div>
          </div>

          <div className="divide-y divide-[#f0e5ef]">
            {orders.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                {t('a.orders.empty')}
              </div>
            ) : (
              orders.map((order) => (
                <OrderItem
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

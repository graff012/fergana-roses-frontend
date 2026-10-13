import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaRegCopy,
} from "react-icons/fa";
import { getImageUrl } from "../config";

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
    itemCount,
  } = useCart();

  const handleCopySummary = async () => {
    const lines = cartItems.map(
      (item, index) =>
        `${index + 1}. ${item.name} x${item.quantity} - ${(
          Number(item.price) * item.quantity
        ).toLocaleString()} UZS`,
    );

    const summary = [
      t('s.cart.clipboardTitle'),
      ...lines,
      `${t('s.cart.total')} ${cartTotal.toLocaleString()} UZS`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopyMessage(t('s.cart.copied'));
    } catch (error) {
      console.error("Failed to copy cart summary:", error);
      setCopyMessage(t('s.cart.copyFailed'));
    }
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <FaShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t('s.cart.emptyTitle')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('s.cart.emptyHint')}
          </p>
          <Link
            to="/"
            className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
          >
            {t('s.cart.backToFlowers')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <FaArrowLeft className="mr-2" />
              {t('s.cart.back')}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{t('s.cart.title')}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    {t('s.cart.selectedTitle')}
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    {t('s.cart.catalogNote')}
                  </p>

                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div key={item.id} className="py-4 flex">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={getImageUrl(item.imgUrl)}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.jpg";
                            }}
                          />
                        </div>

                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{item.name}</h3>
                              <p className="ml-4">
                                {Number(item.price).toLocaleString()} UZS
                              </p>
                            </div>
                            {"category" in item && item.category && (
                              <p className="mt-1 text-sm text-gray-500">
                                {item.category}
                              </p>
                            )}
                          </div>

                          <div className="flex-1 flex items-end justify-between text-sm">
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="text-gray-500 hover:text-gray-700 p-1"
                                disabled={item.quantity <= 1}
                              >
                                <FaMinus className="h-4 w-4" />
                              </button>
                              <span className="mx-2 text-gray-700">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="text-gray-500 hover:text-gray-700 p-1"
                              >
                                <FaPlus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="font-medium text-pink-600 hover:text-pink-500"
                            >
                              <FaTrash className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {t('s.cart.summaryTitle')}
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {(Number(item.price) * item.quantity).toLocaleString()}{" "}
                        UZS
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t('s.cart.total')}</span>
                      <span>{cartTotal.toLocaleString()} UZS</span>
                    </div>
                  </div>
                </div>

                {copyMessage && (
                  <div className="mt-4 rounded-lg bg-green-50 text-green-700 p-3 text-sm">
                    {copyMessage}
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="w-full inline-flex items-center justify-center gap-2 bg-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-600 transition-colors"
                  >
                    <FaRegCopy />
                    {t('s.cart.copyList')}
                  </button>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    {t('s.cart.clear')}
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium transition-colors"
                >
                  <FaArrowLeft size={12} /> {t('s.cart.backToFlowers')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import { FaArrowLeft, FaShare } from "react-icons/fa6";
import { API_URL, getImageUrl } from "../config";

interface Flower {
  id: string;
  name: string;
  smell: string;
  flowerSize: string;
  height: string;
  imgUrl?: string;
  categoryId: string;
  price: string;
  // isLiked has been removed
}

const FlowerDetail = () => {
  const { t } = useLanguage();
  // Map enum/string smell values to localized labels for UI only
  const formatSmell = (value: string): string => {
    if (!value) return "";
    const key = value.toUpperCase().replace(/\s+/g, "_");
    const map: Record<string, string> = {
      WEAK: t('s.smell.weak'),
      AVERAGE: t('s.smell.average'),
      STRONG: t('s.smell.strong'),
      VERY_STRONG: t('s.smell.veryStrong'),
      // Common fallbacks
      LOW: t('s.smell.weak'),
      MEDIUM: t('s.smell.average'),
      HIGH: t('s.smell.strong'),
    };
    return map[key] || value;
  };
  const { id } = useParams<{ id: string }>();
  const [flower, setFlower] = useState<Flower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();



  // Fetch flower details
  useEffect(() => {
    const fetchFlower = async () => {
      try {
        const response = await fetch(`${API_URL}/flowers/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Flower not found");
        }

        const data = await response.json();
        const flowerData = data.flower || data;

        // Format the flower data
        setFlower({
          ...flowerData,
          imgUrl: flowerData.imgUrl || flowerData.img_url || "",
          flowerSize: flowerData.flowerSize || flowerData.flower_size || "",
          categoryId: flowerData.categoryId || flowerData.category_id || "",
        });
      } catch {
        setError("LOAD_ERROR");
      } finally {
        setLoading(false);
      }
    };

    fetchFlower();
  }, [id]);

  // Check if already in cart
  useEffect(() => {
    const isInCart = cartItems.some((item) => item.id === flower?.id);
    setAddedToCart(isInCart);
  }, [cartItems, flower?.id]);

  // Add to cart
  const handleAddToCart = () => {
    if (!flower) return;

    addToCart({
      id: flower.id,
      name: flower.name,
      price: flower.price,
      imgUrl: flower.imgUrl,
    });
    setAddedToCart(true);
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: flower?.name,
          text: `${t('s.detail.shareText')}${flower?.name}`,
          url: window.location.href,
        });
      } catch {
        // user cancelled share — ignore
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t('s.detail.linkCopied'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !flower) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col items-center justify-center px-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <p className="text-red-500 mb-6 text-lg">
            {error ? t('s.detail.loadError') : t('s.detail.notFound')}
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
          >
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft className="text-lg" />
              <span>{t('s.detail.back')}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={t('s.detail.share')}
              >
                <FaShare className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-4 lg:py-12 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden">
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="lg:flex">
              {/* Desktop Image */}
              <div className="lg:flex-shrink-0 relative">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400">{t('s.detail.imageLoading')}</div>
                  </div>
                )}
                <img
                  className={`h-96 w-full object-cover lg:w-96 transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  src={getImageUrl(flower.imgUrl)}
                  alt={flower.name}
                  onLoad={() => {
                    setImageLoaded(true);
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.jpg";
                    setImageLoaded(true);
                  }}
                />
              </div>

              {/* Desktop Content */}
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                      {t('s.card.flowerSize')}: {flower.flowerSize} • {t('s.card.height')}: {flower.height}
                    </div>
                    <h1 className="block mt-1 text-3xl font-medium text-gray-900">
                      {flower.name}
                    </h1>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleShare}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label={t('s.detail.share')}
                    >
                      <FaShare className="text-lg" />
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-gray-600">
                  <span className="font-semibold">{t('s.card.smell')}:</span> {formatSmell(flower.smell)}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {flower.price} {t('s.card.currency')}
                </p>

                <div className="mt-8">
                  <button
                    className={`w-full lg:w-auto px-8 py-3 text-white rounded-lg transition-all duration-200 font-medium ${addedToCart
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-pink-500 hover:bg-pink-600 hover:scale-105"
                      }`}
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                  >
                    {addedToCart ? t('s.card.added') : t('s.card.addToCart')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Mobile Image */}
            <div className="relative">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400">{t('s.detail.imageLoading')}</div>
                </div>
              )}
              <img
                className={`w-full h-64 sm:h-80 object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                src={getImageUrl(flower.imgUrl)}
                alt={flower.name}
                onLoad={() => {
                  setImageLoaded(true);
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.jpg";
                  setImageLoaded(true);
                }}
              />
            </div>

            {/* Mobile Content */}
            <div className="p-6">
              <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-2">
                {t('s.card.flowerSize')}: {flower.flowerSize} • {t('s.card.height')}: {flower.height}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {flower.name}
              </h1>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  <span className="font-semibold">{t('s.card.smell')}:</span> {formatSmell(flower.smell)}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-bold text-pink-600">
                  {flower.price} {t('s.card.currency')}
                </p>
              </div>

              <button
                className={`w-full py-4 px-6 text-white rounded-xl transition-all duration-200 font-medium text-lg ${addedToCart
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 hover:scale-[1.02] active:scale-[0.98]"
                  } shadow-lg`}
                onClick={handleAddToCart}
                disabled={addedToCart}
              >
                {addedToCart ? t('s.card.added') : t('s.card.addToCart')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowerDetail;

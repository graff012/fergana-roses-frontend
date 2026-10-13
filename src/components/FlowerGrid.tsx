import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import { API_URL, getImageUrl } from "../config";

interface Flower {
  id: string;
  name: string;
  smell: string;
  flowerSize: string;
  height: string;
  imgUrl?: string | null;
  categoryId: string;
  price: string;
  isLiked?: boolean;
  stock?: number;
}

interface Category {
  id: string;
  name: string;
}

interface FlowerGridProps {
  searchTerm: string;
  selectedCategoryId?: string; // empty or undefined means All
}

const FlowerGrid = ({ searchTerm, selectedCategoryId }: FlowerGridProps) => {
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
    return map[key] || value; // default to original if unknown
  };

  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredFlowers, setFilteredFlowers] = useState<Flower[]>([]);
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { addToCart, cartItems } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlowers = async () => {
    try {
      const res = await fetch(`${API_URL}/flowers`, {
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          window.location.reload();
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const flowersData = Array.isArray(data) ? data : data?.flowers || [];

      const formattedFlowers = flowersData.map((flower: any) => ({
        ...flower,
        imgUrl: flower.imgUrl || flower.img_url || null,
        flowerSize: flower.flowerSize || flower.flower_size || "",
        categoryId: flower.categoryId || flower.category_id || "",
        stock: typeof flower.stock === 'number' ? flower.stock : Number(flower.stock) || 0,
      }));

      // Sort by Cyrillic name (alphabet order)
      const sortedFlowers = [...formattedFlowers].sort((a: Flower, b: Flower) =>
        a.name.localeCompare(b.name, "ru", { sensitivity: "base" })
      );

      setFlowers(sortedFlowers);
      setFilteredFlowers(sortedFlowers);
      setError(null);
    } catch {
      setError("LOAD_ERROR");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        const categoriesData = Array.isArray(data)
          ? data
          : data?.categories || [];
        setCategories(categoriesData);
      }
    } catch {
      // categories are optional for grid rendering
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchFlowers(), fetchCategories()]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const term = searchTerm?.toLowerCase() || "";
    const catId = selectedCategoryId || "";

    const result = flowers.filter((f) => {
      // category filter first
      if (catId && (f.categoryId || "").toString() !== catId) return false;

      if (!term) return true;
      const catName = getCategoryName(f.categoryId).toLowerCase();
      return (
        f.name.toLowerCase().includes(term) ||
        f.smell.toLowerCase().includes(term) ||
        catName.includes(term)
      );
    });

    // Always keep filtered list alphabetically sorted by Cyrillic name
    const sorted = [...result].sort((a, b) =>
      a.name.localeCompare(b.name, "ru", { sensitivity: "base" })
    );

    setFilteredFlowers(sorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategoryId, flowers, categories]);

  const getCategoryName = (id: string): string => {
    return categories.find((c) => c.id === id)?.name || t('s.grid.uncategorized');
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  if (loading) {
    return (
      <section className="w-full py-8 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-2/3 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
                <div className="h-10 w-full bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-8 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center py-12 bg-white rounded-xl shadow">
          <p className="text-lg text-gray-700 mb-4">{t('s.grid.loadError')}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="flowers-section"
      className="w-full py-8 px-4 bg-gradient-to-br from-pink-50 to-purple-50 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto">
        {filteredFlowers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-xl text-gray-600">{t('s.grid.emptyTitle')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('s.grid.emptyHint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlowers.map((flower) => (
              <Link
                to={`/flowers/${flower.id}`}
                key={flower.id}
                className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  {flower.imgUrl && !imageErrors[flower.id] ? (
                    <img
                      src={getImageUrl(flower.imgUrl)}
                      alt={flower.name}
                      loading="lazy"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        handleImageError(flower.id);
                        e.preventDefault();
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-2 opacity-50"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm">{t('s.grid.noImage')}</p>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                      {getCategoryName(flower.categoryId)}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">
                    {flower.name}
                  </h2>
                  <div className="space-y-2 mb-4 text-sm">
                    <div>
                      <span className="font-medium">{t('s.card.smell')}:</span>{" "}
                      {formatSmell(flower.smell)}
                    </div>
                    <div>
                      <span className="font-medium">{t('s.card.flowerSize')}:</span>{" "}
                      {flower.flowerSize}
                    </div>
                    <div>
                      <span className="font-medium">{t('s.card.height')}:</span>{" "}
                      {flower.height}
                    </div>
                    <div>
                      <span className="font-medium">{t('s.card.quantity')}:</span>{" "}
                      {typeof flower.stock === 'number' ? flower.stock : 0} {t('s.card.pieces')}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-pink-600">
                      {flower.price} {t('s.card.currency')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if ((flower.stock ?? 0) > 0) {
                        addToCart({
                          id: flower.id,
                          name: flower.name,
                          price: flower.price,
                          imgUrl: flower.imgUrl as string,
                          category: getCategoryName(flower.categoryId),
                        });
                        setAddedToCart((prev) => ({
                          ...prev,
                          [flower.id]: true,
                        }));
                      }
                    }}
                    disabled={
                      (flower.stock ?? 0) === 0 ||
                      addedToCart[flower.id] ||
                      cartItems.some((item) => item.id === flower.id)
                    }
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg ${(flower.stock ?? 0) === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : addedToCart[flower.id] || cartItems.some((item) => item.id === flower.id)
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-500 to-green-600 "
                      } text-white`}
                  >
                    {(flower.stock ?? 0) === 0
                      ? t('s.card.outOfStock')
                      : addedToCart[flower.id] || cartItems.some((item) => item.id === flower.id)
                        ? t('s.card.added')
                        : t('s.card.addToCart')}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FlowerGrid;

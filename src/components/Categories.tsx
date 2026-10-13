import { useEffect, useState } from "react"
import { API_URL } from "../config"
import { useLanguage } from "../contexts/LanguageContext"

type Category = {
  id: string;
  name: string;
}

interface CategoriesProps {
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

const Categories = ({ selectedCategoryId, onSelectCategory }: CategoriesProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        const categoriesData: Category[] = Array.isArray(data) ? data : (data?.categories || []);
        setCategories(categoriesData)
      } else {
        console.error("Failed to fetch Categories", res.status)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [])

  return (
    <section className="mt-6 mb-6 md:mt-10 md:mb-10 px-4 flex justify-center">
      <div className="mycon w-full max-w-4xl">
        {loading ? (
          <div className="flex justify-center">
            <span className="text-gray-600">{t('common.loading')}</span>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-x-8">
            <button
              key="all"
              className={`border border-gray-500 py-1.5 px-3 sm:py-2 sm:px-4 rounded-md text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 hover:cursor-pointer ${selectedCategoryId === '' ? 'bg-blue-600 text-white' : 'bg-amber-100 text-black'}`}
              onClick={() => onSelectCategory('')}
            >
              {t('s.categories.all')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`border border-gray-500 py-1.5 px-3 sm:py-2 sm:px-4 rounded-md text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 hover:cursor-pointer ${selectedCategoryId === cat.id ? 'bg-blue-600 text-white' : 'bg-amber-100 text-black'}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Categories

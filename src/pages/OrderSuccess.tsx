import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

const OrderSuccess = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <FaCheckCircle className="text-green-500 text-6xl mb-4" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('s.order.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('s.order.subtitle')}
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              {t('common.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

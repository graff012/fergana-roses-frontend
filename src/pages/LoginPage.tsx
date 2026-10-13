import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const LoginPage = () => {
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // This is a mock login for testing
      // In a real app, you would call your authentication API here
      // For testing, we'll use a mock user
      const mockUser = {
        id: '91265888-f4e1-438b-a773-34ce8c85ff05',
        phone_number: phoneNumber,
        first_name: 'Test',
        last_name: 'User'
      };
      
      login({
        user: mockUser,
        token: 'mock-jwt-token-for-testing'
      });
      
      // Redirect to home page after successful login
      navigate('/');
    } catch (err) {
      setError('LOGIN_ERROR');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('s.login.title')}
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{t('s.login.error')}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="phone-number" className="sr-only">
                {t('s.login.phone')}
              </label>
              <input
                id="phone-number"
                name="phone"
                type="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder={t('s.login.phone')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('s.login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder={t('s.login.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              {t('s.login.submit')}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-pink-600 hover:text-pink-500"
              onClick={() => {
                // For testing, auto-fill with test user
                setPhoneNumber('+998901234567');
                setPassword('test123');
              }}
            >
              {t('s.login.testLogin')}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft className="text-xs" />
              {t('common.backToHome')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

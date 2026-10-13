import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { useLanguage } from '../contexts/LanguageContext';
import { API_URL } from "../config";

const AdminLogin = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phoneNumber.trim() || !formData.password) {
      setError(t('a.login.fillAll'));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber.trim(), // Using camelCase to match backend DTO
          password: formData.password,
          isAdmin: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('a.login.failFallback'));
      }

      if (!data.token) {
        throw new Error(t('a.login.noToken'));
      }

      // Store the token and redirect
      await login(data.token, () => {
        navigate('/admin');
      });

    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : t('a.login.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex flex-col bg-[#f8f6fa] py-6">
      {/* Top nav: back to main site */}
      <div className="w-full max-w-md mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo-fergana.jpg"
            alt="Fergana Roses"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#f2b5d4] group-hover:scale-105 transition-transform"
          />
          <span className="font-semibold text-gray-800 font-[Chillax]">
            Fergana Roses
          </span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaArrowLeft className="text-xs" />
          {t('common.backHome')}
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black font-[Chillax] mb-2">
            {t('a.login.title')}
          </h1>
          <p className="text-gray-600">
            {t('a.login.subtitle')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black mb-2"
            >
              {t('a.login.phoneLabel')}
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder={t('a.login.phonePlaceholder')}
              className="w-full border border-[#e7d6e0] rounded-lg py-3 px-4 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4] focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black mb-2"
            >
              {t('a.login.passwordLabel')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('a.login.passwordPlaceholder')}
                autoComplete="current-password"
                className="w-full border border-[#e7d6e0] rounded-lg py-3 px-4 pr-12 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4] focus:border-transparent transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('a.login.hidePassword') : t('a.login.showPassword')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors p-1"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f2b5d4] hover:bg-[#e7a3c4] disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-lg shadow transition duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('a.login.signingIn')}
              </span>
            ) : (
              t('a.login.signIn')
            )}
          </button>
        </form>

        {/* Footer */}
        {/* <div className="mt-8 text-center"> */}
        {/*   <p className="text-sm text-gray-600"> */}
        {/*     Forgot your password?{" "} */}
        {/*     <a */}
        {/*       href="/forgot-password" */}
        {/*       className="text-[#f2b5d4] hover:text-[#e7a3c4] font-medium" */}
        {/*     > */}
        {/*       Reset it here */}
        {/*     </a> */}
        {/*   </p> */}
        {/* </div> */}

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft className="text-xs" />
              {t('common.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;

import { Link, useNavigate } from "react-router-dom";
import { IoSearchSharp } from "react-icons/io5";
import {
  FaCartShopping,
  FaPhone,
  FaUserShield,
  FaBars,
} from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { API_URL } from "../config";

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

interface Flower {
  id: string;
  name: string;
  smell: string;
  flowerSize: string;
  height: string;
  imgUrl?: string;
  categoryId: string;
  price: string;
  isLiked?: boolean;
}

const Header = ({ searchTerm, setSearchTerm }: HeaderProps) => {
  const [inputValue, setInputValue] = useState(searchTerm);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Flower[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const [showContacts, setShowContacts] = useState(false);
  const contactsRef = useRef<HTMLDivElement | null>(null);
  const { itemCount } = useCart();
  const { t } = useLanguage();

  // Fetch all flowers for autocomplete
  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const res = await fetch(`${API_URL}/flowers`, {
          credentials: "include",
        });
        if (res.ok) {
          const response = await res.json();
          setFlowers(response.flowers || []);
        }
      } catch {
        // autocomplete is best-effort; ignore network errors
      }
    };
    fetchFlowers();
  }, []);

  // Filter suggestions as user types
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    } else if (Array.isArray(flowers)) {
      const filtered = flowers.filter((flower) =>
        flower?.name?.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  }, [inputValue, flowers]);

  // Hide suggestions/contacts on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const suggestionsClickedInside =
        suggestionsRef.current && suggestionsRef.current.contains(target);
      const contactsClickedInside =
        contactsRef.current && contactsRef.current.contains(target);

      if (!suggestionsClickedInside) {
        setShowSuggestions(false);
      }
      if (!contactsClickedInside) {
        setShowContacts(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearchFocus = () => {
    if (filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearch = () => {
    setSearchTerm(inputValue);
    setShowSuggestions(false);
    setShowMobileSearch(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const navigate = useNavigate();

  const handleSuggestionClick = (flower: Flower) => {
    setInputValue(flower.name);
    setSearchTerm(flower.name);
    setShowSuggestions(false);
    setShowMobileSearch(false);
    navigate(`/flowers/${flower.id}`);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowMobileSearch(false);
    setShowContacts(false);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    setShowMobileMenu(false);
    setShowContacts(false);
  };

  const toggleContacts = () => {
    setShowContacts((prev) => !prev);
    setShowSuggestions(false);
    setShowMobileMenu(false);
    setShowMobileSearch(false);
  };

  return (
    <header className="sticky top-0 bg-[#004F44] z-50 shadow-lg">
      {/* Main header bar */}
      <div className="pt-2 pb-2 md:pt-2 md:pb-2">
        <div className="mycon">
          {/* Desktop layout */}
          <div className="hidden md:flex justify-between items-center gap-x-4">
            <Link to={"/"} className="flex-shrink-0 flex items-center gap-3 group">
              <img
                src="/logo-fergana.jpg"
                alt="Fergana Roses logo"
                className="h-14 w-14 rounded-full object-cover ring-2 ring-white/80 shadow-md group-hover:scale-105 transition-transform"
              />
              <span className="leading-tight">
                <span className="block text-white font-semibold text-lg tracking-wide font-[Chillax]">
                  Fergana Roses
                </span>
                <span className="block text-white/70 text-[11px] uppercase tracking-[0.2em]">
                  Premium Nursery
                </span>
              </span>
            </Link>

            {/* Desktop Search - Separated for better spacing */}
            <div className="flex-1 flex justify-center px-2 lg:px-4 max-w-3xl min-w-0">
              <div className="flex flex-col relative w-full">
                <div className="flex justify-between gap-2 items-center border border-white rounded-lg px-4 py-2 bg-[#004F44] h-12 w-full">
                  <IoSearchSharp className="text-2xl text-white flex-shrink-0" />
                  <input
                    type="search"
                    placeholder={t('s.header.searchPlaceholder')}
                    className="text-lg lg:text-xl border-none flex-1 appearance-none focus:outline-none text-white bg-transparent h-full px-2 min-w-0"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleSearchFocus}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                  />
                  <button
                    className="px-3 lg:px-4 py-1 bg-white text-[#004F44] rounded hover:bg-gray-200 transition-colors font-medium flex-shrink-0 text-sm lg:text-base"
                    onClick={handleSearch}
                    aria-label={t('s.header.searchButton')}
                  >
                    {t('s.header.searchButton')}
                  </button>
                </div>
                {showSuggestions && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                  >
                    {filteredSuggestions.map((flower) => (
                      <div
                        key={flower.id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-black"
                        onClick={() => handleSuggestionClick(flower)}
                      >
                        {flower.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation Icons */}
            <div className="flex gap-x-2 lg:gap-x-4 items-center flex-shrink-0">
              <Link
                to="/cart"
                className="p-2 lg:p-3 border border-white rounded-lg relative hover:cursor-pointer hover:bg-[#00695C] transition-all group"
                title={t('s.header.cartTitle')}
              >
                <FaCartShopping className="text-white group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              <Link
                to="/admin"
                className="p-2 lg:p-3 border border-white rounded-lg hover:cursor-pointer hover:bg-[#00695C] transition-all group"
                title={t('s.header.adminTitle')}
              >
                <FaUserShield className="text-white group-hover:scale-110 transition-transform text-lg" />
              </Link>

              <div className="relative" ref={contactsRef}>
                <button
                  onClick={toggleContacts}
                  className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white font-medium transition-colors group whitespace-nowrap"
                  aria-expanded={showContacts}
                  aria-haspopup="true"
                >
                  <FaPhone className="group-hover:scale-110 transition-transform" />
                  <span className="inline">{t('s.header.contacts')}</span>
                </button>

                {showContacts && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
                    <a
                      href="tel:+998911116692"
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-[#004F44]"
                    >
                      <FaPhone />
                      <span className="text-sm">+998 91 111 66 92 Elyorjon</span>
                    </a>
                    <a
                      href="tel:+998904979797"
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-[#004F44]"
                    >
                      <FaPhone />
                      <span className="text-sm">+998 90 497 97 97 Nozimjon</span>
                    </a>
                  </div>
                )}
              </div>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden">
            <div className="flex justify-between items-center">
              <Link to={"/"} className="flex-shrink-0 flex items-center gap-2">
                <img
                  src="/logo-fergana.jpg"
                  alt="Fergana Roses logo"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white/80 shadow"
                />
                <span className="text-white font-semibold tracking-wide font-[Chillax]">
                  Fergana Roses
                </span>
              </Link>

              <div className="flex items-center gap-2">
                {/* Mobile Search Button */}
                <button
                  onClick={toggleMobileSearch}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label={t('s.header.searchAria')}
                >
                  <IoSearchSharp className="text-xl" />
                </button>

                {/* Mobile Cart with badge */}
                <Link
                  to="/cart"
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors relative"
                  title={t('s.header.cartTitle')}
                >
                  <FaCartShopping className="text-xl" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label={t('s.header.menuAria')}
                >
                  {showMobileMenu ? (
                    <FaTimes className="text-xl" />
                  ) : (
                    <FaBars className="text-xl" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {
        showMobileSearch && (
          <div className="md:hidden bg-[#004F44] border-t border-white/20 px-4 pb-4">
            <div className="flex flex-col relative">
              <div className="flex gap-2 items-center border border-white rounded-lg px-3 py-2 bg-[#004F44]">
                <IoSearchSharp className="text-xl text-white flex-shrink-0" />
                <input
                  type="search"
                  placeholder={t('s.header.searchPlaceholder')}
                  className="text-lg border-none flex-1 appearance-none focus:outline-none text-white bg-transparent py-1"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={handleSearchFocus}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                <button
                  className="px-3 py-1 bg-white text-[#004F44] rounded hover:bg-gray-200 transition-colors font-medium text-sm flex-shrink-0"
                  onClick={handleSearch}
                  aria-label={t('s.header.searchButton')}
                >
                  {t('s.header.searchButton')}
                </button>
              </div>
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                >
                  {filteredSuggestions.map((flower) => (
                    <div
                      key={flower.id}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-100 text-black border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSuggestionClick(flower)}
                    >
                      {flower.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      }

      {/* Mobile Menu */}
      {
        showMobileMenu && (
          <div className="md:hidden bg-[#004F44] border-t border-white/20">
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/admin"
                className="flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <FaUserShield className="text-lg" />
                <span>{t('s.header.adminTitle')}</span>
              </Link>

              <a
                href="tel:+998911116692"
                className="flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <FaPhone className="text-lg" />
                <span>+998 91 111 66 92 Elyorjon</span>
              </a>

              <a
                href="tel:+998904979797"
                className="flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <FaPhone className="text-lg" />
                <span>+998 90 497 97 97 Nozimjon</span>
              </a>
              <div className="p-1">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )
      }
    </header >
  );
};

export default Header;

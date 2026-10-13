import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoFlowerOutline } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import { MdBorderColor } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import { AdminCategory } from "./AdminCategory";
import { AdminOrders } from "./AdminOrders";
import { API_URL, BASE_URL } from "../config";
import { useLanguage } from '../contexts/LanguageContext';

type Category = {
  id: string;
  name: string;
};

type Flower = {
  id: string;
  name: string;
  smell: string;
  flowerSize: string;
  height: string;
  imgUrl?: string;
  categoryId: string;
  price: string;
  stock: string;
};

export const AdminPanel = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"flowers" | "categories" | "orders" | "account">("flowers");
  const [formData, setFormData] = useState<Omit<Flower, "id"> & { imageFile: File | null }>({
    name: "",
    smell: "",
    flowerSize: "",
    height: "",
    imageFile: null,
    categoryId: "",
    price: "",
    stock: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [flowerIdToDelete, setFlowerIdToDelete] = useState<string | null>(null);

  // Profile state
  type AdminProfile = {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    password: string;
  };
  const [profile, setProfile] = useState<AdminProfile>({
    id: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<AdminProfile>({
    id: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
  });

  // Helper function to construct image URL
  const getImageUrl = (imgUrl: string) => {
    if (!imgUrl) return '';
    const imagePath = imgUrl.startsWith('images/') ? imgUrl : `images/${imgUrl}`;
    return `${BASE_URL}/${imagePath}`;
  };

  // Language-aware smell display text
  const getSmellDisplayText = (value: string) => {
    const map: Record<string, string> = {
      WEAK: t('a.smell.weak'),
      AVERAGE: t('a.smell.average'),
      STRONG: t('a.smell.strong'),
      VERY_STRONG: t('a.smell.veryStrong'),
      // Common fallbacks
      LOW: t('a.smell.weak'),
      MEDIUM: t('a.smell.average'),
      HIGH: t('a.smell.strong'),
    };
    return map[value] || value; // default to original if unknown
  };

  // Remove this entire fetchOrders function from AdminPanel.tsx - it doesn't belong there!
  // Instead, just update the makeAuthenticatedRequest function:

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    try {
      console.log(`Making request to: ${url}`, { options });

      // Add debugging
      console.log('Request headers:', options.headers);
      console.log('Admin token (sessionStorage):', sessionStorage.getItem('adminToken'));

      // Normalize headers using Headers API to ensure consistent mutation
      const hdrs = new Headers(options.headers as any);
      hdrs.set('Cache-Control', 'no-cache');
      hdrs.set('Pragma', 'no-cache');

      const token = sessionStorage.getItem('adminToken');
      if (token && !hdrs.has('Authorization')) {
        hdrs.set('Authorization', `Bearer ${token}`);
      }

      const enhancedOptions: RequestInit = {
        ...options,
        headers: Object.fromEntries(hdrs.entries()),
      };

      const response = await fetch(url, enhancedOptions);
      console.log(`Response status for ${url}:`, response.status);

      // Don't automatically redirect on auth failures for orders - let the calling component decide
      if (response.status === 401 || response.status === 403) {
        console.log("Authentication failed during request");

        // Only log out for critical endpoints, not orders
        if (
          url.includes('/flowers') ||
          url.includes('/categories') ||
          url.includes('/auth/') ||
          url.includes('/users/')
        ) {
          console.log("Critical auth failure, logging out");
          setIsAuthenticated(false);
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminLoginSuccess');
          navigate("/admin-login", { replace: true });
          throw new Error("Authentication failed");
        }

        // For orders, just return the response
        console.log("Non-critical auth failure, returning response");
        return response;
      }

      return response;
    } catch (error) {
      console.error(`Request failed for ${url}:`, error);
      throw error;
    }
  };

  // Authentication verification
  const verifyAuthentication = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        setIsAuthenticated(false);
        navigate("/admin-login", { replace: true });
        return;
      }

      const response = await fetch(`${API_URL}/auth/check`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated === true) {
          setIsAuthenticated(true);
          sessionStorage.removeItem("adminLoginSuccess");
        } else {
          setIsAuthenticated(false);
          navigate("/admin-login", { replace: true });
        }
      } else {
        setIsAuthenticated(false);
        navigate("/admin-login", { replace: true });
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      setIsAuthenticated(false);
      navigate("/admin-login", { replace: true });
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories...');
      const res = await makeAuthenticatedRequest(`${API_URL}/categories`);

      if (res.ok) {
        const data = await res.json();
        console.log('Categories response data:', data);
        let categoriesArray = [];
        if (Array.isArray(data)) {
          categoriesArray = data;
        } else if (data && data.categories && Array.isArray(data.categories)) {
          categoriesArray = data.categories;
        }
        console.log('Processed categories array:', categoriesArray);
        setCategories(categoriesArray);

        if (categoriesArray.length > 0 && !formData.categoryId) {
          setFormData((prevValue) => ({
            ...prevValue,
            categoryId: categoriesArray[0].id,
          }));
        }
      } else {
        const errorText = await res.text();
        console.error("Failed to fetch categories:", {
          status: res.status,
          statusText: res.statusText,
          error: errorText
        });
        setCategories([]);
        alert(`${t('a.panel.loadCategoriesError')}${res.status} ${res.statusText}`);
      }
    } catch (err) {
      if (err instanceof Error && err.message !== "Authentication failed") {
        console.error("Error fetching categories:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch flowers
  const fetchFlowers = async () => {
    try {
      console.log('Fetching flowers...');
      const res = await makeAuthenticatedRequest(`${API_URL}/flowers`);

      if (res.ok) {
        const data = await res.json();
        console.log('Flowers response data:', data);
        let flowersArray = [];
        if (Array.isArray(data)) {
          flowersArray = data;
        } else if (data && data.flowers && Array.isArray(data.flowers)) {
          flowersArray = data.flowers;
        }
        console.log('Processed flowers array:', flowersArray);
        setFlowers(flowersArray);
      } else {
        const errorText = await res.text();
        console.error("Failed to fetch flowers:", {
          status: res.status,
          statusText: res.statusText,
          error: errorText
        });
        setFlowers([]);
        alert(`${t('a.panel.loadFlowersError')}${res.status} ${res.statusText}`);
      }
    } catch (err) {
      if (err instanceof Error && err.message !== "Authentication failed") {
        console.error("Error fetching flowers:", err);
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminLoginSuccess');
      navigate("/", { replace: true });
    }
  };

  // Fetch current admin profile
  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await makeAuthenticatedRequest(`${API_URL}/auth/me`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          id: data.id,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone_number: data.phone_number || "",
          password: "",
        });
        setProfileFormData({
          id: data.id,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone_number: data.phone_number || "",
          password: "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle profile save
  const handleProfileSave = async () => {
    if (!profileFormData.first_name.trim() || !profileFormData.last_name.trim() || !profileFormData.phone_number.trim()) {
      alert(t('a.panel.profileFill'));
      return;
    }

    if (profileFormData.password && profileFormData.password.length < 6) {
      alert(t('a.panel.passwordShort'));
      return;
    }

    try {
      setProfileSaving(true);

      const body: Record<string, string> = {
        first_name: profileFormData.first_name.trim(),
        last_name: profileFormData.last_name.trim(),
        phone_number: profileFormData.phone_number.trim(),
      };

      if (profileFormData.password) {
        body.password = profileFormData.password;
      }

      const res = await makeAuthenticatedRequest(`${API_URL}/users/${profileFormData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile({
          id: updated.id || profileFormData.id,
          first_name: updated.first_name || profileFormData.first_name,
          last_name: updated.last_name || profileFormData.last_name,
          phone_number: updated.phone_number || profileFormData.phone_number,
          password: "",
        });
        setProfileFormData((prev) => ({
          ...prev,
          first_name: updated.first_name || prev.first_name,
          last_name: updated.last_name || prev.last_name,
          phone_number: updated.phone_number || prev.phone_number,
          password: "",
        }));
        setIsEditingProfile(false);
        alert(t('a.panel.profileSuccess'));
      } else {
        const errorText = await res.text();
        console.error("Failed to update profile:", res.status, errorText);
        alert(`${t('a.panel.profileError')}${res.status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "Authentication failed") {
        console.error("Error updating profile:", error);
        alert(t('a.panel.profileFail'));
      }
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle profile cancel
  const handleProfileCancel = () => {
    setProfileFormData({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone_number: profile.phone_number,
      password: "",
    });
    setIsEditingProfile(false);
  };

  // Handle profile edit click
  const handleProfileEdit = () => {
    setProfileFormData({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone_number: profile.phone_number,
      password: "",
    });
    setIsEditingProfile(true);
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'stock') {
      // Allow empty string, convert to number only when saving
      setFormData((prev) => ({ ...prev, stock: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, imageFile: file }));
  };

  // Handle save/create flower
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      alert(t('a.panel.fillRequired'));
      return;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert(t('a.panel.invalidPrice'));
      return;
    }

    // Convert stock to number, default to 0 if empty
    const stockValue = formData.stock === "" ? 0 : parseInt(formData.stock);
    if (isNaN(stockValue) || stockValue < 0) {
      alert(t('a.panel.invalidStock'));
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await handleUpdate();
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name.trim());
        formDataToSend.append("smell", formData.smell || "");
        formDataToSend.append("flowerSize", formData.flowerSize || "");
        formDataToSend.append("height", formData.height || "");
        formDataToSend.append("categoryId", formData.categoryId);
        formDataToSend.append("price", formData.price);
        formDataToSend.append("stock", String(stockValue));

        if (formData.imageFile) {
          formDataToSend.append("image", formData.imageFile);
        }

        console.log("FormData contents:");
        for (const [key, value] of formDataToSend.entries()) {
          console.log(key, value);
        }

        const res = await makeAuthenticatedRequest(`${API_URL}/flowers/create`, {
          method: "POST",
          body: formDataToSend,
        });

        if (res.ok) {
          console.log("Flower created successfully");
          await fetchFlowers();
          setFormData({
            name: "",
            smell: "",
            flowerSize: "",
            height: "",
            imageFile: null,
            categoryId: categories.length > 0 ? categories[0].id : "",
            price: "",
            stock: "",
          });
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
          alert(t('a.panel.addSuccess'));
        } else {
          const errorText = await res.text();
          console.error("Failed to add flower:", res.status, errorText);

          if (res.status === 401 || res.status === 403) {
            alert(t('a.panel.authIssue'));
            setIsAuthenticated(false);
            navigate("/admin-login", { replace: true });
            return;
          }

          try {
            const errorJson = JSON.parse(errorText);
            console.error("Parsed error:", errorJson);
            alert(`${t('a.panel.addError')}${errorJson.message || errorText}`);
          } catch {
            alert(`${t('a.panel.addError')}${res.status}. ${errorText}`);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "Authentication failed") {
        console.error("Error saving flower:", error);
        alert(t('a.panel.saveError'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle update flower
  const handleUpdate = async () => {
    if (!editingId) return;

    const stockValue = formData.stock === "" ? 0 : parseInt(formData.stock);
    if (isNaN(stockValue) || stockValue < 0) {
      alert(t('a.panel.invalidStock'));
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("categoryId", formData.categoryId);
    formDataToSend.append("smell", formData.smell);
    formDataToSend.append("height", formData.height);
    formDataToSend.append("flowerSize", formData.flowerSize);
    formDataToSend.append("stock", String(stockValue));
    if (formData.imageFile) {
      formDataToSend.append("image", formData.imageFile);
    }

    const res = await makeAuthenticatedRequest(`${API_URL}/flowers/${editingId}`, {
      method: "PUT",
      body: formDataToSend,
    });

    if (res.ok) {
      const updated = await res.json();
      const updatedFlower = updated?.flower ?? updated; // fallback if backend returns bare flower
      setFlowers(flowers.map((f) => (f.id === editingId ? updatedFlower : f)));
      setEditingId(null);
      setFormData({
        name: "",
        smell: "",
        flowerSize: "",
        height: "",
        imageFile: null,
        categoryId: categories.length > 0 ? categories[0].id : "",
        price: "",
        stock: "",
      });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
      alert(t('a.panel.updateSuccess'));
    } else {
      const errorText = await res.text();
      console.error("Failed to update flower:", res.status, errorText);
      alert(`${t('a.panel.updateError')}${res.status}. ${errorText}`);
    }
  };

  const formRef = useRef<HTMLDivElement>(null)

  // Handle edit click
  const handleEditClick = (flower: Flower) => {
    setFormData({
      name: flower.name,
      smell: flower.smell,
      flowerSize: flower.flowerSize,
      height: flower.height,
      imageFile: null,
      categoryId: flower.categoryId,
      price: flower.price,
      stock: flower.stock ?? 0,
    });
    setEditingId(flower.id);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      smell: "",
      flowerSize: "",
      height: "",
      imageFile: null,
      categoryId: categories.length > 0 ? categories[0].id : "",
      price: "",
      stock: "",
    });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setFlowerIdToDelete(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!flowerIdToDelete) return;

    try {
      const res = await makeAuthenticatedRequest(`${API_URL}/flowers/${flowerIdToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFlowers(flowers.filter((f) => f.id !== flowerIdToDelete));
        alert(t('a.panel.deleteSuccess'));
      } else {
        const errorText = await res.text();
        console.error("Failed to delete flower:", res.status, errorText);
        alert(`${t('a.panel.deleteError')}${res.status}. ${errorText}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "Authentication failed") {
        console.error("Error deleting flower:", error);
        alert(t('a.panel.deleteFail'));
      }
    } finally {
      setShowConfirmDialog(false);
      setFlowerIdToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setFlowerIdToDelete(null);
  };

  // Effects
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showConfirmDialog) {
        cancelDelete();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showConfirmDialog]);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking admin authentication...");

        await verifyAuthentication();

      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        navigate("/admin-login", { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  // Load data after authentication
  useEffect(() => {
    if (isAuthenticated === true) {
      fetchCategories();
      fetchFlowers();
      fetchProfile();
    }
  }, [isAuthenticated]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6fa]">
        <div className="text-center">
          <div className="animate-pulse text-xl text-gray-600">
            {t('a.panel.authChecking')}
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#f8f6fa] py-10 px-4 sm:px-6">
      <div className="flex rounded-xl shadow-lg bg-[#fff4f7] w-full max-w-[1400px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 min-w-[200px] bg-[#fdf6f9] rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#f0e5ef]">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold font-[Chillax] text-black">{t('a.panel.title')}</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              {t('a.panel.logout')}
            </button>
          </div>
          <nav className="flex flex-col gap-y-3 sm:gap-y-4">
            {[
              { name: t('a.panel.flowers'), icon: IoFlowerOutline, tab: "flowers" },
              { name: t('a.panel.categories'), icon: BiCategory, tab: "categories" },
              { name: t('a.panel.orders'), icon: MdBorderColor, tab: "orders" },
              { name: t('a.panel.profile'), icon: FiUser, tab: "account" },
            ].map((item) => (
              <button
                key={item.tab}
                className={`flex items-center gap-x-3 text-base sm:text-lg font-medium text-black hover:bg-[#ffe3f0] px-4 py-2.5 rounded transition ${activeTab === item.tab ? "bg-[#ffe3f0]" : ""
                  }`}
                onClick={() => setActiveTab(item.tab as any)}
              >
                <item.icon className="text-xl sm:text-2xl" /> {item.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col gap-y-6">
          {activeTab === "flowers" && (
            <>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 font-[Chillax] text-black">
                {t('a.panel.welcome')}
              </h2>

              {loading && (
                <div className="text-center py-4">
                  <div className="text-gray-600">{t('common.loading')}</div>
                </div>
              )}

              {/* Add/Edit Form */}
              <div
                ref={formRef}
                className={`bg-white p-5 sm:p-6 rounded-lg shadow border transition-colors duration-300 ${editingId ? 'border-blue-300 bg-blue-50' : 'border-[#f0e5ef]'
                  }`}
              >
                <h3 className="text-lg font-semibold mb-4 text-black">
                  {editingId ? t('a.panel.formEditTitle') : t('a.panel.formAddTitle')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      {t('a.panel.nameLabel')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('a.panel.namePlaceholder')}
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      {t('a.panel.smellLabel')}
                    </label>
                    <select
                      value={formData.smell}
                      onChange={(e) =>
                        setFormData({ ...formData, smell: e.target.value })
                      }
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                    >
                      <option value="">{t('a.panel.smellPlaceholder')}</option>
                      <option value="WEAK">{t('a.smell.weak')}</option>
                      <option value="AVERAGE">{t('a.smell.average')}</option>
                      <option value="STRONG">{t('a.smell.strong')}</option>
                      <option value="VERY_STRONG">{t('a.smell.veryStrong')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      {t('a.panel.sizeLabel')}
                    </label>
                    <input
                      type="text"
                      name="flowerSize"
                      value={formData.flowerSize}
                      onChange={handleChange}
                      placeholder={t('a.panel.sizePlaceholder')}
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      {t('a.panel.heightLabel')}
                    </label>
                    <input
                      type="text"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder={t('a.panel.heightPlaceholder')}
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      {t('a.panel.imageLabel')}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      {t('a.panel.categoryLabel')} ({categories.length} {t('a.panel.available')})
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                      required
                    >
                      <option value="">{t('a.panel.categoryPlaceholder')}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <div className="text-sm text-red-500 mt-1">
                        {t('a.panel.noCategories')}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      {t('a.panel.priceLabel')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="10.00"
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      {t('a.panel.stockLabel')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder={t('a.panel.stockPlaceholder')}
                      className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4]"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSave}
                    disabled={
                      loading ||
                      !formData.name.trim() ||
                      !formData.price ||
                      !formData.categoryId
                    }
                    className="bg-[#f2b5d4] hover:bg-[#e7a3c4] disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold py-2 px-6 rounded shadow transition text-center"
                  >
                    {loading
                      ? t('a.panel.saving')
                      : editingId
                        ? t('a.panel.updateFlower')
                        : t('a.panel.addFlower')}
                  </button>
                  {editingId && (
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-6 rounded shadow transition text-center"
                    >
                      {t('a.panel.cancel')}
                    </button>
                  )}
                </div>
              </div>

              {/* Flower List */}
              <div className="bg-white rounded-lg shadow border border-[#f0e5ef] overflow-hidden">
                <div className="hidden sm:flex bg-[#fdf6f9] border-b border-[#f0e5ef] font-semibold text-black px-6 py-3">
                  <div className="w-1/4">{t('a.panel.colFlower')}</div>
                  <div className="w-1/4">{t('a.panel.colSizeSmell')}</div>
                  <div className="w-1/4">{t('a.panel.colHeight')}</div>
                  <div className="w-1/4">{t('a.panel.colActions')}</div>
                </div>

                {/* Mobile View */}
                <div className="sm:hidden">
                  {flowers.length === 0 ? (
                    <div className="px-4 py-4 text-center text-gray-500">{t('a.panel.noFlowers')}</div>
                  ) : (
                    flowers.map((flower) => {
                      const imageUrl = flower.imgUrl ? getImageUrl(flower.imgUrl) : '';
                      return (
                        <div key={flower.id} className="border-b border-[#f0e5ef] p-4 hover:bg-[#fff7fa] transition">
                          <div className="flex items-center gap-x-3 mb-2">
                            {flower.imgUrl && (
                              <img
                                src={imageUrl}
                                alt={flower.name}
                                className="w-12 h-12 object-cover rounded-md"
                                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                              />
                            )}
                            <div>
                              <div className="font-medium text-black">{flower.name}</div>
                              <div className="text-sm text-gray-600">${flower.price}</div>
                            </div>
                          </div>
                          <div className="text-sm text-black mb-1">
                            <strong>{t('a.panel.sizeName')}</strong> {flower.flowerSize || "–"}
                          </div>
                          <div className="text-sm text-black mb-1">
                            <strong>{t('a.panel.smellName')}</strong> {getSmellDisplayText(flower.smell)}
                          </div>
                          <div className="text-sm text-black mb-2">
                            <strong>{t('a.panel.heightName')}</strong> {flower.height || "–"}
                          </div>
                          <div className="text-sm text-black mb-2">
                            <strong>{t('a.panel.stockName')}</strong> {typeof (flower as any).stock === 'number' ? flower.stock : 0}
                            {((flower as any).stock ?? 0) === 0 && (
                              <span className="ml-2 text-xs text-red-600">{t('a.panel.outOfStock')}</span>
                            )}
                          </div>
                          <div className="flex gap-x-2">
                            <button
                              onClick={() => handleEditClick(flower)}
                              className="text-xs sm:text-sm bg-[#fdf6f9] hover:bg-[#ffe3f0] text-black px-3 py-1 rounded transition"
                            >
                              {t('a.panel.edit')}
                            </button>
                            <button
                              onClick={() => handleDelete(flower.id)}
                              className="text-xs sm:text-sm bg-[#ffeef0] hover:bg-red-200 text-[#e57373] px-3 py-1 rounded transition"
                            >
                              {t('a.panel.delete')}
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block divide-y divide-[#f0e5ef]">
                  {flowers.length === 0 ? (
                    <div className="px-6 py-4 text-center text-gray-500">
                      {t('a.panel.noFlowers')}
                    </div>
                  ) : (
                    flowers.map((flower) => {
                      const imageUrl = flower.imgUrl ? getImageUrl(flower.imgUrl) : '';
                      return (
                        <div
                          key={flower.id}
                          className="flex items-center px-6 py-4 hover:bg-[#fff7fa] transition"
                        >
                          <div className="w-1/4 flex items-center gap-x-3 text-black">
                            {flower.imgUrl && (
                              <img
                                src={imageUrl}
                                alt={flower.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                              />
                            )}
                            <div>
                              <div className="font-medium">{flower.name}</div>
                              <div className="text-sm text-gray-600">${flower.price}</div>
                            </div>
                          </div>
                          <div className="w-1/4 text-black">
                            <div>{flower.flowerSize || "–"}</div>
                            <div className="text-sm text-gray-600">{getSmellDisplayText(flower.smell)}</div>
                          </div>
                          <div className="w-1/4 text-black">{flower.height || "–"}</div>
                          <div className="w-1/4 text-black">
                            <div>
                              {t('a.panel.stockName')} {typeof (flower as any).stock === 'number' ? flower.stock : 0}
                              {((flower as any).stock ?? 0) === 0 && (
                                <span className="ml-2 text-xs text-red-600">{t('a.panel.outOfStock')}</span>
                              )}
                            </div>
                          </div>
                          <div className="w-1/4 flex gap-x-2">
                            <button
                              onClick={() => handleEditClick(flower)}
                              className="text-sm bg-[#fdf6f9] hover:bg-[#ffe3f0] text-black px-3 py-1 rounded transition"
                            >
                              {t('a.panel.edit')}
                            </button>
                            <button
                              onClick={() => handleDelete(flower.id)}
                              className="text-sm bg-[#ffeef0] hover:bg-red-200 text-[#e57373] px-3 py-1 rounded transition"
                            >
                              {t('a.panel.delete')}
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "categories" && <AdminCategory makeAuthenticatedRequest={makeAuthenticatedRequest} />}
          {activeTab === "orders" && <AdminOrders makeAuthenticatedRequest={makeAuthenticatedRequest} />}

          {activeTab === "account" && (
            <>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 font-[Chillax] text-black">
                {t('a.panel.accountTitle')}
              </h2>

              <div className="bg-white p-5 sm:p-6 rounded-lg shadow border border-[#f0e5ef]">
                <h3 className="text-lg font-semibold mb-4 text-black">
                  {t('a.panel.profileData')}
                </h3>

                {profileLoading ? (
                  <div className="text-center py-4">
                    <div className="text-gray-600">{t('a.panel.profileLoading')}</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        {t('a.panel.firstName')}
                      </label>
                      <input
                        type="text"
                        value={isEditingProfile ? profileFormData.first_name : profile.first_name}
                        onChange={(e) =>
                          isEditingProfile &&
                          setProfileFormData((prev) => ({ ...prev, first_name: e.target.value }))
                        }
                        disabled={!isEditingProfile}
                        className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4] disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        {t('a.panel.lastName')}
                      </label>
                      <input
                        type="text"
                        value={isEditingProfile ? profileFormData.last_name : profile.last_name}
                        onChange={(e) =>
                          isEditingProfile &&
                          setProfileFormData((prev) => ({ ...prev, last_name: e.target.value }))
                        }
                        disabled={!isEditingProfile}
                        className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4] disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        {t('a.panel.phone')}
                      </label>
                      <input
                        type="text"
                        value={isEditingProfile ? profileFormData.phone_number : profile.phone_number}
                        onChange={(e) =>
                          isEditingProfile &&
                          setProfileFormData((prev) => ({ ...prev, phone_number: e.target.value }))
                        }
                        disabled={!isEditingProfile}
                        className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4] disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        {t('a.panel.newPassword')}
                      </label>
                      <input
                        type="password"
                        value={isEditingProfile ? profileFormData.password : "••••••••"}
                        onChange={(e) =>
                          isEditingProfile &&
                          setProfileFormData((prev) => ({ ...prev, password: e.target.value }))
                        }
                        disabled={!isEditingProfile}
                        placeholder={t('a.panel.passwordHint')}
                        className="w-full border border-[#e7d6e0] rounded py-2 px-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#f2b5d4] disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  {isEditingProfile ? (
                    <>
                      <button
                        onClick={handleProfileSave}
                        disabled={profileSaving}
                        className="bg-[#f2b5d4] hover:bg-[#e7a3c4] disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold py-2 px-6 rounded shadow transition text-center"
                      >
                        {profileSaving ? t('a.panel.saving') : t('a.panel.save')}
                      </button>
                      <button
                        onClick={handleProfileCancel}
                        disabled={profileSaving}
                        className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-6 rounded shadow transition text-center"
                      >
                        {t('a.panel.cancel')}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleProfileEdit}
                      className="bg-[#f2b5d4] hover:bg-[#e7a3c4] text-black font-semibold py-2 px-6 rounded shadow transition text-center"
                    >
                      {t('a.panel.edit')}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Confirm Dialog */}
          {showConfirmDialog && (
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={cancelDelete}
            >
              <div
                className="bg-white rounded-lg shadow-xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm transform transition-all duration-200 scale-100"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('a.panel.confirmTitle')}</h3>
                <p className="text-gray-600 mb-5 text-sm">
                  {t('a.panel.confirmText')}
                </p>
                <div className="flex justify-end gap-x-2">
                  <button
                    onClick={cancelDelete}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1.5 px-4 rounded transition text-sm"
                  >
                    {t('a.panel.confirmCancel')}
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-4 rounded transition text-sm"
                  >
                    {t('a.panel.confirmDelete')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
};

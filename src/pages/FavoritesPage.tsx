import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { API_URL, BASE_URL } from "../config";

interface Flower {
  id: string;
  name: string;
  price: string;
  imgUrl?: string;
  img_url?: string; // For backward compatibility
  categoryId: string;
  category_id?: string; // For backward compatibility
  isLiked: boolean;
  flowerSize?: string;
  flower_size?: string; // For backward compatibility
  height?: string;
  smell?: string;
  created_at?: string;
  updated_at?: string;
  category?: {
    id: string;
    name: string;
    created_at?: string;
    updated_at?: string;
  };
}

const FavoritesPage = () => {
  const [favoriteFlowers, setFavoriteFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Helper function to get the correct image URL
  const getImageUrl = (imgPath: string | undefined): string => {
    if (!imgPath) {
      console.log('No image path provided');
      return '';
    }
    
    // If it's already a full URL, return as is
    if (imgPath.startsWith('http')) {
      console.log('Using full URL:', imgPath);
      return imgPath;
    }
    
    // Remove any leading slashes
    let cleanPath = imgPath.replace(/^\/+/, '');
    
    // If the path already starts with 'images/', use it as is
    if (cleanPath.startsWith('images/')) {
      // Do nothing, it's already in the correct format
    }
    // If it's a path starting with 'public/images/', convert to 'images/'
    else if (cleanPath.startsWith('public/images/')) {
      cleanPath = cleanPath.replace('public/', '');
    }
    // If it's just a filename, prepend 'images/'
    else if (!cleanPath.includes('/')) {
      cleanPath = `images/${cleanPath}`;
    }
    
    // Construct the full URL using shared BASE_URL
    const fullUrl = `${BASE_URL}/${cleanPath}`;
    
    console.log('Generated image URL:', { 
      original: imgPath, 
      cleanPath,
      fullUrl 
    });
    
    return fullUrl;
  };

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      console.log('Fetching user favorites...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log('Using token:', token.substring(0, 10) + '...');
      
      // Get all flowers with like status from the backend
      const response = await fetch(`${API_URL}/flowers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error response JSON:', errorData);
        } catch (e) {
          const text = await response.text();
          console.error('Error response text:', text);
          errorData = { message: text };
        }
        
        if (response.status === 401) {
          // Token might be expired, redirect to login
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        throw new Error(errorData.message || `Failed to fetch flowers: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      // Extract the flowers array from the response object
      const flowers = responseData.flowers || [];
      console.log('All flowers with like status:', flowers);
      
      if (!Array.isArray(flowers)) {
        throw new Error('Expected flowers array in response but got: ' + JSON.stringify(responseData));
      }
      
      // Process and filter flowers
      const favoriteFlowers = flowers
        .filter((flower: any) => {
          const isLiked = flower.isLiked || (flower.liked_by && flower.liked_by.length > 0);
          console.log(`Flower ${flower.id} isLiked:`, isLiked, 'liked_by:', flower.liked_by);
          return isLiked;
        })
        .map((flower: any) => {
          const imgUrl = getImageUrl(flower.img_url || flower.imgUrl);
          console.log('Processing flower:', flower.id, 'imgUrl:', imgUrl);
          
          return {
            ...flower,
            imgUrl: imgUrl,
            img_url: undefined // Remove duplicate field
          };
        });
      
      console.log('Favorite flowers found:', favoriteFlowers.length);
      setFavoriteFlowers(favoriteFlowers);
      
    } catch (error) {
      console.error('Error in fetchFavorites:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      // If it's an auth error, redirect to login
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('token'))) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  // Log user state changes
  useEffect(() => {
    console.log('User state changed:', user ? 'Logged in' : 'Not logged in');
    if (user) {
      console.log('User ID:', user.id);
      fetchFavorites();
    } else {
      console.log('No user, redirecting to login');
      navigate('/login');
    }
  }, [user, fetchFavorites, navigate]);

  // Show loading state while checking authentication
  if (loading && favoriteFlowers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('s.favorites.title')}</h1>
        <div className="text-center py-12">{t('common.loading')}</div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return null; // The useEffect will handle the redirect
  }

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('s.favorites.title')}</h1>
      
      {loading ? (
        <div className="text-center py-12">{t('common.loading')}</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : favoriteFlowers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">{t('s.favorites.empty')}</p>
          <p className="text-sm text-gray-500 mb-4">
            {t('s.favorites.emptyHint')}
          </p>
          <Link to="/" className="text-pink-600 hover:underline">
            {t('s.favorites.browse')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteFlowers.map((flower) => {
            const imgUrl = flower.imgUrl || flower.img_url || '';
            const price = flower.price ? `${flower.price} ${t('s.card.currency')}` : t('s.favorites.noPrice');
            
            return (
              <div
                key={flower.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/flowers/${flower.id}`} className="block">
                  {imgUrl ? (
                    <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                      <div className="absolute top-0 left-0 bg-yellow-100 text-xs p-1 opacity-75 z-10">
                        {flower.id}
                      </div>
                      <img
                        src={getImageUrl(imgUrl)}
                        alt={flower.name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        onLoad={(e) => {
                          console.log(`Image loaded successfully: ${(e.target as HTMLImageElement).src}`);
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.error('Error loading image:', {
                            flowerId: flower.id,
                            originalUrl: imgUrl,
                            finalUrl: target.src,
                            error: e
                          });
                          target.style.display = 'none';
                          
                          // Show a placeholder with error details
                          const parent = target.parentElement;
                          if (parent) {
                            // Remove any existing placeholders
                            const existingPlaceholder = parent.querySelector('.image-error-placeholder');
                            if (existingPlaceholder) return;
                            
                            const placeholder = document.createElement('div');
                            placeholder.className = 'image-error-placeholder absolute inset-0 flex flex-col items-center justify-center bg-gray-200 p-2 text-center text-xs text-red-600';
                            placeholder.innerHTML = `
                              <div>${t('s.grid.noImage')}</div>
                              <div class="text-xxs text-gray-500 mt-1">ID: ${flower.id}</div>
                              <div class="text-xxs text-gray-500 truncate w-full px-1">${imgUrl}</div>
                            `;
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                      {t('s.grid.noImage')}
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {flower.name}
                    </h3>
                    <p className="text-pink-600 font-bold">{price}</p>
                    {flower.smell && (
                      <p className="text-sm text-gray-500 mt-1">
                        {t('s.card.smell')}: {flower.smell}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;

import { API_URL } from '../config';

export interface LikeResponse {
  success: boolean;
  message: string;
  isLiked: boolean;
  flowerId: string;
  userId: string;
}

const getAuthHeaders = (includeJsonContentType = false): HeadersInit => {
  const headers: Record<string, string> = {};

  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const toggleLike = async (flowerId: string, userId: string): Promise<LikeResponse> => {
  try {
    return await fetchJson<LikeResponse>(`${API_URL}/flowers/${flowerId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    // For now, we'll use the test endpoint
    try {
      return await fetchJson<LikeResponse>(
        `${API_URL}/flowers/test-like/${flowerId}/${userId}`,
        {
          headers: getAuthHeaders(),
        }
      );
    } catch (testError) {
      console.error('Test like endpoint also failed:', testError);
      throw testError;
    }
  }
};

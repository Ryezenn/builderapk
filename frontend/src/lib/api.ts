import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables cookies refresh token transfer
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into standard HTTP headers
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Seamlessly refresh expired access tokens on 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('[API Client] Access token expired. Attempting token rotation...');
        // Request token rotation from backend cookies channel
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { token } = refreshResponse.data;
        
        if (token) {
          localStorage.setItem('accessToken', token);
          console.log('[API Client] Token rotated successfully. Retrying request.');
          
          // Re-inject token and retry request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.warn('[API Client] Token rotation failed. Redirecting to login session.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          // In Next.js, standard redirect to login page
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Configuration
 * 
 * This file contains the configuration for the API client.
 * The configuration is based on environment variables set in .env files.
 * 
 * Environment Variables:
 * - VITE_USE_MOCK_API: 'true' to use Mock Service Worker, 'false' for real API
 * - VITE_API_BASE_URL: Base URL for the real API server
 */

export const apiConfig = {
  // Determine if we should use mock API or real API
  useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true',
  
  // Base URL for API calls
  baseURL: import.meta.env.VITE_USE_MOCK_API === 'true' 
    ? '/api' 
    : import.meta.env.VITE_API_BASE_URL || '/api',
  
  // Timeout for API requests (in milliseconds)
  timeout: 30000,
};

export default apiConfig;

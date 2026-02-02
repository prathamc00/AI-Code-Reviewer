import axios from 'axios';

// API base URL - update this to match your backend
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Submit a GitHub URL for code review
 * @param {string} url - GitHub repository or PR URL
 * @returns {Promise} Review report data
 */
export const reviewCode = async (url) => {
  try {
    const response = await api.post('/api/review', { url });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 
      'Failed to review code. Please check the URL and try again.'
    );
  }
};

/**
 * Health check
 * @returns {Promise} Health status
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend is not responding');
  }
};

export default api;

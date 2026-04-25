import axios from 'axios';
import { redirect } from 'react-router-dom';

const APIUrl = import.meta.env.VITE_API_URL;

export const customFetch = axios.create({
  baseURL: APIUrl,
  withCredentials: true,
});

customFetch.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      // For cross-site redirects in an interceptor, window.location is more reliable than react-router redirect
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

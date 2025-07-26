import axios from "axios";
import store from "../store";
import { logout } from "../store/features/auth/authSlice";

const instance = axios.create({
  baseURL: "/api",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const state = store.getState();
    
    // Gestion spécifique des erreurs 429 (Too Many Requests)
    if (error.response?.status === 429) {
      console.warn('Rate limit atteint, attente avant retry...');
      // Attendre 2 secondes avant de retry automatiquement
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(instance.request(error.config));
        }, 2000);
      });
    }
    
    if (error.response?.status === 401 && !state.auth.isGuest) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default instance;

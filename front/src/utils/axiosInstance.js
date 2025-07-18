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
    if (error.response.status === 401 && !state.auth.isGuest) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default instance;

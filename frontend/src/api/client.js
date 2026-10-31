import axios from "axios";

export const tokenStorageKey = "clinicflow_token";
export const unauthorizedEvent = "clinicflow:unauthorized";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenStorageKey);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.endsWith("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem(tokenStorageKey);
      window.dispatchEvent(new Event(unauthorizedEvent));
      if (window.location.pathname !== "/login")
        window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);

export default apiClient;

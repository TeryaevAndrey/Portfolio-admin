// shared/api/base.ts
import axios from "axios";

// Константы обычно выносят в env-переменные
// В Vite это import.meta.env, в Webpack — process.env
export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Базовый экземпляр axios с настройками
 */
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Можно добавить withCredentials: true, если используете куки
});

/**
 * Интерцептор для автоматического добавления токена к каждому запросу
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // Или получение из вашего Store (Zustand/Redux)

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Интерцептор для обработки ошибок (например, 401 Unauthorized)
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если получили 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Здесь обычно логика обновления токена (Refresh Token)
      // Если обновить не удалось — разлогиниваем пользователя
      console.error("Сессия истекла или пользователь не авторизован");

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.href = "/auth/sign-in";
    }

    return Promise.reject(error);
  },
);

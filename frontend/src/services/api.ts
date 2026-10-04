import axios from "axios";
import { useAuthStore } from "../store/AuthStore";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { setAccessToken } = useAuthStore.getState();

        const res = await axios.post(
          `${API_URL}/token/refresh/`,
          {},
          {
            withCredentials: true,
          },
        );

        setAccessToken(res.data.access);

        originalRequest.headers["Authorization"] =
          `Bearer ${res.data.access}`;

        return api(originalRequest);
      } catch (err) {
        console.log(err);
      }
    }

    return Promise.reject(error);
  },
);
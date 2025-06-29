import axios from "axios";

export const Axios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

Axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/auth/setAccessToken`,
          { withCredentials: true }
        );

        const newAccessToken = res.data.token;
        if (newAccessToken) {
          localStorage.setItem("token", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return Axios(originalRequest); // Retry the original request
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.clear();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      localStorage.clear();
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1500);
    }

    return Promise.reject(error);
  }
);

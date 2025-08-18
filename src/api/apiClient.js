import axios from "axios";
const API_BASE =
    import.meta.env.VITE_API_URL || "https://taskcloud.imcbs.com/api";

const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json"
    }
})

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.log("API Error:", error);
        return Promise.reject(error.response?.data || error.message);
    }
)

export default apiClient;
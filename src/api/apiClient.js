import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.baseURL,
    headers: {
        "Content-Type": "appi"
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
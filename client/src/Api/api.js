import axios from "axios";
import { API_URL } from "./config.js";

const api = axios.create({
    // baseURL: "https://want2be-backend-689107792668.asia-south1.run.app/api",
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // get token string
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // correct format
    }
    return config;
});

export default api;
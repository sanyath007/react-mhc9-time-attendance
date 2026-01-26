import axios from "axios";
import { verifyToken } from "../utils/token";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

api.interceptors.request.use(
    (config) => {
        const reqUrl = config.url;

        if (reqUrl.startsWith('/api/time-attendance/')) {
            /** Use API Key */
            const API_KEY = process.env.REACT_APP_API_KEY;

            config.headers.set('X-API-KEY', API_KEY);
        } else {
            /** Use Access Token */
            const token = localStorage.getItem("access_token");

            /** Check if access token is valid or not */
            if (verifyToken(token)) {
                console.log('Access token is invalid!');
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log('User unauthenticated, redirecting...');

            window.location.href = "/";
        }

        return Promise.reject(error);
    }
)

export default api;
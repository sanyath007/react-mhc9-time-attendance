import axios from "axios";
import { verifyToken } from "../utils/token";

console.log(import.meta.env.VITE_API_URL);

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use(
    (config) => {
        const reqUrl = config.url as string;

        if (reqUrl.startsWith('/api/time-attendance/')) {
            /** Use API Key */
            const API_KEY = import.meta.env.VITE_API_KEY;

            config.headers.set('X-API-KEY', API_KEY);
        } else {
            /** Use Access Token */
            const token = localStorage.getItem("access_token");

            /** Check if access token is valid or not */
            if (token && !verifyToken(token)) {
                console.log('Access token is invalid!');

                /** TODO: should use this code line as utils function */
                localStorage.removeItem('access_token');
                localStorage.removeItem('auth_user');
                window.location.href = "/";
            }

            /** If access token is valid append it as Authorization Bearer */
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

            /** TODO: should use this code line as utils function */
            localStorage.removeItem('access_token');
            localStorage.removeItem('auth_user');
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
)

export default api;
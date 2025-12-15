import { createContext, ReactNode, useEffect, useState } from "react";
import api from "../api";

interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: any) => Promise<{ success: boolean, message: string }>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('access_token');
            const storedUser = localStorage.getItem('auth_user');

            if (token && storedUser) {
                setUser(storedUser);
            } else {
                localStorage.removeItem('access_token');
                localStorage.removeItem('auth_user');
            }
        };

        initializeAuth();
    }, []);

    const login = async ({ email, password }): Promise<{ success: boolean, message: string }> => {
        try {
            setIsLoading(true);

            const res = await api.post(`/api/auth/login`, { email, password });

            localStorage.setItem('access_token', res.data.access_token);
            localStorage.setItem('auth_user', res.data.user);
            setUser(res.data.user);
            return { success: true, message: ''};
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_user');

        setUser(null);
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
import { createContext, ReactNode, useState } from "react";
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

    const login = async ({ username, password }): Promise<{ success: boolean, message: string }> => {
        try {
            const res = await api.post(`/api/auth/`, { username, password });
            console.log(res);

            return { success: true, message: ''};
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logout = async (): Promise<void> => {

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
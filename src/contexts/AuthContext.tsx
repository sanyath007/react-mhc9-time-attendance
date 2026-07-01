import { createContext, type ReactNode, useEffect, useState } from "react";
import api from "../api";
import { fetchOAuthToken } from "../lib/oauth";

interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    oauthToken: string | null;
    login: (credentials: any) => Promise<{ success: boolean, message: string }>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [oauthToken, setOAuthToken] = useState<string | null>(null);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const storedUser = localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user') || '') : null;
                const oauth = localStorage.getItem('oauth_token');

                if (token && storedUser) {
                    setUser(storedUser);
                    setOAuthToken(oauth);
                } else {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('auth_user');
                    localStorage.removeItem('oauth_token');
                }
            } catch (error) {
                console.error("Auth init error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async ({ email, password }: { email: string, password: string }): Promise<{ success: boolean, message: string }> => {
        try {
            setIsLoading(true);

            const res = await api.post(`/api/auth/login`, { email, password });

            localStorage.setItem('access_token', res.data.access_token);
            localStorage.setItem('auth_user', JSON.stringify(res.data.user));
            setUser(res.data.user);

            const oauth = await fetchOAuthToken()
            localStorage.setItem('oauth_token', oauth.access_token);
            setOAuthToken(oauth.access_token);

            return { success: true, message: '' };
        } catch (error) {
            return { success: false, message: error instanceof Error ? error.message : '' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('oauth_token');

        setUser(null);
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        oauthToken,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
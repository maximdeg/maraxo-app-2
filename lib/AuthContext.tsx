"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    full_name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
    checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = (userData: User, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        // Note: Token is now stored in HTTP-only cookie, not in client storage
    };

    const logout = async () => {
        try {
            // Call logout endpoint to clear server-side cookie
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            toast.success('Logged out successfully');
        }
    };

    const checkAuth = async (): Promise<boolean> => {
        try {
            // Check authentication using the verify endpoint
            // The token will be automatically sent via HTTP-only cookie
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies
                body: JSON.stringify({}), // Empty body since token is in cookie
            });

            if (response.ok) {
                const result = await response.json();
                setUser(result.user);
                setToken('authenticated'); // Placeholder since we don't store token client-side
                setIsLoading(false);
                return true;
            } else {
                // Token is invalid or expired
                setUser(null);
                setToken(null);
                setIsLoading(false);
                return false;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
            setToken(null);
            setIsLoading(false);
            return false;
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 
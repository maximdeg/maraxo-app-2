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
        sessionStorage.setItem('adminToken', authToken);
        sessionStorage.setItem('adminUser', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
        toast.success('Logged out successfully');
    };

    const checkAuth = async (): Promise<boolean> => {
        const storedToken = sessionStorage.getItem('adminToken');
        const storedUser = sessionStorage.getItem('adminUser');

        if (!storedToken || !storedUser) {
            setIsLoading(false);
            return false;
        }

        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: storedToken }),
            });

            if (response.ok) {
                const result = await response.json();
                setUser(result.user);
                setToken(storedToken);
                setIsLoading(false);
                return true;
            } else {
                // Token is invalid, clear storage
                sessionStorage.removeItem('adminToken');
                sessionStorage.removeItem('adminUser');
                setUser(null);
                setToken(null);
                setIsLoading(false);
                return false;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            sessionStorage.removeItem('adminToken');
            sessionStorage.removeItem('adminUser');
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
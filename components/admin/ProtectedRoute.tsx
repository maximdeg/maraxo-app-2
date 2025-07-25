"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import LoginDialog from './LoginDialog';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading, login, checkAuth } = useAuth();
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            if (!isLoading) {
                if (!user) {
                    // Check if there are saved credentials and try auto-login
                    const savedCredentials = localStorage.getItem('adminCredentials');
                    if (savedCredentials) {
                        try {
                            const { email, password, rememberMe } = JSON.parse(savedCredentials);
                            if (rememberMe) {
                                const response = await fetch('/api/auth/login', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ email, password }),
                                });

                                if (response.ok) {
                                    const result = await response.json();
                                    login(result.user, result.token);
                                    return;
                                }
                            }
                        } catch (error) {
                            console.error('Auto-login error:', error);
                        }
                    }
                    setShowLoginDialog(true);
                }
                setIsCheckingSession(false);
            }
        };

        checkSession();
    }, [isLoading, user, login]);

    const handleLoginSuccess = (userData: any, token: string) => {
        login(userData, token);
        setShowLoginDialog(false);
    };

    if (isLoading || isCheckingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
                        <p className="text-gray-600 mb-6">
                            Please log in to access the admin panel.
                        </p>
                        <button
                            onClick={() => setShowLoginDialog(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Login
                        </button>
                    </div>
                </div>
                <LoginDialog
                    isOpen={showLoginDialog}
                    onClose={() => setShowLoginDialog(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            </>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute; 
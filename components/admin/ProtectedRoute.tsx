"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import LoginDialog from './LoginDialog';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading, login, checkAuth } = useAuth();
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            if (!isLoading) {
                if (!user) {
                    // Check if user is already authenticated via cookie
                    const isAuthenticated = await checkAuth();
                    if (!isAuthenticated) {
                        setShowLoginDialog(true);
                    }
                }
                setIsCheckingSession(false);
            }
        };

        checkSession();
    }, [isLoading, user, checkAuth]);

    const handleLoginSuccess = async (userData: any, token: string) => {
        login(userData, token);
        setShowLoginDialog(false);
        setIsCheckingSession(false); // Stop checking session since we have a user
        
        // No need to redirect since we're already on the admin page
        // The component will re-render and show the admin content
    };

    // Check if user is already authenticated when component mounts
    useEffect(() => {
        if (user) {
            setIsCheckingSession(false);
        }
    }, [user]);

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
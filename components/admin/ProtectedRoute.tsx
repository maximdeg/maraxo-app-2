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

    useEffect(() => {
        const checkSession = async () => {
            // Wait for AuthContext to finish initial loading
            if (isLoading) {
                return;
            }

            // If user is already in context, we're done
            if (user) {
                setIsCheckingSession(false);
                setShowLoginDialog(false);
                return;
            }

            // User is not in context, check if they're authenticated via cookie
            // This will update the user state in AuthContext if authenticated
            const isAuthenticated = await checkAuth();
            
            setIsCheckingSession(false);
            
            // Only show login dialog if authentication check failed
            // If checkAuth succeeded, it will have set the user in context,
            // and this component will re-render with user set
            if (!isAuthenticated) {
                setShowLoginDialog(true);
            }
        };

        checkSession();
    }, [isLoading, checkAuth]);

    // Update checking state when user changes (e.g., after successful login)
    useEffect(() => {
        if (user) {
            setIsCheckingSession(false);
            setShowLoginDialog(false);
        }
    }, [user]);

    const handleLoginSuccess = async (userData: any, token: string) => {
        login(userData, token);
        setShowLoginDialog(false);
        setIsCheckingSession(false);
        
        // No need to redirect since we're already on the admin page
        // The component will re-render and show the admin content
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
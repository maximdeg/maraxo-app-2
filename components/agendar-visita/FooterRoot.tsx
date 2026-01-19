"use client";

import Link from "next/link";
import React, { useState } from "react";
import LoginDialog from "@/components/admin/LoginDialog";
import { useRouter } from "next/navigation";

const FooterRoot = () => {
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(false);
    const router = useRouter();

    const checkAuthentication = async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({}),
            });

            return response.ok;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    };

    const handleAdminClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsCheckingAuth(true);
        
        // Check if user is already authenticated
        const isAuthenticated = await checkAuthentication();
        setIsCheckingAuth(false);
        
        if (isAuthenticated) {
            // User is already authenticated, redirect to admin
            router.push('/admin');
        } else {
            // User is not authenticated, show login dialog
            setShowLoginDialog(true);
        }
    };

    const handleLoginSuccess = (userData: any, token: string) => {
        // Redirect to admin page after successful login
        router.push('/admin');
    };

    return (
        <>
            <footer className="py-5">
                <div className="text-center text-sm">
                    <span>
                        @ 2025 Copyright. <Link href="https://www.linkedin.com/in/maxim-degtiarev">Maxim Degtiarev</Link>
                    </span>
                    <br />
                    <button
                        onClick={handleAdminClick}
                        disabled={isCheckingAuth}
                        className=" hover:text-blue-800 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCheckingAuth ? 'Checking...' : 'Admin'}
                    </button>
                </div>
            </footer>

            <LoginDialog
                isOpen={showLoginDialog}
                onClose={() => setShowLoginDialog(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </>
    );
};

export default FooterRoot;

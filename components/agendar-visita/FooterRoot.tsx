"use client";

import Link from "next/link";
import React, { useState } from "react";
import LoginDialog from "@/components/admin/LoginDialog";

const FooterRoot = () => {
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const handleAdminClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowLoginDialog(true);
    };

    const handleLoginSuccess = (userData: any, token: string) => {
        // Redirect to admin page after successful login
        window.location.href = '/admin';
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
                        className=" hover:text-blue-800 mt-4"
                    >
                        Admin
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

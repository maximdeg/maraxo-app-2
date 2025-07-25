"use client";

import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminHeader = () => {
    const { user, logout } = useAuth();

    return (
        <header className="h-[80px] lg:h-[70px] w-full bg-[#FFF2EF] shadow-2xl mb-5">
            <div className="flex justify-between items-center h-full px-6">
                <h1 className="text-3xl lg:text-4xl font-semibold text-black">Dra. Mara Flamini</h1>
                
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{user?.full_name}</span>
                    </div>
                    <Button
                        onClick={logout}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;

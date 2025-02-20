import React from "react";
import AdminHeader from "@/components/AdminHeader";
import AdminFooter from "@/components/AdminFooter";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="grid grid-rows-[10%_auto_10%] h-screen max-w-[500px] place-self-center w-[500px]">
            <AdminHeader />
            {children}
            <AdminFooter />
        </div>
    );
};

export default Layout;

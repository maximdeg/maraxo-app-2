import React from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminFooter from "@/components/admin/AdminFooter";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="grid grid-rows-[10%_auto_10%] place-self-center h-screen min-w-full md:min-w-[500px] ">
            <AdminHeader />
            {children}
            {/* <AdminFooter /> */}
        </div>
    );
};

export default Layout;

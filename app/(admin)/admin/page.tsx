"use client";

import React from "react";
import AccordionComponent from "@/components/admin/AccordionComponent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const page = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="p-5">
                <AccordionComponent />
            </div>
        </QueryClientProvider>
    );
};

export default page;

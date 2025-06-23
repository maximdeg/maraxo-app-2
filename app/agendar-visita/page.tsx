"use client";

import AppointmentForm from "@/components/agendar-visita/AppointmentForm";
import FooterRoot from "@/components/agendar-visita/FooterRoot";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Home() {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutes
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <section className="flex flex-col py-5 px-10 mx-10 items-center">
                <div className="text-center mb-5">
                    <h1 className="text-4xl lg:text-6xl text-[#a97f7] ">Dr. Mara Flamini</h1>
                    <h2 className="lg:text-3xl text-md">Consultorio dermatologico</h2>
                </div>
                <AppointmentForm />
                <FooterRoot />
            </section>
        </QueryClientProvider>
    );
}

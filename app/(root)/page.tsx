"use client";

import AppointmentForm from "@/components/root/AppointmentForm";
import FooterRoot from "@/components/root/FooterRoot";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();
export default function Home() {
    return (
        <QueryClientProvider client={queryClient}>
            <section className="flex flex-col py-5 px-10 mx-10 items-center">
                <div className="text-center mb-5">
                    <h1 className="text-4xl lg:text-6xl text-[#a97f7] ">DR. JOHN DOE</h1>
                    <h2 className="lg:text-3xl text-md">Consultorio dermatologico</h2>
                </div>
                <AppointmentForm />
                <FooterRoot />
            </section>
        </QueryClientProvider>
    );
}

"use client";

import AppointmentForm from "@/components/agendar-visita/AppointmentForm";
import FooterRoot from "@/components/agendar-visita/FooterRoot";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Home as HomeIcon, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutes
                retry: 1,
            },
        },
    }));

    const router = useRouter();

    const handleGoHome = () => {
        router.push("/");
    };

    return (
        <QueryClientProvider client={queryClient}>
            <section className="flex flex-col py-5 px-10 mx-10 items-center">
                <header className="w-full mb-5 ">
                    <button
                        onClick={handleGoHome}
                        className="absolute top-10 left-5 md:static md:left-10 flex items-center gap-2 md:px-4 md:py-2 bg-[#a97f7] text-white rounded-lg hover:bg-[#8a6f6] transition-colors duration-200 text-sm sm:text-base"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Inicio</span>
                        <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <div className="text-center flex-1">
                        <h1 className="text-4xl lg:text-6xl text-[#a97f7]">Dra. Mara Flamini</h1>
                        <h2 className="lg:text-3xl text-md">Consultorio dermatologico</h2>
                    </div>
                    <div className="w-[100px] sm:w-[120px]"></div> {/* Spacer to balance the layout */}
                </header>
                {/* <div className="flex flex-col justify-start">
                    <h6 className="text-md font-bold">Informacion importante</h6>
                    <p className="text-xs">
                        <span className="font-bold">Lunes a Viernes:</span> 08:00 - 18:00
                        <br />
                        <span className="font-bold">Sabado:</span> 08:00 - 12:00
                    </p>
                </div> */}
                <AppointmentForm />
                <FooterRoot />
            </section>
        </QueryClientProvider>
    );
}

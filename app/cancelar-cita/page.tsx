"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Check, ArrowLeft, Home as HomeIcon, Calendar, MapPin, Phone, AlertTriangle, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import FooterRoot from "@/components/agendar-visita/FooterRoot";

interface AppointmentData {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    visit_type_name: string | null;
    consult_type_name: string | null;
    practice_type_name: string | null;
    health_insurance: string | null;
}

const CancellationPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [appointment, setAppointment] = useState<AppointmentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [cancelled, setCancelled] = useState(false);

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setError("Token de cancelación no encontrado");
            setLoading(false);
            return;
        }

        fetchAppointmentData();
    }, [token]);

    const fetchAppointmentData = async () => {
        try {
            const response = await fetch(`/api/cancel-appointment/verify?token=${encodeURIComponent(token!)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al verificar la cita");
            }

            setAppointment(data.appointment);
        } catch (error: any) {
            if (error.message.includes("Cancellation is no longer allowed")) {
                setError("La cancelación ya no está permitida. Por favor, contacte directamente a la clínica para cancelar su cita.");
            } else {
                setError(error.message || "Error al cargar los datos de la cita");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async () => {
        if (!token) return;

        setCancelling(true);
        try {
            const response = await fetch("/api/cancel-appointment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al cancelar la cita");
            }

            setCancelled(true);
        } catch (error: any) {
            if (error.message.includes("Cancellation is no longer allowed")) {
                setError("La cancelación ya no está permitida. Por favor, contacte directamente a la clínica para cancelar su cita.");
            } else {
                setError(error.message || "Error al cancelar la cita");
            }
        } finally {
            setCancelling(false);
        }
    };

    const handleGoHome = () => {
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#fff3f0] to-[#e8d4cd] flex flex-col">
                <header className="w-full mb-2 p-2">
                    <button
                        onClick={handleGoHome}
                        className="absolute top-10 left-5 md:static md:left-10 flex items-center gap-2 md:px-4 md:py-2 bg-[#a97f7] text-white rounded-lg hover:bg-[#8a6f6] transition-colors duration-200 text-sm sm:text-base"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Inicio</span>
                        <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </header>
                
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center bg-white/80 backdrop-blur-md rounded-lg p-8 shadow-lg max-w-md">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9e7162] mx-auto mb-4"></div>
                        <h1 className="text-xl font-semibold text-[#9e7162]">Cargando información...</h1>
                    </div>
                </div>
                
                <FooterRoot />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#fff3f0] to-[#e8d4cd] flex flex-col">
                <header className="w-full mb-2 p-2">
                    <button
                        onClick={handleGoHome}
                        className="absolute top-10 left-5 md:static md:left-10 flex items-center gap-2 md:px-4 md:py-2 bg-[#a97f7] text-white rounded-lg hover:bg-[#8a6f6] transition-colors duration-200 text-sm sm:text-base"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Inicio</span>
                        <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </header>
                
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center bg-white/80 backdrop-blur-md rounded-lg p-8 shadow-lg max-w-md">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#9e7162] mb-4">Error</h1>
                        <p className="text-[#ba8c84] mb-6">{error}</p>
                        <Link href="/agendar-visita">
                            <Button 
                                className="bg-gradient-to-r from-[#ba8c84] to-[#9e7162] hover:from-[#9e7162] hover:to-[#ba8c84] text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                            >
                                Agendar Nueva Cita
                            </Button>
                        </Link>
                    </div>
                </div>
                
                <FooterRoot />
            </div>
        );
    }

    if (cancelled) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#fff3f0] to-[#e8d4cd] flex flex-col">
                <header className="w-full mb-2 p-2">
                    <button
                        onClick={handleGoHome}
                        className="absolute top-10 left-5 md:static md:left-10 flex items-center gap-2 md:px-4 md:py-2 bg-[#a97f7] text-white rounded-lg hover:bg-[#8a6f6] transition-colors duration-200 text-sm sm:text-base"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Inicio</span>
                        <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </header>
                
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center bg-white/80 backdrop-blur-md rounded-lg p-8 shadow-lg max-w-md">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#9e7162] mb-4">¡Cita Cancelada!</h1>
                        <p className="text-[#ba8c84] mb-6">Su cita ha sido cancelada exitosamente.</p>
                        <Link href="/agendar-visita">
                            <Button 
                                className="bg-gradient-to-r from-[#ba8c84] to-[#9e7162] hover:from-[#9e7162] hover:to-[#ba8c84] text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                            >
                                Agendar Nueva Cita
                            </Button>
                        </Link>
                    </div>
                </div>
                
                <FooterRoot />
            </div>
        );
    }

    if (!appointment) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fff3f0] to-[#e8d4cd] flex flex-col">
            {/* Header */}
            <header className="w-full mb-2 p-2">
                <button
                    onClick={handleGoHome}
                    className="absolute top-10 left-5 md:static md:left-10 flex items-center gap-2 md:px-4 md:py-2 bg-[#a97f7] text-white rounded-lg hover:bg-[#8a6f6] transition-colors duration-200 text-sm sm:text-base"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Inicio</span>
                    <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="text-center flex-1 text-[#9e7162]">
                    <h1 className="text-2xl lg:text-4xl font-bold">Dra. Mara Flamini</h1>
                    <h2 className="lg:text-xl text-md">Consultorio dermatológico</h2>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-4xl w-full bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6">
                    {/* Warning Header */}
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shadow-lg">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-[#9e7162] mb-1">
                            Cancelar Cita
                        </h1>
                        <p className="text-[#ba8c84] text-base">
                            Revise los detalles de su cita antes de confirmar la cancelación.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {/* Appointment Details */}
                        <div className="bg-white/60 rounded-lg p-4 shadow-md">
                            <h2 className="text-lg font-semibold text-[#9e7162] mb-3 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Detalles de la Cita
                            </h2>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-start border-b border-[#ba8c84]/20 pb-1">
                                    <span className="font-medium text-[#ba8c84]">Paciente:</span>
                                    <span className="text-[#9e7162] font-semibold text-right">
                                        {appointment.last_name}, {appointment.first_name}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-start border-b border-[#ba8c84]/20 pb-1">
                                    <span className="font-medium text-[#ba8c84]">Teléfono:</span>
                                    <span className="text-[#9e7162] font-semibold text-right">{appointment.phone_number}</span>
                                </div>
                                
                                <div className="flex justify-between items-start border-b border-[#ba8c84]/20 pb-1">
                                    <span className="font-medium text-[#ba8c84]">Tipo de visita:</span>
                                    <span className="text-[#9e7162] font-semibold text-right">{appointment.visit_type_name}</span>
                                </div>

                                {appointment.visit_type_name === "Practica" && appointment.practice_type_name && (
                                    <div className="flex justify-between items-start border-b border-[#ba8c84]/20 pb-1">
                                        <span className="font-medium text-[#ba8c84]">Tipo de practica:</span>
                                        <span className="text-[#9e7162] font-semibold text-right">{appointment.practice_type_name}</span>
                                    </div>
                                )}

                                {appointment.visit_type_name === "Consulta" && appointment.consult_type_name && (
                                    <div className="flex justify-between items-start border-b border-[#ba8c84]/20 pb-1">
                                        <span className="font-medium text-[#ba8c84]">Tipo de consulta:</span>
                                        <span className="text-[#9e7162] font-semibold text-right">{appointment.consult_type_name}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-start border-b border-[#ba8c84]/20 pb-1">
                                    <span className="font-medium text-[#ba8c84]">Fecha:</span>
                                    <span className="text-[#9e7162] font-semibold text-right">
                                        {format(new Date(appointment.appointment_date), "dd/MM/yyyy", { locale: es })}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-start border-b border-[#ba8c84]/20 pb-1">
                                    <span className="font-medium text-[#ba8c84]">Horario:</span>
                                    <span className="text-[#9e7162] font-semibold text-right">{appointment.appointment_time}</span>
                                </div>
                            </div>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                            <h3 className="font-semibold text-red-800 text-sm mb-2 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Importante
                            </h3>
                            <p className="text-red-700 text-sm">
                                Esta acción no se puede deshacer. Una vez cancelada, deberá agendar una nueva cita.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {!showConfirmation ? (
                                <>
                                    <Button 
                                        onClick={() => setShowConfirmation(true)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancelar Cita
                                    </Button>
                                    
                                    <Link href="/agendar-visita" className="flex-1">
                                        <Button 
                                            variant="outline"
                                            className="w-full border-[#ba8c84] text-[#9e7162] hover:bg-[#ba8c84] hover:text-white px-6 py-3 rounded-full transition-all duration-300 font-semibold"
                                        >
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Agendar Nueva Cita
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-3 w-full">
                                    <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-yellow-800 text-sm mb-2">¿Está seguro?</h3>
                                        <p className="text-yellow-700 text-sm mb-3">
                                            Esta acción cancelará permanentemente su cita.
                                        </p>
                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={handleCancelAppointment}
                                                disabled={cancelling}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold"
                                            >
                                                {cancelling ? "Cancelando..." : "Sí, Cancelar"}
                                            </Button>
                                            <Button 
                                                onClick={() => setShowConfirmation(false)}
                                                variant="outline"
                                                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-full text-sm font-semibold"
                                            >
                                                No, Volver
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <FooterRoot />
        </div>
    );
};

export default CancellationPage; 
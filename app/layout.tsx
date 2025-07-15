import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const poppinsFont = Poppins({
    subsets: ["latin"],
    weight: ["100", "300"],
});

export const metadata: Metadata = {
    title: "Dra. Mara Flamini",
    description: "Aplicacion para agendar citas con Dra. Mara Flamini",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={poppinsFont.className}>
                {children}
                <Toaster position="bottom-center" richColors />
            </body>
        </html>
    );
}

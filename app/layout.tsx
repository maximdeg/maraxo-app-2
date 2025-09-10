import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import PWAStatus from "@/components/pwa/PWAStatus";

const poppinsFont = Poppins({
    subsets: ["latin"],
    weight: ["100", "300"],
});

export const metadata: Metadata = {
    title: "Dra. Mara Flamini - Dermatología",
    description: "Aplicación profesional para agendar citas con Dra. Mara Flamini - Especialista en Dermatología. Agenda tu cita médica de forma fácil y segura.",
    keywords: ["dermatología", "citas médicas", "Dra. Mara Flamini", "piel", "salud", "medicina"],
    authors: [{ name: "Dra. Mara Flamini" }],
    creator: "Dra. Mara Flamini",
    publisher: "Dra. Mara Flamini",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://dra-mara-flamini.com'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: "Dra. Mara Flamini - Dermatología",
        description: "Aplicación profesional para agendar citas con Dra. Mara Flamini - Especialista en Dermatología",
        url: '/',
        siteName: 'Dra. Mara Flamini',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Dra. Mara Flamini - Dermatología',
            },
        ],
        locale: 'es_AR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Dra. Mara Flamini - Dermatología",
        description: "Aplicación profesional para agendar citas con Dra. Mara Flamini - Especialista en Dermatología",
        images: ['/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    category: 'medical',
    classification: 'Medical Application',
    referrer: 'origin-when-cross-origin',
    icons: {
        icon: [
            { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
            { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
        apple: [
            { url: '/icons/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
        ],
        other: [
            {
                rel: 'mask-icon',
                url: '/icons/safari-pinned-tab.svg',
                color: '#9e7162',
            },
        ],
    },
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Dra. Mara Flamini',
        startupImage: [
            {
                url: '/icons/apple-splash-2048-2732.jpg',
                media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
            },
            {
                url: '/icons/apple-splash-1668-2388.jpg',
                media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
            },
            {
                url: '/icons/apple-splash-1536-2048.jpg',
                media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
            },
            {
                url: '/icons/apple-splash-1125-2436.jpg',
                media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
            },
            {
                url: '/icons/apple-splash-1242-2688.jpg',
                media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
            },
            {
                url: '/icons/apple-splash-750-1334.jpg',
                media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
            },
            {
                url: '/icons/apple-splash-640-1136.jpg',
                media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
            },
        ],
    },
    other: {
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'apple-mobile-web-app-title': 'Dra. Mara Flamini',
        'application-name': 'Dra. Mara Flamini',
        'msapplication-TileColor': '#9e7162',
        'msapplication-config': '/browserconfig.xml',
        'msapplication-tap-highlight': 'no',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#9e7162' },
        { media: '(prefers-color-scheme: dark)', color: '#9e7162' },
    ],
    colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#9e7162" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Dra. Mara Flamini" />
                <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
                <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/icon-32x32.svg" />
                <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/icon-16x16.svg" />
                <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#9e7162" />
                <meta name="msapplication-TileColor" content="#9e7162" />
                <meta name="msapplication-config" content="/browserconfig.xml" />
            </head>
            <body className={poppinsFont.className}>
                {children}
                <Toaster position="bottom-center" richColors />
                <PWAInstallPrompt />
                <PWAStatus />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js')
                                        .then(function(registration) {
                                            console.log('Service Worker registered successfully:', registration.scope);
                                            
                                            // Check for updates
                                            registration.addEventListener('updatefound', () => {
                                                const newWorker = registration.installing;
                                                if (newWorker) {
                                                    newWorker.addEventListener('statechange', () => {
                                                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                                            // New content is available, show update notification
                                                            if (confirm('Nueva versión disponible. ¿Deseas actualizar?')) {
                                                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                                                window.location.reload();
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        })
                                        .catch(function(error) {
                                            console.log('Service Worker registration failed:', error);
                                        });
                                });
                                
                                // Handle service worker updates
                                navigator.serviceWorker.addEventListener('controllerchange', () => {
                                    window.location.reload();
                                });
                            }
                            
                            // PWA Install prompt
                            let deferredPrompt;
                            window.addEventListener('beforeinstallprompt', (e) => {
                                e.preventDefault();
                                deferredPrompt = e;
                                
                                // Show install button or banner
                                const installBanner = document.createElement('div');
                                installBanner.innerHTML = \`
                                    <div style="position: fixed; bottom: 20px; left: 20px; right: 20px; background: #9e7162; color: white; padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; display: flex; align-items: center; justify-content: space-between;">
                                        <div>
                                            <strong>Instalar App</strong>
                                            <div style="font-size: 14px; opacity: 0.9;">Instala la app para acceso rápido</div>
                                        </div>
                                        <div>
                                            <button id="install-btn" style="background: white; color: #9e7162; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin-right: 8px; cursor: pointer;">Instalar</button>
                                            <button id="dismiss-btn" style="background: transparent; color: white; border: 1px solid white; padding: 8px 16px; border-radius: 6px; cursor: pointer;">×</button>
                                        </div>
                                    </div>
                                \`;
                                document.body.appendChild(installBanner);
                                
                                document.getElementById('install-btn').addEventListener('click', () => {
                                    deferredPrompt.prompt();
                                    deferredPrompt.userChoice.then((choiceResult) => {
                                        if (choiceResult.outcome === 'accepted') {
                                            console.log('User accepted the install prompt');
                                        }
                                        deferredPrompt = null;
                                        installBanner.remove();
                                    });
                                });
                                
                                document.getElementById('dismiss-btn').addEventListener('click', () => {
                                    installBanner.remove();
                                });
                            });
                            
                            // Track PWA install
                            window.addEventListener('appinstalled', (evt) => {
                                console.log('PWA was installed');
                                // Analytics tracking could go here
                            });
                        `,
                    }}
                />
            </body>
        </html>
    );
}

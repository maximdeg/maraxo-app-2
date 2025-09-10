"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Wifi, WifiOff, Download } from 'lucide-react';
import { pushNotificationService } from '@/lib/push-notifications';

export default function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Check PWA status
    const checkPWAStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsPWA(isStandalone || isIOSStandalone);
    };

    checkPWAStatus();

    // Check notification permission
    const checkNotificationPermission = async () => {
      if ('Notification' in window) {
        setNotificationsEnabled(Notification.permission === 'granted');
      }
    };

    checkNotificationPermission();

    // Check if PWA can be installed
    const checkInstallability = () => {
      setCanInstall(!isPWA && 'serviceWorker' in navigator);
    };

    checkInstallability();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [isPWA]);

  const handleNotificationToggle = async () => {
    if (notificationsEnabled) {
      // Disable notifications
      await pushNotificationService.unsubscribe();
      setNotificationsEnabled(false);
    } else {
      // Enable notifications
      const permission = await pushNotificationService.requestPermission();
      if (permission === 'granted') {
        await pushNotificationService.subscribe();
        setNotificationsEnabled(true);
      }
    }
  };

  const handleInstallPWA = () => {
    // Trigger PWA install prompt
    window.dispatchEvent(new Event('beforeinstallprompt'));
  };

  if (!isPWA && !canInstall) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2">
      {/* Online Status */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
        isOnline 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isOnline ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span>{isOnline ? 'En línea' : 'Sin conexión'}</span>
      </div>

      {/* PWA Status */}
      {isPWA && (
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800">
          <Download className="w-4 h-4" />
          <span>App instalada</span>
        </div>
      )}

      {/* Install PWA Button */}
      {canInstall && (
        <Button
          onClick={handleInstallPWA}
          size="sm"
          className="bg-gradient-to-r from-[#ba8c84] to-[#9e7162] hover:from-[#9e7162] hover:to-[#ba8c84] text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Instalar App
        </Button>
      )}

      {/* Notification Toggle */}
      <Button
        onClick={handleNotificationToggle}
        variant="outline"
        size="sm"
        className={`${
          notificationsEnabled 
            ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100' 
            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
        }`}
      >
        {notificationsEnabled ? (
          <Bell className="w-4 h-4 mr-2" />
        ) : (
          <BellOff className="w-4 h-4 mr-2" />
        )}
        {notificationsEnabled ? 'Notificaciones ON' : 'Notificaciones OFF'}
      </Button>
    </div>
  );
}

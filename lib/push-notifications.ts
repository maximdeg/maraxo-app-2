// Push Notification Service for Dra. Mara Flamini PWA
// Professional implementation with appointment reminders

interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

class PushNotificationService {
  private vapidPublicKey: string;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  }

  // Initialize push notifications
  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging is not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service worker not ready');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Check if user is subscribed
  async isSubscribed(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  // Send appointment reminder notification
  async sendAppointmentReminder(appointmentData: {
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentId: string;
  }): Promise<void> {
    const notificationData: PushNotificationData = {
      title: 'Recordatorio de Cita - Dra. Mara Flamini',
      body: `Hola ${appointmentData.patientName}, tienes una cita el ${appointmentData.appointmentDate} a las ${appointmentData.appointmentTime}`,
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      data: {
        appointmentId: appointmentData.appointmentId,
        type: 'appointment_reminder',
        url: '/agendar-visita'
      },
      actions: [
        {
          action: 'view',
          title: 'Ver Cita',
          icon: '/icons/icon-96x96.svg'
        },
        {
          action: 'cancel',
          title: 'Cancelar',
          icon: '/icons/icon-96x96.svg'
        }
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200]
    };

    await this.sendNotification(notificationData);
  }

  // Send appointment confirmation notification
  async sendAppointmentConfirmation(appointmentData: {
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentId: string;
  }): Promise<void> {
    const notificationData: PushNotificationData = {
      title: 'Cita Confirmada - Dra. Mara Flamini',
      body: `Tu cita ha sido confirmada para el ${appointmentData.appointmentDate} a las ${appointmentData.appointmentTime}`,
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      data: {
        appointmentId: appointmentData.appointmentId,
        type: 'appointment_confirmation',
        url: '/confirmation'
      },
      actions: [
        {
          action: 'view',
          title: 'Ver Detalles',
          icon: '/icons/icon-96x96.svg'
        }
      ],
      requireInteraction: false,
      vibrate: [100, 50, 100]
    };

    await this.sendNotification(notificationData);
  }

  // Send appointment cancellation notification
  async sendAppointmentCancellation(appointmentData: {
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
  }): Promise<void> {
    const notificationData: PushNotificationData = {
      title: 'Cita Cancelada - Dra. Mara Flamini',
      body: `Tu cita del ${appointmentData.appointmentDate} a las ${appointmentData.appointmentTime} ha sido cancelada`,
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      data: {
        type: 'appointment_cancellation',
        url: '/agendar-visita'
      },
      actions: [
        {
          action: 'reschedule',
          title: 'Reagendar',
          icon: '/icons/icon-96x96.svg'
        }
      ],
      requireInteraction: false,
      vibrate: [100, 50, 100]
    };

    await this.sendNotification(notificationData);
  }

  // Generic notification sender
  private async sendNotification(data: PushNotificationData): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not ready');
    }

    await this.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.svg',
      badge: data.badge || '/icons/icon-72x72.svg',
      data: data.data,
      actions: data.actions,
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [100, 50, 100],
      tag: data.data?.type || 'default',
      renotify: true
    });
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  }

  // Convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Export types
export type { PushNotificationData };

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import webpush from 'web-push';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

// Configure web-push (only if VAPID keys are available)
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contacto@dra-mara-flamini.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    // Check if VAPID keys are configured
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Push notifications not configured. VAPID keys missing.' },
        { status: 503 }
      );
    }

    const { 
      title, 
      body, 
      appointmentId, 
      patientId, 
      type = 'general',
      data = {} 
    } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Get all active subscriptions
    const subscriptions = await query(
      'SELECT endpoint, p256dh_key, auth_key FROM push_subscriptions WHERE active = true'
    );

    if (subscriptions.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscriptions found',
        sent: 0
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      data: {
        appointmentId,
        patientId,
        type,
        url: type === 'appointment_reminder' ? '/agendar-visita' : '/',
        ...data
      },
      actions: [
        {
          action: 'view',
          title: 'Ver',
          icon: '/icons/icon-96x96.svg'
        }
      ],
      requireInteraction: type === 'appointment_reminder',
      vibrate: [200, 100, 200]
    });

    const promises = subscriptions.rows.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        };

        await webpush.sendNotification(pushSubscription, payload);
        return { success: true, endpoint: subscription.endpoint };
      } catch (error: any) {
        console.error('Error sending notification:', error);
        
        // If subscription is invalid, mark as inactive
        if (error?.statusCode === 410) {
          await query(
            'UPDATE push_subscriptions SET active = false WHERE endpoint = $1',
            [subscription.endpoint]
          );
        }
        
        return { success: false, endpoint: subscription.endpoint, error: error?.message || 'Unknown error' };
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Notifications sent: ${successful} successful, ${failed} failed`,
      sent: successful,
      failed,
      results
    });

  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

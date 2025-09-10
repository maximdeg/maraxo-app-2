import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { subscription, userAgent, timestamp } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Store subscription in database
    const result = await query(
      `INSERT INTO push_subscriptions (endpoint, p256dh_key, auth_key, user_agent, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (endpoint) 
       DO UPDATE SET 
         p256dh_key = EXCLUDED.p256dh_key,
         auth_key = EXCLUDED.auth_key,
         user_agent = EXCLUDED.user_agent,
         updated_at = EXCLUDED.updated_at
       RETURNING id`,
      [
        subscription.endpoint,
        subscription.keys?.p256dh || null,
        subscription.keys?.auth || null,
        userAgent || null,
        timestamp || new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Subscription saved successfully',
      id: result.rows[0]?.id
    });

  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

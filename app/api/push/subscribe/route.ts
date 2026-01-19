import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

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
    
    // Provide more detailed error information
    let errorMessage = 'Failed to save subscription';
    if (error instanceof Error) {
      // Check if it's a database connection error
      if (error.message.includes('relation "push_subscriptions" does not exist')) {
        errorMessage = 'Database table push_subscriptions does not exist. Please run database migrations.';
      } else if (error.message.includes('duplicate key')) {
        errorMessage = 'Subscription already exists';
      } else {
        errorMessage = `Database error: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

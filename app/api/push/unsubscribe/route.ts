import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Remove subscription from database
    await query(
      'DELETE FROM push_subscriptions WHERE endpoint = $1',
      [subscription.endpoint]
    );

    return NextResponse.json({
      success: true,
      message: 'Subscription removed successfully'
    });

  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}

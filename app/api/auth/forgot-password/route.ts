import { NextRequest, NextResponse } from 'next/server';
import { generateResetToken, sendPasswordResetEmail } from '@/lib/auth';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const resetToken = await generateResetToken(email);

        if (!resetToken) {
            // Don't reveal if email exists or not for security
            return NextResponse.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent.'
            });
        }

        const emailSent = await sendPasswordResetEmail(email, resetToken);

        if (!emailSent) {
            return NextResponse.json(
                { error: 'Failed to send password reset email' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 
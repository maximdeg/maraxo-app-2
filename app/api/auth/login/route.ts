import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { rateLimit, getClientIP, createRateLimitResponse } from '@/lib/rate-limit';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIP = getClientIP(request);
        const rateLimitResult = rateLimit(`login:${clientIP}`, 5, 60000); // 5 attempts per minute
        
        if (!rateLimitResult.success) {
            return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime);
        }

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await authenticateUser({ email, password });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const token = generateToken(user);

        // Create secure response with HTTP-only cookie
        const responseData: any = {
            success: true,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        };

        // Optionally include token in response body for testing/API clients
        // Check if client explicitly requests token in body (via query param or header)
        const includeToken = request.headers.get('x-include-token') === 'true' || 
                            new URL(request.url).searchParams.get('includeToken') === 'true';
        
        if (includeToken || process.env.NODE_ENV === 'development') {
            responseData.token = token;
        }

        const response = NextResponse.json(responseData);

        // Set secure HTTP-only cookie (always set for security)
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400, // 24 hours
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 
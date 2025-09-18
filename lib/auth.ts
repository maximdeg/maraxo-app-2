import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
// Remove crypto import - using web crypto API instead
import { query } from './db';

// JWT Secret - must be provided via environment variables
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

// Type assertion to tell TypeScript that JWT_SECRET is defined
const JWT_SECRET_SAFE = JWT_SECRET as string;

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    secure: true,
    port: 465,
});

export interface User {
    id: number;
    full_name: string;
    email: string;
    role: string;
    created_at: Date;
    updated_at: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}

// Password verification
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// JWT token generation
export function generateToken(user: User): string {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            role: user.role,
            full_name: user.full_name 
        },
        JWT_SECRET_SAFE,
        { expiresIn: '24h' }
    );
}

// JWT token verification
export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET_SAFE);
    } catch (error) {
        return null;
    }
}

// User authentication
export async function authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    try {
        const result = await query(
            'SELECT id, full_name, email, password, role, created_at, updated_at FROM users WHERE email = $1',
            [credentials.email]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];
        const isValidPassword = await verifyPassword(credentials.password, user.password);

        if (!isValidPassword) {
            return null;
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

// Generate password reset token
export async function generateResetToken(email: string): Promise<string | null> {
    try {
        // Generate a random token using web crypto API
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const resetToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

        const result = await query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3 RETURNING id',
            [resetToken, resetTokenExpires, email]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return resetToken;
    } catch (error) {
        console.error('Error generating reset token:', error);
        return null;
    }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
        // Check if email configuration is available
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS environment variables.');
            return false;
        }

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - Maraxo Admin',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>You have requested to reset your password for the Maraxo Admin panel.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="${resetUrl}" 
                       style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                        Reset Password
                    </a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated email from the Maraxo Admin system.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
}

// Reset password with token
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    try {
        const hashedPassword = await hashPassword(newPassword);
        
        const result = await query(
            `UPDATE users 
             SET password = $1, reset_token = NULL, reset_token_expires = NULL 
             WHERE reset_token = $2 AND reset_token_expires > NOW()`,
            [hashedPassword, token]
        );

        return (result.rowCount ?? 0) > 0;
    } catch (error) {
        console.error('Error resetting password:', error);
        return false;
    }
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
    try {
        const result = await query(
            'SELECT id, full_name, email, role, created_at, updated_at FROM users WHERE id = $1',
            [id]
        );

        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
} 
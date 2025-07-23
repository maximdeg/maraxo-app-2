import jwt from 'jsonwebtoken';

// Secret key for JWT signing - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface CancellationTokenPayload {
    appointmentId: string;
    patientId: string;
    patientPhone: string;
    appointmentDate: string;
    appointmentTime: string;
    iat?: number; // JWT standard field
    exp?: number; // JWT standard field
}

/**
 * Generate a JWT token for appointment cancellation
 * @param appointmentData - Appointment data to include in token
 * @returns JWT token string
 */
export function generateCancellationToken(appointmentData: {
    appointmentId: string;
    patientId: string;
    patientPhone: string;
    appointmentDate: string;
    appointmentTime: string;
}): string {
    const payload: CancellationTokenPayload = {
        ...appointmentData,
    };

    // Calculate expiration time: 12 hours before appointment
    const appointmentDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}:00`);
    const expirationTime = new Date(appointmentDateTime.getTime() - (12 * 60 * 60 * 1000)); // 12 hours before
    const now = new Date();
    
    // If the expiration time is in the past, set it to 1 hour from now
    const finalExpirationTime = expirationTime > now ? expirationTime : new Date(now.getTime() + (60 * 60 * 1000));
    
    const expiresIn = Math.floor((finalExpirationTime.getTime() - now.getTime()) / 1000);

    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode a cancellation token
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyCancellationToken(token: string): CancellationTokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as CancellationTokenPayload;
        return decoded;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

/**
 * Check if a cancellation token is expired
 * @param token - JWT token to check
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
    try {
        const decoded = jwt.decode(token) as CancellationTokenPayload;
        if (!decoded || !decoded.exp) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
}

/**
 * Check if cancellation is allowed based on appointment time
 * @param appointmentDate - Appointment date (YYYY-MM-DD)
 * @param appointmentTime - Appointment time (HH:MM)
 * @returns true if cancellation is allowed (more than 12 hours before appointment)
 */
export function isCancellationAllowed(appointmentDate: string, appointmentTime: string): boolean {
    try {
        const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
        const now = new Date();
        const twelveHoursBefore = new Date(appointmentDateTime.getTime() - (12 * 60 * 60 * 1000));
        
        return now < twelveHoursBefore;
    } catch (error) {
        return false;
    }
}

/**
 * Get the expiration time for a cancellation token
 * @param appointmentDate - Appointment date (YYYY-MM-DD)
 * @param appointmentTime - Appointment time (HH:MM)
 * @returns Date object representing when the cancellation link expires
 */
export function getCancellationExpirationTime(appointmentDate: string, appointmentTime: string): Date {
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
    return new Date(appointmentDateTime.getTime() - (12 * 60 * 60 * 1000));
}

/**
 * Generate a cancellation URL for an appointment
 * @param baseUrl - Base URL of the application
 * @param token - Cancellation token
 * @returns Full cancellation URL
 */
export function generateCancellationUrl(baseUrl: string, token: string): string {
    return `${baseUrl}/cancelar-cita?token=${encodeURIComponent(token)}`;
} 
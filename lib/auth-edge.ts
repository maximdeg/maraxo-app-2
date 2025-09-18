// Edge Runtime compatible auth functions
// This file only contains functions that work in Edge Runtime (no Node.js modules)

import jwt from 'jsonwebtoken';

// JWT Secret - must be provided via environment variables
function getJWTSecret(): string {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  if (JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
  return JWT_SECRET;
}

// JWT token verification (Edge Runtime compatible)
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, getJWTSecret());
  } catch (error) {
    return null;
  }
}

// Generate JWT token (Edge Runtime compatible)
export function generateToken(user: { id: number; email: string; role: string; full_name: string }): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      full_name: user.full_name 
    },
    getJWTSecret(),
    { expiresIn: '24h' }
  );
}

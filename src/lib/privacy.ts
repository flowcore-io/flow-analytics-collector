import { createHash } from "crypto";
import env from "../env/server";

/**
 * Generate a daily salt based on current date and SECRET_KEY
 * The salt rotates at midnight UTC, making hashes irreversible after 24 hours
 */
export function generateDailySalt(date: Date = new Date()): string {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  const input = `${dateStr}:${env.SECRET_KEY}`;
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Create a privacy-safe visitor hash using IP + User-Agent + daily salt
 * This hash uniquely identifies a visitor for the current day only
 */
export function generateVisitorHash(ip: string, userAgent: string, date: Date = new Date()): string {
  const dailySalt = generateDailySalt(date);
  const input = `${ip}:${userAgent}:${dailySalt}`;
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Extract client IP from various proxy headers
 * Prioritizes: X-Forwarded-For, X-Real-IP, CF-Connecting-IP
 */
export function extractClientIP(headers: Record<string, string | undefined>): string {
  // Check common proxy headers in order of preference
  const xForwardedFor = headers['x-forwarded-for'];
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }
  
  const xRealIP = headers['x-real-ip'];
  if (xRealIP) {
    return xRealIP.trim();
  }
  
  const cfConnectingIP = headers['cf-connecting-ip'];
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  
  // Fallback - this shouldn't happen in production behind a proxy
  return 'unknown';
}

/**
 * Get current salt rotation timestamp for monitoring
 */
export function getSaltRotationInfo(date: Date = new Date()) {
  const currentSalt = generateDailySalt(date);
  const nextRotation = new Date(date);
  nextRotation.setUTCDate(nextRotation.getUTCDate() + 1);
  nextRotation.setUTCHours(0, 0, 0, 0);
  
  return {
    currentSalt: currentSalt.substring(0, 8), // Only show first 8 chars for monitoring
    nextRotationAt: nextRotation.toISOString(),
    secondsUntilRotation: Math.floor((nextRotation.getTime() - date.getTime()) / 1000),
  };
} 
import { z } from "zod";

export const FlowcoreAnalytics = {
  flowType: "visitor.v0",
  eventType: {
    visitorTracked: "visitor.tracked.v0",
  },
} as const;

// Event schemas using Zod for validation
export const EventVisitorTrackedSchema = z.object({
  // Privacy-safe visitor identifier (daily rotating hash)
  visitorHash: z.string().length(64, "Visitor hash must be 64 characters"),

  // Page/Event details
  pathname: z.string().min(1, "Pathname is required"),
  referrer: z.string().optional(),
  eventName: z.string().optional(), // For custom events beyond page views

  // Metadata
  timestamp: z.string().datetime(),
  userAgent: z.string().optional(), // Hashed, not stored raw

  // Optional custom properties for advanced tracking
  customProperties: z.record(z.string(), z.unknown()).optional(),

  // Session context (derived from hash, not personally identifiable)
  sessionContext: z
    .object({
      isNewVisitor: z.boolean().optional(),
      dailySaltRotation: z.string(), // Date of current salt for debugging
    })
    .optional(),
});

// Type exports
export type EventVisitorTracked = z.infer<typeof EventVisitorTrackedSchema>;

// Helper function to create a visitor tracked event
export function createVisitorTrackedEvent(data: {
  visitorHash: string;
  pathname: string;
  referrer?: string;
  eventName?: string;
  userAgent?: string;
  customProperties?: Record<string, unknown>;
  sessionContext?: {
    isNewVisitor?: boolean;
    dailySaltRotation: string;
  };
}): EventVisitorTracked {
  return {
    visitorHash: data.visitorHash,
    pathname: data.pathname,
    referrer: data.referrer,
    eventName: data.eventName,
    timestamp: new Date().toISOString(),
    userAgent: data.userAgent,
    customProperties: data.customProperties,
    sessionContext: data.sessionContext,
  };
}

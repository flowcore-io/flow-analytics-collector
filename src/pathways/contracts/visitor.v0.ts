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
  referrer: z.string().optional(), // The page that linked to the current page
  eventName: z.string().optional(), // For custom events beyond page views

  // Metadata
  userAgent: z.string().optional(), // Hashed, not stored raw

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
    userAgent: data.userAgent,
    sessionContext: data.sessionContext,
  };
}

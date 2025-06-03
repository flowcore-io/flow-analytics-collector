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
  referrer: z.string(), // The page that linked to the current page

  // Session context (derived from hash, not personally identifiable)
  sessionContext: z
    .object({
      dailySaltRotation: z.string(), // Date of current salt for debugging
    })
});

// Type exports
export type EventVisitorTracked = z.infer<typeof EventVisitorTrackedSchema>;

// Helper function to create a visitor tracked event
export function createVisitorTrackedEvent(data: {
  visitorHash: string;
  pathname: string;
  referrer?: string;
  eventName?: string;
  sessionContext?: {
    dailySaltRotation: string;
  };
}): EventVisitorTracked {
  return {
    visitorHash: data.visitorHash,
    pathname: data.pathname,
    referrer: data.referrer ?? "",
    sessionContext: data.sessionContext ?? {
      dailySaltRotation: "",
    },
  };
}

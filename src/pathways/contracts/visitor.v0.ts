import { z } from "zod";

export const FlowcoreAnalytics = {
  dataCore: "flow-analytics",
  flowType: "visitor.v0",
  eventType: {
    visitorTracked: "visitor.tracked.v0",
  },
} as const;

// Event schemas using Zod for validation
export const EventVisitorTrackedEventSchema = z.strictObject({
  // Privacy-safe visitor identifier (daily rotating hash)
  visitorHash: z.string().length(64, "Visitor hash must be 64 characters"),

  // Page/Event details
  domain: z.string(),
  pathname: z.string(),
  referrer: z.string(), // The page that linked to the current page

  // Session context (derived from hash, not personally identifiable)
  sessionContext: z.object({
    dailySaltRotation: z.string(), // Date of current salt for debugging
  }),
});

// Type exports
export type EventVisitorTracked = z.infer<typeof EventVisitorTrackedEventSchema>;

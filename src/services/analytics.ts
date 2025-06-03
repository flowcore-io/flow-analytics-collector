import { z } from "zod";
import { extractClientIP, generateVisitorHash } from "../lib/privacy";
import { FlowcoreAnalytics, createVisitorTrackedEvent, pathways } from "../pathways";

// Input validation schema for incoming analytics events
export const AnalyticsInputSchema = z.object({
  pathname: z.string().min(1, "Pathname is required"),
  referrer: z.string().optional(),
});

export type AnalyticsPageviewUserInput = z.infer<typeof AnalyticsInputSchema>;

/**
 * Analytics service for processing and emitting visitor tracking events
 */
export class AnalyticsService {
  /**
   * Process an analytics event from the browser
   * Generates privacy-safe visitor hash and emits to Flowcore
   */
  async processPageview(
    input: AnalyticsPageviewUserInput,
    headers: Record<string, string | undefined>
  ): Promise<{ success: true; eventId?: string } | { success: false; error: string }> {
    try {
      // Validate input
      const validatedInput = AnalyticsInputSchema.parse(input);

      // Extract privacy information
      const clientIP = extractClientIP(headers);
      const userAgent = headers["user-agent"] || "unknown";

      // Generate privacy-safe visitor hash
      const visitorHash = generateVisitorHash(clientIP, userAgent);

      // Create the event
      const event = createVisitorTrackedEvent({
        visitorHash,
        pathname: validatedInput.pathname,
        referrer: validatedInput.referrer,
        sessionContext: {
          dailySaltRotation: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        },
      });

      // Write to Flowcore via pathways
      // This will trigger the handler after successful emission
      await pathways.write(
        `${FlowcoreAnalytics.flowType}/${FlowcoreAnalytics.eventType.visitorTracked}`,
        {
          data: event,
        }
      );

      console.log(`📊 Analytics event processed: ${validatedInput.pathname}`);

      return { success: true };
    } catch (error) {
      console.error("❌ Error processing analytics event:", error);

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: `Validation error: ${error.errors.map((e) => e.message).join(", ")}`,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get analytics service health status
   */
  getHealthStatus() {
    return {
      status: "ok",
      service: "analytics",
      pathwaysConfigured: true,
      flowType: FlowcoreAnalytics.flowType,
      eventTypes: Object.values(FlowcoreAnalytics.eventType),
    };
  }
}

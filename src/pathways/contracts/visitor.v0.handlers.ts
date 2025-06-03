import type { FlowcoreEvent } from "@flowcore/pathways";
import type { EventVisitorTracked } from "./visitor.v0";

/**
 * Handler for visitor.tracked.v0 events
 * This handler processes visitor tracking events after they've been written to Flowcore
 * Primarily used for monitoring, local caching, or real-time analytics
 */
export async function handlerVisitorTracked(
  event: Omit<FlowcoreEvent, "payload"> & { payload: EventVisitorTracked }
) {
  console.log(
    `📊 Visitor tracked: ${event.validTime} ${event.flowType} ${event.eventType} ${event.eventId}`
  );

  const payload = event.payload;

  // Log key metrics for monitoring (no personal data logged)
  console.log(`📍 Page: ${payload.pathname}`);
  console.log(`🔗 Referrer: ${payload.referrer || "direct"}`);
  console.log(`⚡ Event: ${payload.eventName || "page_view"}`);
  console.log(`🔐 Visitor Hash: ${payload.visitorHash.substring(0, 8)}...`);

  // Optional: Update local metrics, cache, or trigger real-time processing
  // This is where you could add:
  // - Real-time dashboard updates
  // - Local analytics aggregations
  // - A/B testing logic
  // - Feature flag decisions

  // For now, we just ensure the event was processed successfully
  // The main value is that the event is now in Flowcore's immutable log

  // Example: Simple metrics tracking (could be Redis counters, etc.)
  try {
    // You could add metrics tracking here
    // await updateAnalyticsMetrics(payload);

    console.log("✅ Visitor tracking event processed successfully");
  } catch (error) {
    console.error("❌ Error processing visitor tracking event:", error);
    // Re-throw to ensure pathway marks this as failed
    throw error;
  }
}

/**
 * Example analytics insights extraction
 * This demonstrates how you might process events for real-time analytics
 */
export function extractAnalyticsInsights(payload: EventVisitorTracked) {
  return {
    isPageView: !payload.eventName || payload.eventName === "page_view",
    isCustomEvent: !!payload.eventName && payload.eventName !== "page_view",
    hasReferrer: !!payload.referrer,
    saltRotationDate: payload.sessionContext?.dailySaltRotation,
    eventType: payload.eventName || "page_view",
  };
}

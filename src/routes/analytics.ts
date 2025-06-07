import { Elysia } from "elysia";
import { type AnalyticsPageviewUserInput, AnalyticsService } from "../services/analytics";

// Initialize the analytics service
const analyticsService = new AnalyticsService();

export const analyticsRoutes = new Elysia({ name: "analytics" })
  .post(
    "/pageview",
    async ({ body, headers, set }) => {
      try {
        const result = await analyticsService.processPageview(
          body as AnalyticsPageviewUserInput,
          headers
        );

        if (result.success) {
          set.status = 204; // No Content - standard for analytics
          return;
        }
        set.status = 400;
        return { error: result.error };
      } catch (error) {
        console.error("Error in /api/pageview:", error);
        set.status = 500;
        return { error: "Internal server error" };
      }
    },
    {
      tags: ["Analytics"],
      summary: "Track page view or custom event",
      description:
        "Accepts analytics events, generates privacy-safe visitor hash, and emits to Flowcore",
    }
  ); 
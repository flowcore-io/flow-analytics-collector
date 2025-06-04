import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import type { FlowcoreLegacyEvent } from "@flowcore/pathways";
import { Elysia } from "elysia";
import env from "./env/server";
import { pathwaysRouter } from "./pathways/pathways";
import { type AnalyticsPageviewUserInput, AnalyticsService } from "./services/analytics";

// Initialize services
const analyticsService = new AnalyticsService();

const app = new Elysia()
  // Add CORS support for cross-domain analytics requests
  .use(
    cors({
      origin: true, // Allow all origins for analytics collection
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "User-Agent",
        "X-Forwarded-For",
        "X-Real-IP",
        "CF-Connecting-IP",
        "X-Secret", // Add X-Secret for Flowcore transformer authentication
      ],
    })
  )

  .use(
    swagger({
      documentation: {
        info: {
          title: "Flowcore Analytics Collector",
          version: "1.0.0",
          description: "Privacy-first analytics collection API that emits events to Flowcore",
        },
        tags: [
          { name: "Analytics", description: "Event collection endpoints" },
          { name: "Health", description: "Health and monitoring endpoints" },
          { name: "Transformer", description: "Flowcore transformer endpoints" },
        ],
      },
    })
  )

  // Flowcore transformer endpoint - handles webhook events from Flowcore
  .post(
    "/api/transformer",
    async ({ body, headers, set }) => {
      try {
        const event = body as unknown as FlowcoreLegacyEvent;
        const secret = headers["x-secret"] ?? "";

        await pathwaysRouter.processEvent(event, secret);
        set.status = 200;
        return "OK";
      } catch (error) {
        console.error("❌ Error processing Flowcore event:", error);
        set.status = 500;
        return { error: (error as Error).message };
      }
    },
    {
      tags: ["Transformer"],
      summary: "Flowcore event transformer",
      description: "Receives and processes events from Flowcore via webhooks",
    }
  )

  // Main analytics event collection endpoint
  .post(
    "/api/pageview",
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
        console.error("Error in /api/event:", error);
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
  )

  // Root endpoint
  .get(
    "/",
    () => ({
      service: "Flowcore Analytics Collector",
      version: "1.0.0",
      status: "running",
      endpoints: {
        health: "/health",
        docs: "/swagger",
        transformer: "/api/transformer",
        pageview: "/api/pageview",
      },
    }),
    {
      tags: ["Health"],
      summary: "Service information",
      description: "Returns basic service information and available endpoints",
    }
  )

  .listen(Number.parseInt(env.PORT));

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`📖 API Documentation: http://localhost:${env.PORT}/swagger`);

import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import env from "./env/server";
import { getSaltRotationInfo } from "./lib/privacy";
import { AnalyticsService } from "./services/analytics";

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
      ],
    })
  )

  // Add Swagger documentation
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

  // Main analytics event collection endpoint
  .post(
    "/api/event",
    async ({ body, headers, set }) => {
      try {
        const result = await analyticsService.processEvent(body, headers);

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
      body: t.Object({
        pathname: t.String({ minLength: 1, description: "Page pathname" }),
        referrer: t.Optional(t.String({ description: "Referrer URL" })),
      }),
      tags: ["Analytics"],
      summary: "Track page view or custom event",
      description:
        "Accepts analytics events, generates privacy-safe visitor hash, and emits to Flowcore",
    }
  )

  // Health check endpoint
  .get(
    "/healthz",
    () => {
      return { status: "ok" };
    },
    {
      tags: ["Health"],
      summary: "Health check",
      description: "Returns service health status for load balancers",
    }
  )

  // Detailed health endpoint with analytics info
  .get(
    "/health",
    () => {
      const healthStatus = analyticsService.getHealthStatus();
      const saltInfo = getSaltRotationInfo();

      return {
        ...healthStatus,
        saltRotation: {
          nextRotationAt: saltInfo.nextRotationAt,
          secondsUntilRotation: saltInfo.secondsUntilRotation,
        },
        environment: {
          tenant: env.FLOWCORE_TENANT,
          dataCore: env.FLOWCORE_DATACORE,
        },
      };
    },
    {
      tags: ["Health"],
      summary: "Detailed health information",
      description:
        "Returns detailed service health including salt rotation and Flowcore configuration",
    }
  )

  // Metrics endpoint for monitoring
  .get(
    "/metrics",
    () => {
      const saltInfo = getSaltRotationInfo();

      // Basic metrics in a format that could be consumed by Prometheus
      const metrics = [
        "# HELP analytics_salt_rotation_seconds Seconds until next salt rotation",
        "# TYPE analytics_salt_rotation_seconds gauge",
        `analytics_salt_rotation_seconds ${saltInfo.secondsUntilRotation}`,
        "",
        "# HELP analytics_service_info Service information",
        "# TYPE analytics_service_info gauge",
        `analytics_service_info{tenant="${env.FLOWCORE_TENANT}",datacore="${env.FLOWCORE_DATACORE}",flow_type="visitor.v0"} 1`,
      ].join("\n");

      return new Response(metrics, {
        headers: { "Content-Type": "text/plain" },
      });
    },
    {
      tags: ["Health"],
      summary: "Prometheus metrics",
      description: "Returns metrics in Prometheus format for monitoring systems",
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
        event: "/api/event",
        health: "/healthz",
        metrics: "/metrics",
        transformer: "/api/transformer",
        docs: "/swagger",
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
console.log(`🔗 Analytics endpoint: http://localhost:${env.PORT}/api/event`);
console.log(`💓 Health check: http://localhost:${env.PORT}/healthz`);

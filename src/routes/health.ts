import { Elysia } from "elysia";

export const healthRoutes = new Elysia({ name: "health" })
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
  .get(
    "/health",
    () => ({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
    {
      tags: ["Health"],
      summary: "Health check",
      description: "Returns service health status",
    }
  );

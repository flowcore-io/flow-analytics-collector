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
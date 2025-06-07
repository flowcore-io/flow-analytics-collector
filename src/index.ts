import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import env from "./env/server";
import { analyticsRoutes, healthRoutes, transformerRoutes } from "./routes";

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

  // Register route groups
  .use(healthRoutes)
  .group("/api", (app) => app.use(analyticsRoutes).use(transformerRoutes))

  .listen(Number.parseInt(env.PORT));

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`📖 API Documentation: http://localhost:${env.PORT}/swagger`);

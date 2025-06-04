import { noOpLogger } from "@flowcore/data-pump";
import { PathwayRouter, PathwaysBuilder, createPostgresPathwayState } from "@flowcore/pathways";
import env from "../env/server";

// Import contracts and handlers
import * as visitorContract from "./contracts/visitor.v0";
import { EventVisitorTrackedEventSchema } from "./contracts/visitor.v0";

export const pathways = new PathwaysBuilder({
  baseUrl: env.FLOWCORE_WEBHOOK_BASEURL,
  tenant: env.FLOWCORE_TENANT,
  dataCore: env.FLOWCORE_DATACORE,
  apiKey: env.FLOWCORE_API_KEY,
  logger: noOpLogger,
  pathwayTimeoutMs: 5_000,
})
.withPathwayState(
  createPostgresPathwayState({
    connectionString: env.POSTGRES_CONNECTION_STRING || "postgresql://postgres:postgres@localhost:5432/pathway_db",
  }),
)
.register({
  flowType: visitorContract.FlowcoreAnalytics.flowType,
  eventType: visitorContract.FlowcoreAnalytics.eventType.visitorTracked,
  // biome-ignore lint/suspicious/noExplicitAny: Flowcore library compatibility requires any type
  schema: EventVisitorTrackedEventSchema as any,
  writable: true,
})
.handle(
    `${visitorContract.FlowcoreAnalytics.flowType}/${visitorContract.FlowcoreAnalytics.eventType.visitorTracked}`,
    async (event) => {
      console.log("🔄 Processing visitor tracked event:", {
        eventId: event.eventId,
        flowType: event.flowType,
        eventType: event.eventType,
        validTime: event.validTime,
        payload: event.payload
      });
    }
  );
  

export const pathwaysRouter = new PathwayRouter(pathways, env.FLOWCORE_TRANSFORMER_SECRET || "_");

// Log the pathways configuration
console.log("🛤️ Flowcore Pathways configured:");
console.log(`   Tenant: ${env.FLOWCORE_TENANT}`);
console.log(`   Data Core: ${env.FLOWCORE_DATACORE}`);
console.log(`   Flow Type: ${visitorContract.FlowcoreAnalytics.flowType}`);
console.log(
  `   Event Types: ${Object.values(visitorContract.FlowcoreAnalytics.eventType).join(", ")}`
);
console.log(`   Postgres Connection: ${env.POSTGRES_CONNECTION_STRING ? "Using connection string" : "Using fallback connection"}`);

import { noOpLogger } from "@flowcore/data-pump";
import { PathwayRouter, PathwaysBuilder } from "@flowcore/pathways";
import env from "../env/server";

// Import contracts and handlers
import * as visitorContract from "./contracts/visitor.v0";
import { handlerVisitorTracked } from "./contracts/visitor.v0.handlers";

// Create pathway state (in-memory for now)
const pathwayState = undefined;

// If Postgres is available, use it for pathway state persistence
if (env.POSTGRES_CONNECTION_STRING) {
  try {
    // Note: Postgres pathway state requires additional configuration
    console.log("📊 Postgres URL available for pathway state");
  } catch (_error) {
    console.warn("⚠️ Postgres pathway state not available, using in-memory state");
  }
}

export const pathways = new PathwaysBuilder({
  baseUrl: env.FLOWCORE_WEBHOOK_BASEURL,
  tenant: env.FLOWCORE_TENANT,
  dataCore: env.FLOWCORE_DATACORE,
  apiKey: env.FLOWCORE_WEBHOOK_API_KEY,
  logger: noOpLogger,
  pathwayTimeoutMs: 30_000,
})
  .register({
    flowType: visitorContract.FlowcoreAnalytics.flowType,
    eventType: visitorContract.FlowcoreAnalytics.eventType.visitorTracked,
    schema: undefined, // Schema validation handled by analytics service
    writable: true,
  })
  .handle(
    `${visitorContract.FlowcoreAnalytics.flowType}/${visitorContract.FlowcoreAnalytics.eventType.visitorTracked}`,
    // Type assertion needed for handler compatibility
    handlerVisitorTracked as (event: { eventId: string; validTime: string; payload: unknown }) => Promise<void>
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
console.log(`   Pathway State: ${pathwayState ? "Postgres" : "In-Memory"}`);

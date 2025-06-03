import env from "../env/server";
import { noOpLogger } from "@flowcore/data-pump";
import { PathwayRouter, PathwaysBuilder } from "@flowcore/pathways";

// Import contracts and handlers
import * as visitorContract from "./contracts/visitor.v0";

// Create in-memory pathway state (can be upgraded to Postgres later)
let pathwayState: any = undefined;

// If Postgres is available, use it for pathway state persistence
if (env.POSTGRES_CONNECTION_STRING) {
  try {
    const { createPostgresPathwayState } = require("@flowcore/pathways");
    pathwayState = createPostgresPathwayState({
      connectionString: env.POSTGRES_CONNECTION_STRING,
      tableName: "_pathways_state",
    });
  } catch (error) {
    console.warn("⚠️ Postgres pathway state not available, using in-memory state");
  }
}

// Simple handler function
async function handlerVisitorTracked(event: any) {
  console.log(
    `📊 Visitor tracked: ${event.validTime} ${event.flowType} ${event.eventType} ${event.eventId}`
  );

  const payload = event.payload;

  // Log key metrics for monitoring (no personal data logged)
  console.log(`📍 Page: ${payload.pathname}`);
  console.log(`🔗 Referrer: ${payload.referrer || "direct"}`);
  console.log(`⚡ Event: ${payload.eventName || "page_view"}`);
  console.log(`🔐 Visitor Hash: ${payload.visitorHash.substring(0, 8)}...`);

  try {
    console.log("✅ Visitor tracking event processed successfully");
  } catch (error) {
    console.error("❌ Error processing visitor tracking event:", error);
    throw error;
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
  .withPathwayState(pathwayState)
  .register({
    flowType: visitorContract.FlowcoreAnalytics.flowType,
    eventType: visitorContract.FlowcoreAnalytics.eventType.visitorTracked,
    schema: visitorContract.EventVisitorTrackedSchema as any,
    writable: true,
  })
  .handle(
    `${visitorContract.FlowcoreAnalytics.flowType}/${visitorContract.FlowcoreAnalytics.eventType.visitorTracked}`,
    handlerVisitorTracked
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

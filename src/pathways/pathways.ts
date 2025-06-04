import { noOpLogger } from "@flowcore/data-pump";
import { PathwayRouter, PathwaysBuilder, createPostgresPathwayState } from "@flowcore/pathways";
import env from "../env/server";
import { EventVisitorTrackedEventSchema, FlowcoreAnalytics } from "./contracts/visitor.v0";

export const pathways = new PathwaysBuilder({
  baseUrl: env.FLOWCORE_WEBHOOK_BASEURL,
  tenant: env.FLOWCORE_TENANT,
  dataCore: FlowcoreAnalytics.dataCore,
  apiKey: env.FLOWCORE_API_KEY,
  logger: noOpLogger,
  pathwayTimeoutMs: 5_000,
})
  .withPathwayState(
    createPostgresPathwayState({
      connectionString: env.POSTGRES_CONNECTION_STRING,
    })
  )
  .register({
    flowType: FlowcoreAnalytics.flowType,
    eventType: FlowcoreAnalytics.eventType.visitorTracked,
    schema: EventVisitorTrackedEventSchema,
    writable: true,
  })
  .handle(
    `${FlowcoreAnalytics.flowType}/${FlowcoreAnalytics.eventType.visitorTracked}`,
    async (event) => {
      console.log("🔄 Processing visitor tracked event:", {
        eventId: event.eventId,
        flowType: event.flowType,
        eventType: event.eventType,
        validTime: event.validTime,
        payload: event.payload,
      });
    }
  );

export const pathwaysRouter = new PathwayRouter(pathways, env.FLOWCORE_TRANSFORMER_SECRET || "_");

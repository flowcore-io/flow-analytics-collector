import type { FlowcoreLegacyEvent } from "@flowcore/pathways";
import { Elysia } from "elysia";
import { pathwaysRouter } from "../pathways/pathways";

export const transformerRoutes = new Elysia({ name: "transformer" })
  .post(
    "/transformer",
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
  ); 
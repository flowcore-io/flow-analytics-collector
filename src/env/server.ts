import { z } from "zod";

const envSchema = z.object({
  // Application Config
  PORT: z.string().default("3000"),
  SECRET_KEY: z.string().min(32, "SECRET_KEY must be at least 32 characters"),

  // Flowcore Configuration
  FLOWCORE_TENANT: z.string(),
  FLOWCORE_DATACORE: z.string().default("flow-analytics"),
  FLOWCORE_WEBHOOK_BASEURL: z.string().url(),
  FLOWCORE_API_KEY: z.string(),
  FLOWCORE_TRANSFORMER_SECRET: z.string(),

  // Optional Redis for scaling (falls back to in-memory)
  REDIS_URL: z.string().optional(),

  // Database (for pathway state)
  POSTGRES_CONNECTION_STRING: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

const env = envSchema.parse({
  PORT: process.env.PORT || "3000",
  SECRET_KEY: process.env.SECRET_KEY,
  FLOWCORE_TENANT: process.env.FLOWCORE_TENANT,
  FLOWCORE_DATACORE: process.env.FLOWCORE_DATACORE || "flow-analytics",
  FLOWCORE_WEBHOOK_BASEURL: process.env.FLOWCORE_WEBHOOK_BASEURL,
  FLOWCORE_API_KEY: process.env.FLOWCORE_API_KEY,
  FLOWCORE_TRANSFORMER_SECRET: process.env.FLOWCORE_TRANSFORMER_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  POSTGRES_CONNECTION_STRING: process.env.POSTGRES_CONNECTION_STRING,
});

export default env;

import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  SECRET_KEY: z.string().min(32, "SECRET_KEY must be at least 32 characters"), // key for salting visitor hash

  // Flowcore Configuration
  FLOWCORE_TENANT: z.string(),
  FLOWCORE_WEBHOOK_BASEURL: z.string(),
  FLOWCORE_API_KEY: z.string(),
  FLOWCORE_TRANSFORMER_SECRET: z.string(),
  POSTGRES_CONNECTION_STRING: z.string(), // Database (for pathway state)
});

export type Env = z.infer<typeof envSchema>;

const env = envSchema.parse({
  PORT: process.env.PORT || "3000",
  SECRET_KEY: process.env.SECRET_KEY,
  FLOWCORE_TENANT: process.env.FLOWCORE_TENANT,
  FLOWCORE_WEBHOOK_BASEURL: process.env.FLOWCORE_WEBHOOK_BASEURL,
  FLOWCORE_API_KEY: process.env.FLOWCORE_API_KEY,
  FLOWCORE_TRANSFORMER_SECRET: process.env.FLOWCORE_TRANSFORMER_SECRET,
  POSTGRES_CONNECTION_STRING: process.env.POSTGRES_CONNECTION_STRING,
});

export default env;

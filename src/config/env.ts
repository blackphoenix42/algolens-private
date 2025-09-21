import { z } from "zod";

// Define the schema for environment variables
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  VITE_APP_TITLE: z.string().optional(),
  VITE_API_URL: z.string().url().optional(),
  VITE_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  // VITE_SENTRY_DSN: z.string().optional(), // Commented out Sentry
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.string().optional(),
  // Add more environment variables as needed
});

// Validate environment variables at runtime
function validateEnv() {
  try {
    const env = {
      NODE_ENV: import.meta.env.NODE_ENV,
      VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
      // VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN, // Commented out Sentry
      VITE_POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
      VITE_POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST,
    };

    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:", error.format());
      throw new Error(
        `Environment validation failed:\n${error.issues
          .map((err) => `  ${err.path.join(".")}: ${err.message}`)
          .join("\n")}`
      );
    }
    throw error;
  }
}

// Export the validated environment variables
export const env = validateEnv();

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;

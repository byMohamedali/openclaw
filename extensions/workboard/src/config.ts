import { buildPluginConfigSchema } from "openclaw/plugin-sdk/plugin-entry";
import { z } from "zod";

const workboardConfig = z
  .strictObject({
    concurrentOwners: z.array(z.string().min(1).max(120)).optional(),
  })
  .default({});

export const workboardPluginConfigSchema = buildPluginConfigSchema(workboardConfig);

export function readConcurrentOwners(config: unknown): string[] {
  return workboardConfig.parse(config ?? {}).concurrentOwners ?? [];
}

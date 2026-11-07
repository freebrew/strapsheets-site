import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const tool = z.object({
  name: z.string().min(1),
  kind: z.enum(["standard", "carrier", "custom"]),
});

const features = defineCollection({
  loader: glob({ pattern: "features.json", base: "./src/content" }),
  schema: z.object({
    tools: z.array(tool).min(1),
    headlines: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).min(1),
  }),
});

const releases = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/releases" }),
  schema: z.object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    platforms: z.array(z.enum(["iOS", "Android"])).min(1),
    notes: z.string().min(1),
  }),
});

export const collections = { features, releases };

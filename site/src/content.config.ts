import { defineCollection, z } from 'astro:content';

const mixes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    mixNumber: z.number(),
    date: z.string(), // e.g. "September 2018"
    duration: z.string(),
    bpm: z.number(),
    musicalKey: z.string(),
    trackCount: z.number(),
    genres: z.array(z.object({
      name: z.string(),
      count: z.number(),
      percent: z.number(),
    })),
    audioFile: z.string(), // R2 URL for the MP3
    peaksFile: z.string(), // URL for peaks.json
    fileSizeMb: z.number(),
    energyMean: z.number(),
    energyMax: z.number(),
    coverImage: z.string().optional(),
  }),
});

export const collections = { mixes };

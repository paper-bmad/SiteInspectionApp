import { z } from 'zod';

export const gpsLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().nullable().optional()
});

export const photoSchema = z.object({
  id: z.string().min(1),
  uri: z.string().min(1),
  category: z.enum(['Defect', 'Risk', 'Overview']),
  notes: z.string().optional(),
  gpsLocation: gpsLocationSchema.optional(),
  timestamp: z.string().datetime()
}).passthrough();

export const inspectionSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  status: z.enum(['draft', 'completed']),
  photos: z.array(photoSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  defectCounter: z.number().int().min(0).default(0),
  riskCounter: z.number().int().min(0).default(0),
}).passthrough();
import { z } from 'zod';

export const analyzeSchema = z.object({
  alignmentWithRecommendations: z.string(),
  trendsInData: z.string(),
});

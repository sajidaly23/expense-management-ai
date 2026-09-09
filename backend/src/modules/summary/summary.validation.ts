import { z } from 'zod';

export const summaryQuerySchema = z.object({
  months: z.coerce.number().int().min(3).max(12).optional().default(6),
});

export type SummaryQuery = z.infer<typeof summaryQuerySchema>;

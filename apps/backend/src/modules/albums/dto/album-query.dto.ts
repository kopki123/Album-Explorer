import { z } from 'zod';

export const listAlbumsQuery = z.object({
  q: z.string().trim().min(1).optional(),
  sort: z.enum(['releaseDate_desc', 'releaseDate_asc', 'title_asc']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListAlbumsQuery = z.infer<typeof listAlbumsQuery>;

import { z } from 'zod';

export const createMovieSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  originalTitle: z.string().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  releaseDate: z.string().datetime().or(z.date()),
  budget: z.number().int().min(0, 'Orçamento deve ser um número positivo'),
  durationMinutes: z.number().int().min(1, 'Duração deve ser pelo menos 1 minuto'),
  genre: z.string().min(1, 'Gênero é obrigatório'),
  trailerLink: z.string().url().optional().or(z.literal('')).transform((value) => value || undefined),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export const updateMovieSchema = createMovieSchema.partial();

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;

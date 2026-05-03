import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { createMovieSchema } from '../schemas/movie.js';
import {
  generatePresignedUploadUrl,
  generatePresignedReadUrl,
  deleteS3Object,
} from '../lib/s3.js';

function withThumbnailUrl(movie: {
  id: string;
  title: string;
  originalTitle: string | null;
  description: string;
  releaseDate: Date;
  budget: number;
  durationMinutes: number;
  genre: string;
  imageUrl: string;
  imageKey: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}) {
  return movie.imageKey
    ? { ...movie, imageUrl: movie.imageUrl || movie.imageUrl, imageKey: movie.imageKey }
    : movie;
}

async function serializeMovie(movie: Awaited<ReturnType<typeof prisma.movie.findMany>>[number]) {
  const imageUrl = movie.imageKey ? await generatePresignedReadUrl(movie.imageKey) : movie.imageUrl;

  return {
    ...movie,
    imageUrl,
  };
}

export async function movieRoutes(app: FastifyInstance) {
  app.post<{ Body: unknown }>(
    '/movies',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;
      const payload = createMovieSchema.safeParse(request.body);

      if (!payload.success) {
        return reply.status(400).send({
          message: 'Dados inválidos',
          errors: payload.error.flatten(),
        });
      }

      try {
        const movie = await prisma.movie.create({
          data: {
            title: payload.data.title,
            originalTitle: payload.data.originalTitle,
            description: payload.data.description,
            releaseDate: new Date(payload.data.releaseDate),
            budget: payload.data.budget,
            durationMinutes: payload.data.durationMinutes,
            genre: payload.data.genre,
            imageUrl: '',
            status: payload.data.status,
            userId,
          },
        });

        return reply.status(201).send(await serializeMovie(movie));
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Erro ao criar filme' });
      }
    }
  );

  app.post<{ Body: { fileName: string; mimeType: string } }>(
    '/movies/upload-url',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const { fileName, mimeType } = request.body as { fileName?: string; mimeType?: string };
      const userId = request.user.sub;

      if (!fileName || !mimeType) {
        return reply.status(400).send({ message: 'fileName e mimeType são obrigatórios' });
      }

      try {
        const { url, key } = await generatePresignedUploadUrl(fileName, mimeType, 3600, userId);
        return reply.send({ url, key });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Erro ao gerar URL de upload' });
      }
    }
  );

  app.patch<{ Params: { id: string }; Body: { imageKey?: string; imageUrl?: string } & Record<string, unknown> }>(
    '/movies/:id',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;
      const { id } = request.params;
      const body = request.body;

      const movie = await prisma.movie.findFirst({
        where: { id, userId },
      });

      if (!movie) {
        return reply.status(404).send({ message: 'Filme não encontrado' });
      }

      const updateData: Record<string, unknown> = {};

      if (typeof body.title === 'string') updateData.title = body.title;
      if (typeof body.originalTitle === 'string') updateData.originalTitle = body.originalTitle;
      if (typeof body.description === 'string') updateData.description = body.description;
      if (typeof body.releaseDate === 'string') updateData.releaseDate = new Date(body.releaseDate);
      if (typeof body.budget === 'number') updateData.budget = body.budget;
      if (typeof body.durationMinutes === 'number') updateData.durationMinutes = body.durationMinutes;
      if (typeof body.genre === 'string') updateData.genre = body.genre;
      if (body.status === 'DRAFT' || body.status === 'PUBLISHED') updateData.status = body.status;
      if (typeof body.imageKey === 'string') updateData.imageKey = body.imageKey;
      if (typeof body.imageUrl === 'string') updateData.imageUrl = body.imageUrl;

      // If imageKey is being changed, ensure it belongs to this user and remove old image
      if (typeof body.imageKey === 'string' && body.imageKey !== movie.imageKey) {
        const expectedPrefix = `movies/${request.user.sub}/`;
        if (!body.imageKey.startsWith(expectedPrefix)) {
          return reply.status(400).send({ message: 'imageKey inválido para este usuário' });
        }

        // delete old image if exists
        if (movie.imageKey) {
          try {
            await deleteS3Object(movie.imageKey);
          } catch (err) {
            app.log.error('Failed to delete previous image from S3:');
            app.log.error(String(err));
          }
        }
      }

      try {
        const updated = await prisma.movie.update({
          where: { id },
          data: updateData,
        });

        return reply.send(await serializeMovie(updated));
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Erro ao atualizar filme' });
      }
    }
  );

  app.get<{ Querystring: { limit?: string; offset?: string; q?: string } }>(
    '/movies',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;
      const limit = Math.min(parseInt(request.query.limit as string) || 10, 100);
      const offset = parseInt(request.query.offset as string) || 0;
      const q = (request.query.q ?? '').trim();

      const whereClause = q
        ? {
            userId,
            OR: [
              { title: { contains: q, mode: 'insensitive' as const } },
              { originalTitle: { contains: q, mode: 'insensitive' as const } },
              { genre: { contains: q, mode: 'insensitive' as const } },
              { description: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : { userId };

      try {
        const movies = await prisma.movie.findMany({
          where: whereClause,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        const total = await prisma.movie.count({ where: whereClause });
        const data = await Promise.all(movies.map((movie) => serializeMovie(movie)));

        return reply.send({
          data,
          pagination: { limit, offset, total },
        });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Erro ao listar filmes' });
      }
    }
  );

  app.get<{ Params: { id: string } }>(
    '/movies/:id',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;
      const { id } = request.params;

      try {
        const movie = await prisma.movie.findFirst({
          where: { id, userId },
        });

        if (!movie) {
          return reply.status(404).send({ message: 'Filme não encontrado' });
        }

        return reply.send(await serializeMovie(movie));
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Erro ao buscar filme' });
      }
    }
  );

  app.delete<{ Params: { id: string } }>(
    '/movies/:id',
    { onRequest: [app.authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;
      const { id } = request.params;

      try {
        const movie = await prisma.movie.findFirst({
          where: { id, userId },
        });

        if (!movie) {
          return reply.status(404).send({ message: 'Filme não encontrado' });
        }

        if (movie.imageKey) {
          await deleteS3Object(movie.imageKey).catch((err) => {
            app.log.error('Failed to delete image from S3:', err);
          });
        }

        await prisma.movie.delete({ where: { id } });

        return reply.send({ message: 'Filme deletado com sucesso' });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: 'Erro ao deletar filme' });
      }
    }
  );
}

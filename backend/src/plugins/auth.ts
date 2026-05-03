import type { FastifyInstance } from 'fastify';

export async function registerAuthPlugin(app: FastifyInstance) {
  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ message: 'Não autorizado' });
    }
  });
}

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { sendReleaseReminders } from '../lib/release-reminders.js';

function isAuthorizedCronRequest(headerValue: string | undefined, expectedSecret: string | undefined) {
  if (!expectedSecret) {
    return headerValue === '1' || headerValue === 'true';
  }

  return headerValue === expectedSecret;
}

async function handleReleaseReminders(app: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const vercelCronHeader = request.headers['x-vercel-cron'];
  const cronSecretHeader = request.headers['x-cron-secret'];

  if (
    !isAuthorizedCronRequest(typeof vercelCronHeader === 'string' ? vercelCronHeader : undefined, cronSecret) &&
    !isAuthorizedCronRequest(typeof cronSecretHeader === 'string' ? cronSecretHeader : undefined, cronSecret)
  ) {
    return reply.status(401).send({ message: 'Cron não autorizado' });
  }

  try {
    const result = await sendReleaseReminders();
    return reply.send({
      message: 'Lembretes processados com sucesso',
      ...result,
    });
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({ message: 'Erro ao processar lembretes de estreia' });
  }
}

export async function cronRoutes(app: FastifyInstance) {
  app.get('/cron/release-reminders', async (request, reply) => handleReleaseReminders(app, request, reply));
  app.post('/cron/release-reminders', async (request, reply) => handleReleaseReminders(app, request, reply));
}
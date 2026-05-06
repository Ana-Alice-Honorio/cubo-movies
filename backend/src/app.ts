import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { authRoutes, authCookieName } from './routes/auth.js';
import { cronRoutes } from './routes/cron.js';
import { movieRoutes } from './routes/movies.js';
import { registerAuthPlugin } from './plugins/auth.js';

export function buildApp() {
  const app = Fastify({ logger: true });
  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret-change-me';

  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.register(cookie);

  app.register(jwt, {
    secret: jwtSecret,
    cookie: {
      cookieName: authCookieName,
      signed: false,
    },
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: 'Cubos Movies API',
        description: 'Documentação das rotas do backend de Cubos Movies',
        version: '1.0.0',
      },
    },
  });

  app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  void registerAuthPlugin(app);

  app.get(
    '/health',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
            },
            required: ['status'],
            additionalProperties: false,
          },
        },
      },
    },
    async () => ({ status: 'ok' })
  );

  app.register(authRoutes, { prefix: '/auth' });
  app.register(cronRoutes);
  app.register(movieRoutes);

  if (!isProduction) {
    app.log.info('Running in development mode');
  }

  return app;
}

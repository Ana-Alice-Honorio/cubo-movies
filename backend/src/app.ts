import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authRoutes, authCookieName } from './routes/auth.js';
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

  void registerAuthPlugin(app);

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(authRoutes, { prefix: '/auth' });
  app.register(movieRoutes);

  if (!isProduction) {
    app.log.info('Running in development mode');
  }

  return app;
}

import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { comparePassword, hashPassword } from '../lib/password.js';
import { loginSchema, registerSchema } from '../schemas/auth.js';
import {
  authBodySchema,
  authUserResponseSchema,
  messageSchema,
  registerBodySchema,
  userSchema,
  validationErrorSchema,
} from '../lib/openapi.js';

export const authCookieName = 'movies_auth_token';

function serializeUser(user: { id: string; name: string; email: string }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function cookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
  };
}

export async function authRoutes(app: FastifyInstance) {
  app.get(
    '/me',
    {
      preHandler: [app.authenticate],
      schema: {
        response: {
          200: authUserResponseSchema,
        },
      },
    },
    async (request) => {
      const userId = request.user.sub;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!user) {
        return { user: null };
      }

      return { user: serializeUser(user) };
    }
  );

  app.post(
    '/register',
    {
      schema: {
        body: registerBodySchema,
        response: {
          201: {
            type: 'object',
            properties: {
              user: userSchema,
            },
            required: ['user'],
            additionalProperties: false,
          },
          400: validationErrorSchema,
          409: messageSchema,
        },
      },
    },
    async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        message: 'Dados inválidos',
        issues: parsed.error.flatten(),
      });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return reply.code(409).send({ message: 'E-mail já cadastrado' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const token = await reply.jwtSign({ sub: user.id });

    reply.setCookie(authCookieName, token, cookieOptions(process.env.NODE_ENV === 'production'));

    return reply.code(201).send({ user: serializeUser(user) });
  });

  app.post(
    '/login',
    {
      schema: {
        body: authBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              user: userSchema,
            },
            required: ['user'],
            additionalProperties: false,
          },
          400: validationErrorSchema,
          401: messageSchema,
        },
      },
    },
    async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        message: 'Dados inválidos',
        issues: parsed.error.flatten(),
      });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.code(401).send({ message: 'Credenciais inválidas' });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return reply.code(401).send({ message: 'Credenciais inválidas' });
    }

    const token = await reply.jwtSign({ sub: user.id });

    reply.setCookie(authCookieName, token, cookieOptions(process.env.NODE_ENV === 'production'));

    return { user: serializeUser(user) };
  });

  app.post(
    '/logout',
    {
      schema: {
        response: {
          200: messageSchema,
        },
      },
    },
    async (_request, reply) => {
      reply.clearCookie(authCookieName, { path: '/' });
      return reply.send({ message: 'Logout realizado com sucesso' });
    }
  );
}

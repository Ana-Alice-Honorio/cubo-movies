export const messageSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
  required: ['message'],
  additionalProperties: false,
} as const;

export const validationErrorSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    issues: { type: 'object' },
  },
  required: ['message', 'issues'],
  additionalProperties: false,
} as const;

export const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
  },
  required: ['id', 'name', 'email'],
  additionalProperties: false,
} as const;

export const authUserResponseSchema = {
  type: 'object',
  properties: {
    user: { anyOf: [userSchema, { type: 'null' }] },
  },
  required: ['user'],
  additionalProperties: false,
} as const;

export const authBodySchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
  },
  required: ['email', 'password'],
  additionalProperties: false,
} as const;

export const registerBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
  },
  required: ['name', 'email', 'password'],
  additionalProperties: false,
} as const;

export const movieStatusSchema = {
  type: 'string',
  enum: ['DRAFT', 'PUBLISHED'],
} as const;

export const movieSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    originalTitle: { type: ['string', 'null'] },
    description: { type: 'string' },
    releaseDate: { type: 'string', format: 'date-time' },
    releaseReminderSentAt: { type: ['string', 'null'], format: 'date-time' },
    budget: { type: 'integer' },
    durationMinutes: { type: 'integer' },
    genre: { type: 'string' },
    trailerLink: { type: ['string', 'null'] },
    imageUrl: { type: 'string' },
    imageKey: { type: ['string', 'null'] },
    status: movieStatusSchema,
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    userId: { type: 'string' },
  },
  required: [
    'id',
    'title',
    'originalTitle',
    'description',
    'releaseDate',
    'releaseReminderSentAt',
    'budget',
    'durationMinutes',
    'genre',
    'trailerLink',
    'imageUrl',
    'imageKey',
    'status',
    'createdAt',
    'updatedAt',
    'userId',
  ],
  additionalProperties: false,
} as const;

export const createMovieBodySchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    originalTitle: { type: 'string' },
    description: { type: 'string' },
    releaseDate: { type: 'string', format: 'date-time' },
    budget: { type: 'integer', minimum: 0 },
    durationMinutes: { type: 'integer', minimum: 1 },
    genre: { type: 'string' },
    trailerLink: { type: 'string' },
    status: movieStatusSchema,
  },
  required: ['title', 'description', 'releaseDate', 'budget', 'durationMinutes', 'genre'],
  additionalProperties: false,
} as const;

export const updateMovieBodySchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    originalTitle: { type: 'string' },
    description: { type: 'string' },
    releaseDate: { type: 'string', format: 'date-time' },
    budget: { type: 'integer', minimum: 0 },
    durationMinutes: { type: 'integer', minimum: 1 },
    genre: { type: 'string' },
    status: movieStatusSchema,
    imageKey: { type: ['string', 'null'] },
    imageUrl: { type: ['string', 'null'] },
    trailerLink: { type: ['string', 'null'] },
  },
  additionalProperties: false,
} as const;

export const uploadMovieUrlBodySchema = {
  type: 'object',
  properties: {
    fileName: { type: 'string' },
    mimeType: { type: 'string' },
  },
  required: ['fileName', 'mimeType'],
  additionalProperties: false,
} as const;

export const uploadMovieUrlResponseSchema = {
  type: 'object',
  properties: {
    url: { type: 'string' },
    key: { type: 'string' },
  },
  required: ['url', 'key'],
  additionalProperties: false,
} as const;

export const movieListResponseSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: movieSchema,
    },
    pagination: {
      type: 'object',
      properties: {
        limit: { type: 'integer' },
        offset: { type: 'integer' },
        total: { type: 'integer' },
      },
      required: ['limit', 'offset', 'total'],
      additionalProperties: false,
    },
  },
  required: ['data', 'pagination'],
  additionalProperties: false,
} as const;

export const cronResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    processedUsers: { type: 'integer' },
    processedMovies: { type: 'integer' },
  },
  required: ['message', 'processedUsers', 'processedMovies'],
  additionalProperties: false,
} as const;

import nodemailer from 'nodemailer';
import { prisma } from './prisma.js';

type ReminderMovie = {
  id: string;
  title: string;
  releaseDate: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

const REMINDER_TIME_ZONE = 'America/Sao_Paulo';

function getTimeZoneDayParts(reference = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: REMINDER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(reference);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Não foi possível calcular a data atual no fuso do lembrete');
  }

  return { year, month, day };
}

function getReminderDayWindow(reference = new Date()) {
  const { year, month, day } = getTimeZoneDayParts(reference);
  const start = new Date(`${year}-${month}-${day}T00:00:00-03:00`);
  const end = new Date(`${year}-${month}-${day}T00:00:00-03:00`);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function formatReleaseDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeZone: REMINDER_TIME_ZONE,
  }).format(date);
}

function createTransport() {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpAppPassword = process.env.SMTP_APP_PASSWORD?.trim();

  if (!smtpUser || !smtpAppPassword) {
    throw new Error('SMTP_USER e SMTP_APP_PASSWORD precisam ser configurados');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpAppPassword,
    },
  });
}

function getMailFrom() {
  return process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim();
}

function buildEmailHtml(userName: string, movies: ReminderMovie[]) {
  const items = movies
    .map(
      (movie) => `
        <li style="margin-bottom: 12px;">
          <strong>${movie.title}</strong><br />
          Estreia em ${formatReleaseDate(movie.releaseDate)}
        </li>`
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 12px;">Lembrete de estreia</h2>
      <p>Olá, ${userName}. O(s) filme(s) abaixo estreia(m) hoje:</p>
      <ul style="padding-left: 18px; margin: 18px 0;">${items}</ul>
      <p>Abra o app para conferir os detalhes e manter sua lista atualizada.</p>
    </div>
  `;
}

function buildEmailText(userName: string, movies: ReminderMovie[]) {
  const movieLines = movies
    .map((movie) => `- ${movie.title} (estreia em ${formatReleaseDate(movie.releaseDate)})`)
    .join('\n');

  return `Olá, ${userName}. O(s) filme(s) abaixo estreia(m) hoje:\n\n${movieLines}\n\nAbra o app para conferir os detalhes.`;
}

export async function sendReleaseReminders() {
  const { start, end } = getReminderDayWindow();

  const movies = await prisma.movie.findMany({
    where: {
      releaseDate: {
        gte: start,
        lt: end,
      },
      releaseReminderSentAt: null,
    },
    select: {
      id: true,
      title: true,
      releaseDate: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!movies.length) {
    return { processedUsers: 0, processedMovies: 0 };
  }

  const grouped = new Map<string, ReminderMovie[]>();

  for (const movie of movies as ReminderMovie[]) {
    const current = grouped.get(movie.user.id) ?? [];
    current.push(movie);
    grouped.set(movie.user.id, current);
  }

  const transporter = createTransport();
  const from = getMailFrom();

  if (!from) {
    throw new Error('MAIL_FROM ou SMTP_USER precisam ser configurados');
  }

  let processedUsers = 0;

  for (const userMovies of grouped.values()) {
    const [firstMovie] = userMovies;

    await transporter.sendMail({
      from,
      to: firstMovie.user.email,
      subject:
        userMovies.length === 1
          ? `Lembrete de estreia: ${firstMovie.title}`
          : 'Lembrete de estreia dos seus filmes',
      text: buildEmailText(firstMovie.user.name, userMovies),
      html: buildEmailHtml(firstMovie.user.name, userMovies),
    });

    await prisma.movie.updateMany({
      where: {
        id: {
          in: userMovies.map((movie) => movie.id),
        },
        releaseReminderSentAt: null,
      },
      data: {
        releaseReminderSentAt: new Date(),
      },
    });

    processedUsers += 1;
  }

  return { processedUsers, processedMovies: movies.length };
}
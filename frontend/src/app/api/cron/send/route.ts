import { NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api';

export const runtime = 'nodejs';

function isVercelCronRequest(request: Request) {
  return request.headers.get('x-vercel-cron') === '1';
}

function isAuthorizedManualRequest(request: Request, cronSecret: string | undefined) {
  const headerSecret = request.headers.get('x-cron-secret');

  return Boolean(cronSecret && headerSecret === cronSecret);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (!isVercelCronRequest(request) && !isAuthorizedManualRequest(request, cronSecret)) {
    return NextResponse.json({ message: 'Cron não autorizado' }, { status: 401 });
  }

  const response = await fetch(buildApiUrl('/cron/release-reminders'), {
    method: 'POST',
    headers: cronSecret ? { 'x-cron-secret': cronSecret } : undefined,
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));

  return NextResponse.json(payload, { status: response.status });
}
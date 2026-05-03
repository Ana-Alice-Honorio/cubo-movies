import { Suspense } from 'react';
import MoviesPageClient from '@/components/movies/MoviesPageClient';

export default function MoviesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full items-center justify-center px-4 py-8">
          <p className="text-muted">Carregando...</p>
        </div>
      }
    >
      <MoviesPageClient />
    </Suspense>
  );
}

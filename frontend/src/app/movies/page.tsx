'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MovieList from '@/components/movies/MovieList';
import CreateMovieModal from '@/components/movies/CreateMovieModal';

export default function MoviesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center">
        <p className="text-muted">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Meus Filmes</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-accent px-6 py-2 font-semibold text-white hover:bg-accent-hover transition-colors"
          >
            + Novo Filme
          </button>
        </div>

        <MovieList key={refreshTrigger} />

        {showCreateModal && (
          <CreateMovieModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        )}
      </div>
    </div>
  );
}

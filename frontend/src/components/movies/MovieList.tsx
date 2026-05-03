'use client';

import { useEffect, useState } from 'react';
import { buildApiUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  description: string;
  genre: string;
  releaseDate: string;
  budget: number;
  durationMinutes: number;
  imageUrl: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
}

interface ListResponse {
  data: Movie[];
  pagination: { limit: number; offset: number; total: number };
}

export default function MovieList() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadMovies() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(buildApiUrl('/movies?limit=20'), {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar filmes');
        }

        const data: ListResponse = await response.json();
          console.log('Movies loaded:', data.data);
          setMovies(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar filmes');
      } finally {
        setIsLoading(false);
      }
    }

    loadMovies();
  }, [user]);

  if (isLoading) {
    return <p className="text-muted">Carregando filmes...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (movies.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border p-12">
        <p className="text-muted">Nenhum filme cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="surface-card overflow-hidden rounded-lg transition-transform hover:scale-105"
        >
          {movie.imageUrl && (
            <img
              src={movie.imageUrl}
              alt={movie.title}
              className="h-64 w-full object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="font-bold text-foreground line-clamp-2">{movie.title}</h3>
            {movie.originalTitle && (
              <p className="text-sm text-muted line-clamp-1">{movie.originalTitle}</p>
            )}
            <p className="mt-2 text-sm text-muted">{movie.genre}</p>
            <p className="text-xs text-muted">
              {movie.durationMinutes}min • {new Date(movie.releaseDate).getFullYear()}
            </p>
            <span
              className={`mt-3 inline-block text-xs font-semibold px-2 py-1 rounded ${
                movie.status === 'PUBLISHED'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}
            >
              {movie.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

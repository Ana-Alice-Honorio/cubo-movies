'use client';

import Image from 'next/image';
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

interface MovieListProps {
  searchQuery?: string;
}

function formatMovieYear(releaseDate: string) {
  return new Date(releaseDate).getFullYear();
}

function getInitials(title: string) {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

function MovieCard({ movie }: { movie: Movie }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(movie.imageUrl) && !imageFailed;
  const initials = getInitials(movie.title);

  return (
    <article className="group overflow-hidden rounded-[16px] border border-white/10 bg-[#17161b]/90 shadow-[0_14px_40px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="relative aspect-[2/3] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.34),rgba(10,10,12,0.94)_58%)]">
        {hasImage ? (
          <img
            src={movie.imageUrl}
            alt={movie.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex h-full w-full flex-col justify-between p-4 text-white/90">
            <div className="flex justify-end">
              <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                Sem poster
              </span>
            </div>

            <div className="flex flex-1 items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-black/30 text-2xl font-bold tracking-widest text-white/95 shadow-lg backdrop-blur-sm">
                {initials || 'CM'}
              </div>
            </div>
          </div>
        )}

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-sm ${
            movie.status === 'PUBLISHED'
              ? 'bg-emerald-400/18 text-emerald-200 ring-1 ring-emerald-300/20'
              : 'bg-amber-400/18 text-amber-200 ring-1 ring-amber-300/20'
          }`}
        >
          {movie.status === 'PUBLISHED' ? 'PUBLICADO' : 'RASCUNHO'}
        </span>
      </div>

      <div className="px-4 py-4 space-y-2">
        <h3 className="text-sm font-bold uppercase leading-tight text-white tracking-tight line-clamp-2">
          {movie.title}
        </h3>
        <p className="text-xs text-muted uppercase tracking-[0.05em]">{movie.genre}</p>
      </div>
    </article>
  );
}

export default function MovieList({ searchQuery = '' }: MovieListProps) {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

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
    return (
      <div className="grid grid-cols-2 gap-5 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-[20px] border border-white/10 bg-white/5"
          >
            <div className="aspect-[2/3] bg-white/10" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 rounded-full bg-white/10" />
              <div className="h-3 w-1/2 rounded-full bg-white/10" />
              <div className="h-3 w-full rounded-full bg-white/10" />
              <div className="h-3 w-5/6 rounded-full bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[20px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {error}
      </div>
    );
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredMovies = normalizedQuery
    ? movies.filter((movie) => {
        return [movie.title, movie.originalTitle, movie.genre, movie.description]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      })
    : movies;

  if (filteredMovies.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-[24px] border border-white/10 bg-black/20 p-12 text-center backdrop-blur-sm">
        <div className="max-w-md space-y-2">
          <p className="text-lg font-semibold text-foreground">
            {normalizedQuery ? 'Nenhum filme encontrado' : 'Nenhum filme cadastrado ainda'}
          </p>
          <p className="text-sm text-muted">
            {normalizedQuery
              ? 'Tente pesquisar por outro título, gênero ou descrição.'
              : 'Adicione o primeiro filme para começar sua coleção.'}
          </p>
        </div>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMovies = filteredMovies.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-5 xl:grid-cols-5">
        {paginatedMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-[2px] bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-white/10 active:bg-accent"
          >
            <Image
              src="/svgs/Expand_left.svg"
              alt="Página anterior"
              width={20}
              height={20}
              style={{ filter: "invert(1)" }}
            />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={currentPage === pageNum}
                  className={currentPage === pageNum ? 'flex h-[44px] min-w-[44px] items-center justify-center rounded-[2px] text-sm font-semibold transition-all bg-accent text-white disabled:opacity-60 disabled:cursor-not-allowed' : 'flex h-[44px] min-w-[44px] items-center justify-center rounded-[2px] text-sm font-semibold transition-all bg-accent text-white cursor-pointer hover:brightness-110'}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-[2px] bg-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:brightness-110"
          >
            <Image
              src="/svgs/Expand_right.svg"
              alt="Próxima página"
              width={20}
              height={20}
              style={{ filter: "invert(1)" }}
            />
          </button>
        </div>
      )}
    </div>
  );
}


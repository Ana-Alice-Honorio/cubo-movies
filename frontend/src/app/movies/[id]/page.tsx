'use client';

import CreateMovieModal from '@/components/movies/CreateMovieModal';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { buildApiUrl, parseApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface MovieDetail {
  id: string;
  title: string;
  originalTitle: string | null;
  description: string;
  genre: string;
  releaseDate: string;
  budget: number;
  durationMinutes: number;
  imageUrl: string;
  trailerLink?: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (!hours) {
    return `${mins} min`;
  }

  if (!mins) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

function calculateCompleteness(movie: MovieDetail) {
  const fields = [
    movie.title,
    movie.originalTitle,
    movie.description,
    movie.genre,
    movie.releaseDate,
    movie.budget,
    movie.durationMinutes,
    movie.imageUrl,
    movie.trailerLink,
  ];

  const filledCount = fields.filter((value) => {
    if (typeof value === 'number') {
      return value > 0;
    }

    return Boolean(value);
  }).length;

  return Math.round((filledCount / fields.length) * 100);
}

function getTrailerEmbedUrl(title: string) {
  const query = encodeURIComponent(`${title} trailer oficial`);
  return `https://www.youtube-nocookie.com/embed?listType=search&list=${query}`;
}

function youtubeToEmbed(url?: string | null) {
  if (!url) return null;

  try {
    // common patterns: youtu.be/<id>, youtube.com/watch?v=<id>, /embed/<id>
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }

    if (u.hostname.includes('youtube.com')) {
      // handle /watch?v= or /embed/
      if (u.pathname.startsWith('/watch')) {
        const id = u.searchParams.get('v');
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }

      const parts = u.pathname.split('/');
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return `https://www.youtube-nocookie.com/embed/${parts[embedIndex + 1]}`;
      }
    }
  } catch {
    // not a full URL - maybe just an id
    const cleaned = url.replace(/[^0-9A-Za-z_-]/g, '');
    if (cleaned.length >= 5) {
      return `https://www.youtube-nocookie.com/embed/${cleaned}`;
    }
  }

  return null;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

export default function MovieDetailsPage() {
  const params = useParams<{ id: string }>();
  const movieId = params?.id;
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user || !movieId) {
      return;
    }

    const controller = new AbortController();

    async function loadMovie() {
      setIsFetching(true);
      setError(null);

      try {
        const response = await fetch(buildApiUrl(`/movies/${movieId}`), {
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }

        const data: MovieDetail = await response.json();
        setMovie(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes do filme');
      } finally {
        if (!controller.signal.aborted) {
          setIsFetching(false);
        }
      }
    }

    void loadMovie();

    return () => controller.abort();
  }, [movieId, user]);

  const genres = useMemo(() => {
    if (!movie?.genre) {
      return [];
    }

    return movie.genre
      .split(/[,/|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }, [movie]);

  if (isLoading || (user && isFetching)) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-6">
        <div className="animate-pulse space-y-5">
          <div className="h-10 w-2/5 rounded-md bg-white/10" />
          <div className="h-[520px] rounded-[18px] bg-white/5" />
          <div className="h-10 w-1/3 rounded-md bg-white/10" />
          <div className="h-[280px] rounded-[18px] bg-white/5" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !movie) {
    return (
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center px-4 py-12 md:px-6">
        <div className="w-full max-w-lg rounded-[20px] border border-red-500/30 bg-red-500/10 px-6 py-5 text-center">
          <p className="text-lg font-semibold text-red-200">Não foi possível carregar este filme</p>
          <p className="mt-2 text-sm text-red-100/80">{error || 'Verifique se o filme existe e tente novamente.'}</p>
          <Link
            href="/movies"
            className="mt-5 inline-flex h-[42px] items-center justify-center rounded-[8px] bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
          >
            Voltar para listagem
          </Link>
        </div>
      </div>
    );
  }

  const completeness = calculateCompleteness(movie);
  const releaseYear = new Date(movie.releaseDate).getFullYear();
  // Prefer explicit trailerLink if provided, otherwise fallback to search-based embed
  const explicitEmbed = youtubeToEmbed(movie.trailerLink ?? null);
  const trailerUrl = explicitEmbed ?? getTrailerEmbedUrl(movie.title);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!movie) return;
    setIsDeleting(true);
    setShowConfirm(false);

    try {
      const response = await fetch(buildApiUrl(`/movies/${movie.id}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      router.push('/movies');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erro ao excluir filme');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full px-4 py-6 md:px-6 md:py-8">
      <section className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-[18px] border border-white/10 bg-[#121115]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(10,10,12,0.92) 0%, rgba(10,10,12,0.7) 44%, rgba(10,10,12,0.8) 100%), url('${movie.imageUrl}')`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(201,173,67,0.3),transparent_45%)]" />

        <div className="relative z-10 p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{movie.title}</h1>
              <p className="mt-1 text-lg text-white/80">
                Título original: {movie.originalTitle || movie.title}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/movies"
                className="inline-flex h-[44px] items-center justify-center rounded-[2px] bg-white/10 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Voltar
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ backgroundColor: "#B744F714" }}
                className="inline-flex h-[44px] items-center justify-center rounded-[2px] px-6 text-sm cursor-pointer font-semibold text-red-100 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Excluindo...' : 'Deletar'}
              </button>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="inline-flex h-[44px] items-center cursor-pointer justify-center rounded-[2px] bg-[#8E4EC6] px-6 text-sm font-semibold text-white transition-colors hover:brightness-110"
              >
                Editar
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="grid gap-6 md:grid-cols-12 items-start">
              <div className="md:col-span-4 flex justify-center md:justify-start">
                <div className="w-full max-w-[330px]">
                  {movie.imageUrl ? (
                    <img
                      src={movie.imageUrl}
                      alt={movie.title}
                      className="aspect-[2/3] w-full rounded-[8px] object-cover shadow-lg"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] items-center justify-center rounded-[8px] bg-black/30 text-2xl font-bold text-white/70">
                      {movie.title.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

                <div className="md:col-span-8 space-y-5 lg:max-w-[840px]">
                  <p className="text-xl italic leading-tight text-white/90 md:text-2xl">Todo heroi tem um comeco.</p>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoCard label="Lançamento" value={`${formatDate(movie.releaseDate)}`} />
                  <InfoCard label="Duração" value={formatDuration(movie.durationMinutes)} />
                  <InfoCard label="Situação" value={movie.status === 'PUBLISHED' ? 'Lançado' : 'Não lançado'} />
                  <InfoCard label="Ano" value={String(releaseYear)} />
                  <InfoCard label="Orçamento" value={formatCurrency(movie.budget)} />
                  <InfoCard label="Atualizado em" value={formatDate(movie.updatedAt)} />
                </div>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),200px]">
                    <article className="rounded-[10px] border border-white/10 bg-black/30 p-5 backdrop-blur-sm">
                    <h2 className="text-2xl font-semibold text-white">Sinopse</h2>
                    <p className="mt-3 text-base leading-7 text-white/85 md:text-lg md:leading-8">{movie.description}</p>

                    <div className="mt-5">
                      <h3 className="text-lg font-semibold text-white/90">Generos</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {genres.length > 0 ? (
                          genres.map((genre) => (
                            <span
                              key={genre}
                              className="rounded-[4px] bg-[#57316f]/95 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white"
                            >
                              {genre}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-white/60">Genero nao informado</span>
                        )}
                      </div>
                    </div>
                  </article>

                  <article className="flex flex-col items-center justify-center rounded-[10px] border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/65">
                      Completude dos dados
                    </p>
                    <div
                      className="mt-4 grid h-[120px] w-[120px] place-items-center rounded-full"
                      style={{
                        background: `conic-gradient(#FFE600 ${completeness}%, rgba(255,255,255,0.15) ${completeness}% 100%)`,
                      }}
                    >
                      <div className="grid h-[100px] w-[100px] place-items-center rounded-full bg-[#18171d] text-3xl font-bold text-[#FFE600]">
                        {completeness}%
                      </div>
                    </div>
                    <p className="mt-4 text-center text-xs text-white/60">
                      Indicador interno baseado nos campos preenchidos deste cadastro.
                    </p>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-7 w-full max-w-[1280px]">
        <h2 className="text-4xl font-bold text-white">Trailer</h2>
        <div className="mt-4 overflow-hidden rounded-[14px] border border-white/10 bg-black/40 shadow-[0_16px_38px_rgba(0,0,0,0.35)]">
          <iframe
            src={trailerUrl}
            title={`Trailer de ${movie.title}`}
            className="aspect-video w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </section>

      {showEditModal && movie && (
        <CreateMovieModal
          movie={movie}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updatedMovie) => {
            if (updatedMovie) {
              setMovie(updatedMovie);
            }

            setShowEditModal(false);
          }}
        />
      )}
      <ConfirmDialog
        open={showConfirm}
        title={`Excluir "${movie?.title ?? ''}"?`}
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

'use client';

import Image from 'next/image';
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
  const [searchQuery, setSearchQuery] = useState('');

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
      <div className="flex flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
          <label className="flex h-[44px] w-full max-w-[520px] items-center gap-3 rounded-[12px] border bg-white/5 px-4 text-muted transition-colors focus-within:border-white/20 focus-within:bg-white/10">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Pesquise por filmes"
              className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted/80"
            />
              <Image
              src="/svgs/Search_alt_fill.svg"
              alt="Pesquisar"
              width={18}
              height={18}
              className="shrink-0 opacity-80"
              style={{ filter: "invert(1)" }}
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
            <button
              type="button"
              className="h-[44px] min-w-[92px] rounded-[2px] px-5 py-3 font-semibold text-white transition-colors cursor-pointer"
              style={{
                backgroundColor: '#B744F714',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C150FF2E')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#B744F714')}
            >
              Filtros
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[44px] min-w-[156px] rounded-[2px] px-5 py-3 font-semibold text-white transition-colors cursor-pointer"
              style={{
                backgroundColor: '#8E4EC6',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9A5CD0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8E4EC6')}
              onMouseDown={(e) => (e.currentTarget.style.backgroundColor = '#8457AA')}
            >
              Adicionar Filme
            </button>
          </div>
          </div>

        <MovieList key={refreshTrigger} searchQuery={searchQuery} />

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

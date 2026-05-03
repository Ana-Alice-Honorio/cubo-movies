'use client';

import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import MovieList from '@/components/movies/MovieList';
import CreateMovieModal from '@/components/movies/CreateMovieModal';
import MoviesFilterModal from '@/components/movies/MoviesFilterModal';
import { defaultMovieFilters, hasActiveMovieFilters, type MovieFilters } from '@/components/movies/movieFilters';

function parsePositiveInteger(value: string | null) {
  const parsedValue = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 1;
}

function readFiltersFromSearchParams(searchParams: URLSearchParams): MovieFilters {
  const status = searchParams.get('status');

  return {
    genre: searchParams.get('genre') ?? '',
    releaseDateFrom: searchParams.get('releaseDateFrom') ?? '',
    releaseDateTo: searchParams.get('releaseDateTo') ?? '',
    status: status === 'DRAFT' || status === 'PUBLISHED' ? status : 'ALL',
  };
}

function areFiltersEqual(a: MovieFilters, b: MovieFilters) {
  return (
    a.genre === b.genre &&
    a.releaseDateFrom === b.releaseDateFrom &&
    a.releaseDateTo === b.releaseDateTo &&
    a.status === b.status
  );
}

function buildMovieUrl(pathname: string, params: URLSearchParams) {
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function buildSearchParams({
  searchQuery,
  currentPage,
  filters,
}: {
  searchQuery: string;
  currentPage: number;
  filters: MovieFilters;
}) {
  const params = new URLSearchParams();

  const normalizedSearch = searchQuery.trim();
  if (normalizedSearch) {
    params.set('q', normalizedSearch);
  }

  if (currentPage > 1) {
    params.set('page', String(currentPage));
  }

  if (filters.genre.trim()) {
    params.set('genre', filters.genre.trim());
  }

  if (filters.releaseDateFrom) {
    params.set('releaseDateFrom', filters.releaseDateFrom);
  }

  if (filters.releaseDateTo) {
    params.set('releaseDateTo', filters.releaseDateTo);
  }

  if (filters.status !== 'ALL') {
    params.set('status', filters.status);
  }

  return params;
}

export default function MoviesPageClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const searchParamsSnapshot = new URLSearchParams(searchParamsString);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState(() => searchParamsSnapshot.get('q') ?? '');
  const [currentPage, setCurrentPage] = useState(() => parsePositiveInteger(searchParamsSnapshot.get('page')));
  const [filters, setFilters] = useState<MovieFilters>(() => readFiltersFromSearchParams(searchParamsSnapshot));

  const hasActiveFilters = hasActiveMovieFilters(filters);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const nextSearchQuery = searchParamsSnapshot.get('q') ?? '';
    const nextCurrentPage = parsePositiveInteger(searchParamsSnapshot.get('page'));
    const nextFilters = readFiltersFromSearchParams(searchParamsSnapshot);

    if (nextSearchQuery !== searchQuery) {
      setSearchQuery(nextSearchQuery);
    }

    if (nextCurrentPage !== currentPage) {
      setCurrentPage(nextCurrentPage);
    }

    if (!areFiltersEqual(nextFilters, filters)) {
      setFilters(nextFilters);
    }
  }, [searchParamsString]);

  const pushMovieUrl = (nextSearchQuery: string, nextCurrentPage: number, nextFilters: MovieFilters) => {
    const nextParams = buildSearchParams({
      searchQuery: nextSearchQuery,
      currentPage: nextCurrentPage,
      filters: nextFilters,
    });

    router.replace(buildMovieUrl(pathname, nextParams), { scroll: false });
  };

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
              onChange={(event) => {
                const nextSearchQuery = event.target.value;
                const nextCurrentPage = 1;

                setSearchQuery(nextSearchQuery);
                setCurrentPage(nextCurrentPage);
                pushMovieUrl(nextSearchQuery, nextCurrentPage, filters);
              }}
              placeholder="Pesquise por filmes"
              className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted/80"
            />
            <Image
              src="/svgs/Search_alt_fill.svg"
              alt="Pesquisar"
              width={18}
              height={18}
              className="shrink-0 opacity-80"
              style={{ filter: 'invert(1)' }}
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
            <button
              type="button"
              onClick={() => setShowFiltersModal(true)}
              className="h-[44px] min-w-[92px] rounded-[2px] px-5 py-3 font-semibold text-white transition-colors cursor-pointer"
              style={{
                backgroundColor: '#B744F714',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C150FF2E')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#B744F714')}
            >
              Filtros
              {hasActiveFilters ? (
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-white align-middle" aria-hidden="true" />
              ) : null}
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

        <MovieList
          key={refreshTrigger}
          searchQuery={searchQuery}
          currentPage={currentPage}
          filters={filters}
          onPageChange={(page) => {
            setCurrentPage(page);
            pushMovieUrl(searchQuery, page, filters);
          }}
        />

        <MoviesFilterModal
          open={showFiltersModal}
          filters={filters}
          onClose={() => setShowFiltersModal(false)}
          onApply={(nextFilters) => {
            setFilters(nextFilters);
            setCurrentPage(1);
            setShowFiltersModal(false);
            pushMovieUrl(searchQuery, 1, nextFilters);
          }}
          onClear={() => {
            setFilters(defaultMovieFilters);
            setCurrentPage(1);
            setShowFiltersModal(false);
            pushMovieUrl(searchQuery, 1, defaultMovieFilters);
          }}
        />

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
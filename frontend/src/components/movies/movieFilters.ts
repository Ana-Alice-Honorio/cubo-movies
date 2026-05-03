export type MovieStatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED';

export interface MovieFilters {
  genre: string;
  releaseDateFrom: string;
  releaseDateTo: string;
  status: MovieStatusFilter;
}

export const defaultMovieFilters: MovieFilters = {
  genre: '',
  releaseDateFrom: '',
  releaseDateTo: '',
  status: 'ALL',
};

export function hasActiveMovieFilters(filters: MovieFilters) {
  return Boolean(
    filters.genre ||
      filters.releaseDateFrom ||
      filters.releaseDateTo ||
      filters.status !== 'ALL'
  );
}
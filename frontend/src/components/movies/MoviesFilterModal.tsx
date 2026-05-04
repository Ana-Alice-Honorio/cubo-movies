'use client';

import { useEffect, useState } from 'react';
import { defaultMovieFilters, type MovieFilters } from './movieFilters';

const GENRE_OPTIONS = [
  { label: 'Ação', value: 'Ação' },
  { label: 'Aventura', value: 'Aventura' },
  { label: 'Animação', value: 'Animação' },
  { label: 'Biografia', value: 'Biografia' },
  { label: 'Comédia', value: 'Comédia' },
  { label: 'Crime', value: 'Crime' },
  { label: 'Documentário', value: 'Documentário' },
  { label: 'Drama', value: 'Drama' },
  { label: 'Família', value: 'Família' },
  { label: 'Fantasia', value: 'Fantasia' },
  { label: 'Ficção científica', value: 'Ficção científica' },
  { label: 'Guerra', value: 'Guerra' },
  { label: 'História', value: 'História' },
  { label: 'Mistério', value: 'Mistério' },
  { label: 'Musical', value: 'Musical' },
  { label: 'Romance', value: 'Romance' },
  { label: 'Suspense', value: 'Suspense' },
  { label: 'Terror', value: 'Terror' },
  { label: 'Outro', value: 'Outro' },
] as const;

interface MoviesFilterModalProps {
  open: boolean;
  filters: MovieFilters;
  onClose: () => void;
  onApply: (filters: MovieFilters) => void;
  onClear: () => void;
}

export default function MoviesFilterModal({ open, filters, onClose, onApply, onClear }: MoviesFilterModalProps) {
  const [formData, setFormData] = useState<MovieFilters>(filters);

  useEffect(() => {
    if (open) {
      setFormData(filters);
    }
  }, [filters, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const updateField = (name: keyof MovieFilters, value: string) => {
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply(formData);
  };

  const handleClear = () => {
    setFormData(defaultMovieFilters);
    onClear();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/10 bg-[#0f0e13] shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">Filtragem</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">Refinar resultados</h3>
          <p className="mt-2 text-sm text-white/65">
            Use gênero, período de lançamento e status para afinar a lista de filmes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-white/80">Tipo / gênero</span>
              <select
                value={formData.genre}
                onChange={(event) => updateField('genre', event.target.value)}
                className="h-[44px] w-full rounded-[12px] border border-white/10 bg-[#1a1a1f] px-4 text-sm text-white outline-none transition-colors focus:border-white/20 focus:bg-[#242429]"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">Todos</option>
                {GENRE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-white/80">Data de início</span>
              <input
                type="date"
                value={formData.releaseDateFrom}
                onChange={(event) => updateField('releaseDateFrom', event.target.value)}
                className="h-[44px] w-full rounded-[12px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-colors focus:border-white/20 focus:bg-white/8"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-white/80">Data de fim</span>
              <input
                type="date"
                value={formData.releaseDateTo}
                onChange={(event) => updateField('releaseDateTo', event.target.value)}
                className="h-[44px] w-full rounded-[12px] border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-colors focus:border-white/20 focus:bg-white/8"
              />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-medium text-white/80">Status</span>
            <select
              value={formData.status}
              onChange={(event) => updateField('status', event.target.value)}
              className="h-[44px] w-full rounded-[12px] border border-white/10 bg-[#1a1a1f] px-4 text-sm text-white outline-none transition-colors focus:border-white/20 focus:bg-[#242429]"
              style={{ colorScheme: 'dark' }}
            >
              <option value="ALL">Todos</option>
              <option value="PUBLISHED">Lançado</option>
              <option value="DRAFT">Não lançado</option>
            </select>
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="h-[44px] rounded-[2px] border border-white/10 px-5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/5 cursor-pointer"
            >
              Limpar filtros
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-[44px] rounded-[2px] border border-white/10 px-5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/5 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-[44px] rounded-[2px] bg-[#8E4EC6] px-5 text-sm font-semibold text-white transition-colors hover:brightness-110 cursor-pointer"
            >
              Aplicar filtros
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
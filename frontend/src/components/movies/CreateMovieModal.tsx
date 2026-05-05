'use client';

import { useRef, useState } from 'react';
import { buildApiUrl } from '@/lib/api';
import { Button, Input } from '@/components/ui';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface MovieFormMovie {
  id: string;
  title: string;
  originalTitle: string | null;
  description: string;
  genre: string;
  releaseDate: string;
  budget: number;
  durationMinutes: number;
  trailerLink?: string | null;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'PUBLISHED';
}

interface CreateMovieModalProps {
  onClose: () => void;
  onSuccess: (movie?: MovieFormMovie) => void;
  movie?: MovieFormMovie;
}

function toDateInputValue(value?: string) {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

function getInitialFormData(movie?: MovieFormMovie) {
  return {
    title: movie?.title ?? '',
    originalTitle: movie?.originalTitle ?? '',
    description: movie?.description ?? '',
    genre: movie?.genre ?? '',
    releaseDate: toDateInputValue(movie?.releaseDate),
    budget: movie?.budget ? String(movie.budget) : '',
    durationMinutes: movie?.durationMinutes ? String(movie.durationMinutes) : '',
    trailerLink: movie?.trailerLink ?? '',
    status: movie?.status ?? ('DRAFT' as 'DRAFT' | 'PUBLISHED'),
  };
}

export default function CreateMovieModal({ onClose, onSuccess, movie }: CreateMovieModalProps) {
  const isEditMode = Boolean(movie);
  const [formData, setFormData] = useState(() => getInitialFormData(movie));

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione uma imagem válida');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const saveMovieImage = async (movieId: string) => {
    if (!selectedFile) {
      return null;
    }

    const presignedResponse = await fetch(buildApiUrl('/movies/upload-url'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
      }),
    });

    if (!presignedResponse.ok) {
      throw new Error('Erro ao gerar URL de upload');
    }

    const { url, key } = await presignedResponse.json();
    setUploadProgress(60);

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': selectedFile.type },
      body: selectedFile,
    });

    if (!uploadResponse.ok) {
      throw new Error('Erro ao fazer upload da imagem');
    }

    setUploadProgress(80);

    const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'cubos-movies-files-bucket'}.s3.amazonaws.com/${key}`;

    const imageUpdateResponse = await fetch(buildApiUrl(`/movies/${movieId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        imageUrl,
        imageKey: key,
      }),
    });

    if (!imageUpdateResponse.ok) {
      throw new Error('Erro ao atualizar imagem do filme');
    }

    setUploadProgress(100);
    return (await imageUpdateResponse.json()) as MovieFormMovie;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);

    try {
      const [year, month, day] = formData.releaseDate.split('-').map(Number);
      const releaseDateIso = new Date(year, month - 1, day).toISOString();

      const payload = {
        title: formData.title,
        originalTitle: formData.originalTitle,
        description: formData.description,
        genre: formData.genre,
        releaseDate: releaseDateIso,
        budget: parseInt(formData.budget),
        durationMinutes: parseInt(formData.durationMinutes),
        status: formData.status,
        trailerLink: formData.trailerLink || undefined,
      };

      const response = isEditMode
        ? await fetch(buildApiUrl(`/movies/${movie?.id}`), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
          })
        : await fetch(buildApiUrl('/movies'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || (isEditMode ? 'Erro ao atualizar filme' : 'Erro ao criar filme'));
      }

      let savedMovie = (await response.json()) as MovieFormMovie;
      setUploadProgress(50);

      if (selectedFile) {
        try {
          const imageMovie = await saveMovieImage(savedMovie.id);
          if (imageMovie) {
            savedMovie = imageMovie;
          }
        } catch (uploadError) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
        }
      }

      onSuccess(savedMovie);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!movie?.id) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setShowConfirmDelete(false);

    try {
      const response = await fetch(buildApiUrl(`/movies/${movie.id}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Erro ao excluir filme');
      }

      onClose();
      onSuccess(undefined);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erro inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="surface-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{isEditMode ? 'Editar Filme' : 'Novo Filme'}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Título"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            <Input
              label="Título Original"
              name="originalTitle"
              value={formData.originalTitle}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full h-24 px-3 py-2 rounded border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Gênero"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            <Input
              label="Data de Lançamento"
              name="releaseDate"
              type="date"
              value={formData.releaseDate}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Orçamento ($)"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            <Input
              label="Duração (minutos)"
              name="durationMinutes"
              type="number"
              value={formData.durationMinutes}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Input
              label="Trailer (YouTube URL ou ID)"
              name="trailerLink"
              type="url"
              value={formData.trailerLink}
              onChange={handleChange}
              placeholder="https://youtu.be/xxxxx or video id"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Imagem
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-accent file:text-white hover:file:bg-accent-hover"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-accent">{selectedFile.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 rounded border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
            >
              <option value="DRAFT">Não lançado</option>
              <option value="PUBLISHED">Lançado</option>
            </select>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted">
                <span>Enviando...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 rounded bg-border overflow-hidden">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="mr-auto rounded border border-red-500/40 px-4 py-2 text-red-200 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Excluir
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded border border-border text-foreground hover:bg-surface-hover disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              variant="primary"
              isDisabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Enviando...' : isEditMode ? 'Salvar Alterações' : 'Criar Filme'}
            </Button>
          </div>
        </form>
        <ConfirmDialog
          open={showConfirmDelete}
          title={`Excluir "${movie?.title ?? ''}"?`}
          description="Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          loading={isSubmitting}
          onConfirm={confirmDeleteAction}
          onCancel={() => setShowConfirmDelete(false)}
        />
      </div>
    </div>
  );
}

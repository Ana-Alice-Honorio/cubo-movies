'use client';

import { useState, useRef } from 'react';
import { buildApiUrl } from '@/lib/api';
import { Button, Input } from '@/components/ui';

interface CreateMovieModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMovieModal({ onClose, onSuccess }: CreateMovieModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    originalTitle: '',
    description: '',
    genre: '',
    releaseDate: '',
    budget: '',
    durationMinutes: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);

    let movieCreated = false;

    try {
      // 1. Create movie without image
      const createResponse = await fetch(buildApiUrl('/movies'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          originalTitle: formData.originalTitle,
          description: formData.description,
          genre: formData.genre,
          releaseDate: new Date(formData.releaseDate).toISOString(),
          budget: parseInt(formData.budget),
          durationMinutes: parseInt(formData.durationMinutes),
          status: formData.status,
        }),
      });

      if (!createResponse.ok) {
        const data = await createResponse.json();
        throw new Error(data.message || 'Erro ao criar filme');
      }

      const movie = await createResponse.json();
      movieCreated = true;
      setUploadProgress(50);

      // 2. Upload image if provided
      if (selectedFile) {
        try {
          // 2a. Get presigned URL
          const presignedResponse = await fetch(
            buildApiUrl('/movies/upload-url'),
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                fileName: selectedFile.name,
                mimeType: selectedFile.type,
              }),
            }
          );

          if (!presignedResponse.ok) {
            throw new Error('Erro ao gerar URL de upload');
          }

          const { url, key } = await presignedResponse.json();
          setUploadProgress(60);

          // 2b. Upload to S3
          const uploadResponse = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': selectedFile.type },
            body: selectedFile,
          });

          if (!uploadResponse.ok) {
            throw new Error('Erro ao fazer upload da imagem');
          }

          setUploadProgress(80);

          // 2c. Update movie with image URL and key
          const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'cubos-movies-files-bucket'}.s3.amazonaws.com/${key}`;

          const updateResponse = await fetch(
            buildApiUrl(`/movies/${movie.id}`),
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                imageUrl,
                imageKey: key,
              }),
            }
          );

          if (!updateResponse.ok) {
            throw new Error('Erro ao atualizar imagem do filme');
          }

          setUploadProgress(100);
        } catch (uploadError) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
          // Não interrompe - filme foi criado, imagem é opcional
        }
      }

      onSuccess();
    } catch (err) {
      // Se filme foi criado, considera como sucesso mesmo com erro de imagem
      if (movieCreated) {
        onSuccess();
      } else {
        setError(err instanceof Error ? err.message : 'Erro inesperado');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="surface-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Novo Filme</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground"
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
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicado</option>
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
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded border border-border text-foreground hover:bg-surface-hover disabled:opacity-50"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              variant="primary"
              isDisabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Enviando...' : 'Criar Filme'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

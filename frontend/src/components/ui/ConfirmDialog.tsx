'use client';

import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = 'Confirmar',
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0" onClick={onCancel} style={{ backgroundColor: 'var(--overlay)' }} />

      <div className="relative z-10 w-full max-w-sm rounded-lg border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--foreground)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h3>
        {description && <p className="mt-2 text-sm" style={{ color: 'var(--foreground)', opacity: 0.7 }}>{description}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded px-4 py-2 text-sm cursor-pointer disabled:opacity-50"
            style={{ color: 'var(--foreground)', background: 'transparent' }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-60"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            {loading ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

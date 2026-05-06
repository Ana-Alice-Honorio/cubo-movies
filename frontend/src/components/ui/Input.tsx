import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full h-[44px] min-h-[44px] px-3 py-3
          rounded-[4px] border border-border border-[1px]
          bg-surface text-foreground
          placeholder-muted
          cursor-text
          transition-colors
          focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
          disabled:bg-surface-hover disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

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
          rounded-[4px] border border-[#3C393F] border-[1px]
          bg-[#1A191B] text-white
          placeholder-muted
          transition-colors
          focus:outline-none focus:border-[#8E4EC6] focus:ring-1 focus:ring-[#8E4EC6]
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

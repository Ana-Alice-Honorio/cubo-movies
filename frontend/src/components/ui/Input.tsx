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
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full h-[44px] min-h-[44px] px-3 py-3
          rounded-[4px] border border-[#3C393F]
          bg-[#1A191B] text-white
          placeholder-gray-500
          transition-colors
          focus:outline-none focus:border-[#8E4EC6] focus:ring-1 focus:ring-[#8E4EC6]
          disabled:bg-gray-700 disabled:cursor-not-allowed
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

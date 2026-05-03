import React from 'react';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonState = 'default' | 'hover' | 'active' | 'disabled';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isDisabled?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  isDisabled = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'min-h-[44px] px-5 py-3 rounded-[2px] font-inter font-bold transition-colors';

  const primaryStyles = isDisabled
    ? 'bg-[#6F6D78] text-white cursor-not-allowed'
    : 'bg-[#8E4EC6] text-white hover:bg-[#9A5CD0] active:bg-[#8457AA]';

  const secondaryStyles = isDisabled
    ? 'bg-[#EBEAF814] text-white cursor-not-allowed'
    : 'bg-[#B744F714] backdrop-blur-[4px] text-white hover:bg-[#C150FF2E] active:bg-[#B412F90A]';

  const variantStyles = variant === 'primary' ? primaryStyles : secondaryStyles;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

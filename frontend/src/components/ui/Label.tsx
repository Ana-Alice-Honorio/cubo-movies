import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ children, ...props }: LabelProps) {
  return (
    <label
      className="block text-sm font-medium text-gray-300 mb-2"
      {...props}
    >
      {children}
    </label>
  );
}

'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed tracking-tight';

  const variantStyles = {
    primary: 'bg-[#3B82F6] text-white hover:bg-[#2563EB] focus-visible:ring-[#BFDBFE] shadow-e1',
    secondary: 'bg-white text-[#374151] border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] focus-visible:ring-[#374151]',
    danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus-visible:ring-[#DC2626]',
    ghost: 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] focus-visible:ring-[#374151]',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[36px] min-w-[36px]',
    md: 'px-4 py-2 text-sm min-h-[40px] min-w-[40px]',
    lg: 'px-6 py-3 text-sm min-h-[44px] min-w-[44px]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Saving...
        </>
      ) : (
        children
      )}
    </button>
  );
}

'use client'

import React from 'react';
import Link from 'next/link';

interface FarmlyButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const FarmlyButton: React.FC<FarmlyButtonProps> = ({
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  children,
  icon,
  className = '',
  disabled = false
}) => {
  const baseClasses = variant === 'primary' ? 'primary-button' : 'secondary-button';
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  
  const content = (
    <>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </>
  );
  
  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  
  return (
    <button 
      onClick={onClick} 
      className={classes}
      disabled={disabled}
    >
      {content}
    </button>
  );
};
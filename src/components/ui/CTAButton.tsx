import React from 'react';
import { motion } from 'motion/react';

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  rounded?: 'full' | 'xl' | 'lg' | 'md' | 'sm' | 'none';
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  rounded = 'xl',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase font-sans tracking-wider transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:opacity-50 disabled:pointer-events-none relative group cursor-pointer';
  
  const sizeStyles = {
    xs: 'px-3 py-1 text-[10px] gap-1',
    sm: 'px-4 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-xs gap-2',
    lg: 'px-7 py-3 text-sm gap-2.5'
  };

  const roundedStyles = {
    full: 'rounded-full',
    xl: 'rounded-xl',
    lg: 'rounded-lg',
    md: 'rounded-md',
    sm: 'rounded',
    none: 'rounded-none'
  };

  const variantStyles = {
    primary: 'bg-brand hover:brightness-105 hover:bg-brand text-black shadow-[0_0_15px_rgba(0,255,65,0.3)] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] border-none',
    secondary: 'bg-zinc-950 hover:bg-brand/10 text-brand border border-brand/30 hover:border-brand',
    ghost: 'bg-transparent hover:bg-brand/5 text-muted hover:text-brand border border-transparent',
    danger: 'bg-crisis hover:brightness-105 hover:bg-crisis text-black shadow-[0_0_15px_rgba(255,62,62,0.3)] hover:shadow-[0_0_20px_rgba(255,62,62,0.5)] border-none'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${sizeStyles[size]} ${roundedStyles[rounded]} ${variantStyles[variant]} ${className}`}
      data-variant={variant}
      {...props}
    >
      {/* Shimmer overlay for primary */}
      {variant === 'primary' && (
        <span className="absolute inset-0 w-full h-full rounded-[inherit] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      )}

      {icon && <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

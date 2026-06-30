import React from 'react';
import { motion } from 'motion/react';

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:pointer-events-none relative group cursor-pointer';
  
  const sizeStyles = {
    sm: 'px-4 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-white text-zinc-950 font-semibold shadow-[0_15px_40px_rgba(59,130,246,0.2)] hover:bg-zinc-100',
    secondary: 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 backdrop-blur-md',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent',
    danger: 'bg-red-950/30 text-red-200 border border-red-500/20 hover:bg-red-950/50'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Primary variant hover glow */}
      {variant === 'primary' && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 rounded-full -z-10" />
      )}

      {/* Shimmer overlay for primary */}
      {variant === 'primary' && (
        <span className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      )}

      {icon && <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

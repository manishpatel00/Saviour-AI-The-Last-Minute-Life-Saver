import React from 'react';
import { motion } from 'motion/react';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr ${className}`}>
      {children}
    </div>
  );
};

interface BentoCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  iconBgColor?: string; // e.g. bg-blue-500/10 text-blue-400
  badge?: string;
  accentBorder?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  title,
  description,
  children,
  className = '',
  icon,
  iconBgColor = 'bg-white/5 text-slate-400',
  badge,
  accentBorder = false
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border bg-white/[0.03] backdrop-blur-md p-6 flex flex-col justify-between transition-colors duration-300 relative overflow-hidden ${
        accentBorder 
          ? 'border-amber-500/30 shadow-lg shadow-amber-500/5 hover:border-amber-500/50' 
          : 'border-white/10 hover:border-white/20'
      } ${className}`}
    >
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-white/[0.01] to-transparent pointer-events-none -z-10" />

      {/* Top section: Icon and Title */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`p-2.5 rounded-xl flex items-center justify-center ${iconBgColor}`}>
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-sans font-semibold text-slate-100 text-sm tracking-tight">{title}</h3>
              {description && (
                <p className="text-xs text-slate-400/80 tracking-wide mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {badge && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
              {badge}
            </span>
          )}
        </div>

        {/* Card Content */}
        <div className="text-slate-200 text-sm w-full h-full flex flex-col justify-center">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'motion/react';

interface ListRowProps {
  id: string;
  icon?: React.ReactNode;
  iconBg?: string; // e.g. bg-red-500/10 text-red-400
  title: string;
  subtitle?: string;
  timestamp?: string;
  tags?: string[];
  isActive?: boolean;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
}

export const ListRow: React.FC<ListRowProps> = ({
  id,
  icon,
  iconBg = 'bg-white/5 text-slate-400',
  title,
  subtitle,
  timestamp,
  tags = [],
  isActive = false,
  onClick,
  rightElement,
  children
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ x: 2 }}
      className={`flex items-start justify-between p-4 rounded-xl border border-white/5 transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isActive 
          ? 'bg-white/10 border-white/20 shadow-md shadow-black/30' 
          : 'bg-zinc-900/[0.1] hover:bg-white/5'
      }`}
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Left Avatar / Icon wrapper */}
        {icon && (
          <div className={`p-2.5 rounded-xl flex-shrink-0 flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
        )}

        {/* Text and Tags details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-sans font-medium text-sm truncate ${isActive ? 'text-white' : 'text-slate-100'}`}>
              {title}
            </h4>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400/80 mt-1 line-clamp-2 tracking-wide font-light">
              {subtitle}
            </p>
          )}

          {/* Tag Pills */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md bg-white/5 border border-white/5 text-[10px] font-medium px-2 py-0.5 text-slate-400 select-none"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>

      {/* Right-aligned meta details */}
      <div className="flex flex-col items-end justify-between ml-4 h-full self-stretch flex-shrink-0">
        {timestamp && (
          <span className="font-mono text-[10px] text-slate-500 tracking-wider">
            {timestamp}
          </span>
        )}
        {rightElement && <div className="mt-2">{rightElement}</div>}
      </div>
    </motion.div>
  );
};

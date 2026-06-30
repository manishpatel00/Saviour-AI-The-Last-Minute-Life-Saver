import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface PillBadgeProps {
  text: string;
  className?: string;
  glowColor?: string;
}

export const PillBadge: React.FC<PillBadgeProps> = ({
  text,
  className = '',
  glowColor = 'bg-blue-500 shadow-[0_0_8px_#3B82F6]'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-semibold tracking-wider text-white/80 shadow-sm relative overflow-hidden group ${className}`}
    >
      {/* Dynamic background shine */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      
      {/* Small Glowing Circle */}
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${glowColor}`} />
      </span>
      
      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
      <span className="uppercase tracking-widest">{text}</span>
    </motion.div>
  );
};

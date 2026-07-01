import React from 'react';
import { motion } from 'motion/react';

interface PillBadgeProps {
  text: string;
  className?: string;
}

export const PillBadge: React.FC<PillBadgeProps> = ({
  text,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-[10px] font-medium tracking-widest text-indigo-300 transition-colors duration-300 hover:border-indigo-500/50 cursor-default font-sans select-none ${className}`}
    >
      <span className="text-indigo-500/40 font-light">|</span>
      <span className="uppercase">{text}</span>
    </motion.div>
  );
};

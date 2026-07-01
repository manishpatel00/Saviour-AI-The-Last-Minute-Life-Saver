import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Calendar, Mail, Sparkles, ChevronRight, ChevronLeft, 
  X, Mic, AlertTriangle 
} from 'lucide-react';

interface OnboardingCarouselProps {
  onClose: () => void;
  onConnectGoogle: () => void;
  isLoggedIn: boolean;
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  onClose,
  onConnectGoogle,
  isLoggedIn
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Real-time Voice Intake",
      description: "Never waste precious seconds typing when in a panic. Power up the voice companion and speak your raw schedule crisis. Saviour AI handles deep parsing instantly.",
      icon: <Mic className="w-8 h-8 text-indigo-400 pointer-events-none" />,
      tag: "VOICE INTERACTIVE"
    },
    {
      title: "Context-Aware Calendar Audits",
      description: "Securely sync your Google Calendar. The autonomous coordinator checks real workloads and fits preparation slots dynamically around your existing meetings.",
      icon: <Calendar className="w-8 h-8 text-indigo-400 pointer-events-none" />,
      tag: "SECURE OAUTH"
    },
    {
      title: "Crisis Triage Mode",
      description: "Activate Emergency Triage when milestones slip. Saviour AI runs root-cause diagnostics, serves 3-step action recovery lists, and drafts delay apology emails.",
      icon: <AlertTriangle className="w-8 h-8 text-rose-400 pointer-events-none" />,
      tag: "CRITICAL DAMAGE CONTROL"
    },
    {
      title: "Drafts & Automated Checklists",
      description: "Generates professional email drafts inside your Gmail drafts folder and mails high-fidelity checklist checkpoints straight to your personal inbox.",
      icon: <Mail className="w-8 h-8 text-indigo-400 pointer-events-none" />,
      tag: "AUTONOMOUS AGENTS"
    },
    {
      title: "Click Approve & Deploy",
      description: "Nothing runs silently. Review and tweak slots, edit email templates, and click 'Deploy' to securely inject updates, schedules, and reminders into your life.",
      icon: <Sparkles className="w-8 h-8 text-amber-400 pointer-events-none" />,
      tag: "HUMAN CLEARANCE GATE"
    }
  ];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] pointer-events-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl relative pointer-events-auto z-[10000] font-sans"
      >
        {/* Ambient background spotlights */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleCloseClick}
          className="absolute top-5 right-5 p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer z-[10010]"
          aria-label="Close onboarding guide"
        >
          <X className="w-4 h-4 pointer-events-none" />
        </button>

        {/* Modal Container Body */}
        <div className="p-8 sm:p-10 space-y-8 text-left">
          
          {/* Elegant Logo / Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600/10 border border-indigo-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/5">
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="font-display font-extrabold text-sm tracking-tight uppercase text-text block font-sans">Saviour AI Onboarding</span>
              <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-widest block font-sans">Operational Protocols</span>
            </div>
          </div>

          {/* Stepper indicator bar */}
          <div className="flex gap-2">
            {steps.map((_, idx) => {
              const isActive = idx === currentStep;
              return (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                      : 'bg-zinc-800'
                  }`}
                />
              );
            })}
          </div>

          {/* Step content with animation */}
          <div className="min-h-[200px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-zinc-900/50 border border-border rounded-2xl flex items-center justify-center">
                    {steps[currentStep].icon}
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono font-bold text-indigo-400 tracking-widest uppercase block w-max">
                      {steps[currentStep].tag}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-text mt-1.5 font-sans">
                      {steps[currentStep].title}
                    </h3>
                  </div>
                </div>

                <p className="text-zinc-400 font-light text-sm leading-relaxed max-w-xl font-sans">
                  {steps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interactive Google Connection Trigger Action */}
          {currentStep === 1 && !isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-left"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-text">Link Google Account Workspace</p>
                <p className="text-[11px] text-zinc-400 font-light">Unlocks real calendar auditing and secure auto-drafted Gmail apologies.</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onConnectGoogle();
                  onClose();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-full shadow-lg shadow-indigo-600/10 cursor-pointer transition-all flex-shrink-0"
              >
                Connect Workspace
              </button>
            </motion.div>
          )}

          {/* Bottom Navigation Step Controls */}
          <div className="flex items-center justify-between pt-5 border-t border-border font-sans">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-text disabled:text-zinc-800 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-full flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102 active:scale-98 shadow-md shadow-indigo-600/10"
            >
              <span>{currentStep === steps.length - 1 ? 'Start Operating' : 'Continue'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

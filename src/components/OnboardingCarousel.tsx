import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Shield, Calendar, Mail, Sparkles, ChevronRight, ChevronLeft, 
  X, Mic, AlertTriangle, RefreshCw, Check, Flame 
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
      title: "🎙️ Real-time Voice Intake",
      description: "Never spend time typing when you're in a panic. Power up the Voice Intake and speak your raw crisis. Saviour AI handles the parsing instantly.",
      icon: <Mic className="w-8 h-8 text-blue-400" />,
      tag: "VOICE INTERACTIVE"
    },
    {
      title: "📅 Context-Aware Calendar Audits",
      description: "Securely link your Google Calendar. The autonomous coordinator checks your actual calendar and fits preparation sessions dynamically around busy times.",
      icon: <Calendar className="w-8 h-8 text-purple-400" />,
      tag: "SECURE OAUTH"
    },
    {
      title: "🚨 Crisis Triage Mode",
      description: "Turn on Emergency Triage if you missed a deadline. Saviour AI runs immediate diagnostics, gives a 3-step recovery mindset, and drafts delay apology emails.",
      icon: <AlertTriangle className="w-8 h-8 text-rose-500" />,
      tag: "CRITICAL DAMAGE CONTROL"
    },
    {
      title: "✉️ Drafts & Automated Checklists",
      description: "Generates fully structured email update drafts directly inside your Gmail account and mails high-fidelity, actionable HTML check-lists straight to your inbox.",
      icon: <Mail className="w-8 h-8 text-emerald-400" />,
      tag: "AUTONOMOUS AGENTS"
    },
    {
      title: "🚀 Click Approve & Deploy",
      description: "Nothing runs silently. Review and tweak slots, edit email drafts, and click 'Deploy' to automatically push all schedules, files, and updates directly into your life.",
      icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
      tag: "HUMAN CLEARANCE GATE"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Background Ambient Spotlights */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Body */}
        <div className="p-8 sm:p-10 space-y-8">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight uppercase text-white block">Saviour AI Onboarding</span>
              <span className="text-[8px] uppercase font-mono text-white/50 tracking-widest block">Operational Guidelines</span>
            </div>
          </div>

          {/* Stepper Display */}
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'bg-blue-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Animated Slide Window */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 min-h-[220px]"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                  {steps[currentStep].icon}
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-[9px] font-mono font-bold text-blue-400 tracking-wider">
                    {steps[currentStep].tag}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                    {steps[currentStep].title}
                  </h3>
                </div>
              </div>

              <p className="text-slate-400 font-light text-sm leading-relaxed sm:text-base">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Call to action for Integration */}
          {currentStep === 1 && !isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="text-left space-y-1">
                <p className="text-xs font-semibold text-white">Google Account Access Requested</p>
                <p className="text-[11px] text-slate-400 font-light">Calendar scheduling & draft Gmail saves will active safely.</p>
              </div>
              <button
                onClick={() => {
                  onConnectGoogle();
                  onClose();
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all flex-shrink-0"
              >
                Connect Google Account
              </button>
            </motion.div>
          )}

          {/* Step Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              {currentStep === steps.length - 1 ? 'Start Operating' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

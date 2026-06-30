import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, SuggestedAction } from '../types';
import { CTAButton } from './ui/CTAButton';
import { 
  Send, Sparkles, AlertCircle, RefreshCw, Layers, Zap, Bot, User, Mic, MicOff 
} from 'lucide-react';

interface AIAgentCompanionProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onTriggerSuggestedAction: (action: SuggestedAction) => void;
  isGenerating: boolean;
}

const QUICK_PROMPTS = [
  "Plan my day with AI",
  "Suggest subtasks for my critical deadline",
  "How can I resolve my schedule conflict?",
  "Mitigate my overdue bills"
];

export const AIAgentCompanion: React.FC<AIAgentCompanionProps> = ({
  messages,
  onSendMessage,
  onTriggerSuggestedAction,
  isGenerating
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(prev => prev ? prev + ' ' + transcript : transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("🎙️ Voice speech input is not fully supported in this browser. Please use Google Chrome, Microsoft Edge, or another compatible browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    
    onSendMessage(inputText);
    setInputText('');
  };

  const handleQuickPromptClick = (promptText: string) => {
    if (isGenerating) return;
    onSendMessage(promptText);
  };

  return (
    <div className="bg-zinc-950/45 border border-white/5 backdrop-blur-md rounded-2xl flex flex-col h-[600px] md:h-full relative overflow-hidden">
      {/* Background radial gradient decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Header bar */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
              SAVIOUR AI AGENT
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </h3>
            <p className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Active Autopilot Companion</p>
          </div>
        </div>
        
        {/* Connection status */}
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">ONLINE</span>
        </div>
      </div>

      {/* Messages timeline body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${
                isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              {/* Profile Avatar */}
              <div className={`p-2 rounded-xl flex-shrink-0 ${
                isAgent ? 'bg-purple-500/10 text-purple-400' : 'bg-white/5 text-slate-300'
              }`}>
                {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble text content */}
              <div className="space-y-2">
                <div className={`rounded-2xl p-3.5 text-xs leading-relaxed border ${
                  isAgent 
                    ? 'bg-zinc-900/[0.3] border-white/5 text-slate-200' 
                    : 'bg-purple-950/20 border-purple-500/20 text-purple-100'
                }`}>
                  <p className="whitespace-pre-wrap font-sans font-light tracking-wide">{msg.text}</p>
                </div>

                {/* Agent Triggerable Suggested Actions */}
                {isAgent && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 block">Suggested Safeguards</span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((act) => (
                        <button
                          key={act.id}
                          onClick={() => onTriggerSuggestedAction(act)}
                          className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-300 text-[10px] font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <Zap className="w-3 h-3 text-purple-400 animate-pulse" />
                          {act.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Streaming / Generation loader effect */}
        {isGenerating && (
          <div className="flex items-start gap-3 max-w-[80%] mr-auto">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 flex-shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-2xl p-3.5 text-xs bg-zinc-900/[0.3] border border-white/5 text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing deadline prioritizations...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts Drawer */}
      <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-white/5 bg-zinc-950/15">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPromptClick(prompt)}
            disabled={isGenerating}
            className="px-2.5 py-1 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-full text-[10px] font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input submission box */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-zinc-950/20 flex gap-2 items-center">
        {/* Voice Dictation Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer flex-shrink-0 ${
            isListening
              ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.3)]'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
          }`}
          title={isListening ? 'Listening... Click to stop dictation' : 'Start real-time voice dictation'}
        >
          {isListening ? (
            <span className="flex h-4 w-4 items-center justify-center relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <MicOff className="w-3.5 h-3.5 relative" />
            </span>
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isGenerating}
          placeholder={isListening ? "Listening to voice input..." : "Command the AI Sentinel..."}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={isGenerating || !inputText.trim()}
          className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-white/5 disabled:text-slate-600 text-white transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

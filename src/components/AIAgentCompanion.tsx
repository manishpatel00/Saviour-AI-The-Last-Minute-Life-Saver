import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, SuggestedAction } from '../types';
import { 
  Send, Sparkles, RefreshCw, Zap, Bot, User, Mic, MicOff 
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
  const [speechError, setSpeechError] = useState<string | null>(null);
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
        setSpeechError(null);
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
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission blocked. Click the microphone icon in your browser search/address bar to allow access.');
        } else if (event.error === 'network') {
          setSpeechError('Network error during speech recognition.');
        } else {
          setSpeechError(`Speech error: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("🎙️ Voice speech input is not fully supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    setSpeechError(null);

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
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
    <div className="bg-surface border border-border rounded-xl flex flex-col h-[600px] md:h-full relative overflow-hidden font-mono relative">
      {/* HUD Corners */}
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />

      {/* Dynamic Top Header Bar */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-black">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand/10 text-brand border border-brand/20 rounded">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left font-mono">
            <h3 className="font-display font-bold text-text text-sm tracking-widest uppercase flex items-center gap-1.5 glow-accent">
              AGENT_LOG_CENTRAL
            </h3>
            <p className="text-[9px] uppercase font-mono text-brand/70 tracking-widest font-bold">PROTOCOL LEVEL MONITOR</p>
          </div>
        </div>
        
        {/* Connection Status Badge */}
        <div className="flex items-center gap-1.5 bg-brand/10 border border-brand/30 rounded px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
          <span className="text-[9px] font-mono font-bold text-brand uppercase tracking-widest glow-accent">ACTIVE</span>
        </div>
      </div>

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-[#050505]">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[95%] text-left ${
                isAgent ? 'mr-auto' : 'ml-auto text-right items-end'
              }`}
            >
              {/* Sender & Timestamp bar */}
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-muted uppercase">
                <span>{isAgent ? '>> SAVIOUR_AI_UNIT' : '>> COGNITIVE_OPERATIVE'}</span>
                <span>•</span>
                <span>{msg.timestamp || 'LOG_TIME'}</span>
              </div>

              {/* Message Block wrapper */}
              <div className="space-y-2 w-full">
                <div className={`p-3.5 text-xs border ${
                  isAgent 
                    ? 'bg-brand/5 border-brand/20 text-brand font-mono leading-relaxed glow-accent' 
                    : 'bg-zinc-950 border-border text-text font-mono leading-relaxed'
                } rounded-md relative`}>
                  
                  {isAgent && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand" />}
                  {!isAgent && <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-text-sub" />}

                  <p className="whitespace-pre-wrap tracking-wide">{msg.text}</p>
                </div>

                {/* Suggested Action Safeguards buttons */}
                {isAgent && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1 text-left">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-brand/60 block font-mono">[MITIGATION_OPTIONS]</span>
                    <div className="flex flex-wrap gap-2">
                      {msg.suggestedActions.map((act) => (
                        <button
                          key={act.id}
                          onClick={() => onTriggerSuggestedAction(act)}
                          className="px-3 py-1.5 bg-brand/10 hover:bg-brand text-brand hover:text-black border border-brand/30 hover:border-brand text-[10px] font-bold font-mono uppercase rounded transition-all cursor-pointer flex items-center gap-1.5 hover:shadow-[0_0_10px_rgba(0,255,65,0.4)]"
                        >
                          <Zap className="w-3 h-3 animate-pulse" />
                          {act.label.replace(/[📋✉️]/g, '')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Structured 3-Segment Thinking Loader skeleton */}
        {isGenerating && (
          <div className="flex items-start gap-3 max-w-[80%] mr-auto text-left">
            <div className="p-2 rounded bg-brand/10 text-brand border border-brand/20 flex-shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <div className="text-[9px] text-brand uppercase font-mono tracking-widest flex items-center gap-1.5 font-bold animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-brand" />
                COGNITIVE_LOAD_CALCULATING...
              </div>
              <div className="bg-brand/5 border border-brand/20 rounded p-4 space-y-2 w-full">
                <div className="h-2 w-full bg-brand/20 animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-[75%] bg-brand/20 animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-[45%] bg-brand/20 animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-border bg-black">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPromptClick(prompt)}
            disabled={isGenerating}
            className="px-2.5 py-1.5 bg-zinc-950 hover:bg-brand/10 border border-border hover:border-brand/40 text-[10px] font-bold font-mono text-muted hover:text-brand uppercase tracking-wider rounded transition-all cursor-pointer"
          >
            &gt; {prompt.replace(' AI', '').replace(' my', '')}
          </button>
        ))}
      </div>

      {/* Speech Recognition Error Alert Banner */}
      {speechError && (
        <div className="px-4 py-2 border-t border-crisis/30 bg-crisis/10 text-crisis text-[10px] font-mono flex items-center justify-between">
          <span>[SYSTEM_WARN] {speechError}</span>
          <button 
            type="button" 
            onClick={() => setSpeechError(null)}
            className="text-muted hover:text-crisis uppercase font-bold cursor-pointer ml-2 border border-crisis/20 px-1 rounded bg-crisis/5"
          >
            [DISMISS]
          </button>
        </div>
      )}

      {/* Input Form Box */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-black flex gap-2 items-center">
        {/* Voice dictation toggle */}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded border transition-all duration-300 flex items-center justify-center cursor-pointer flex-shrink-0 ${
            isListening
              ? 'bg-crisis/20 border-crisis text-crisis animate-pulse shadow-[0_0_12px_rgba(255,62,62,0.4)]'
              : 'bg-zinc-950 border-border text-muted hover:text-brand hover:border-brand/30'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice dictation'}
        >
          {isListening ? (
            <span className="flex h-4 w-4 items-center justify-center relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crisis opacity-75"></span>
              <MicOff className="w-3.5 h-3.5 relative" />
            </span>
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </button>

        <span className="text-brand font-bold text-sm hidden sm:inline glow-accent">$ CMD &gt;</span>

        <input
          type="text"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (speechError) setSpeechError(null);
          }}
          disabled={isGenerating}
          placeholder={isListening ? "LISTENING..." : "Execute command (e.g. /plan_day, /breakdown)..."}
          className="flex-1 bg-zinc-950 border border-border rounded px-4 py-2.5 text-xs text-brand placeholder-zinc-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all font-mono"
        />
        
        <button
          type="submit"
          disabled={isGenerating || !inputText.trim()}
          className="p-2.5 rounded bg-brand hover:shadow-[0_0_15px_rgba(0,255,65,0.4)] disabled:bg-zinc-900 disabled:text-zinc-700 text-black font-bold uppercase transition-all cursor-pointer flex items-center justify-center flex-shrink-0 border border-brand/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

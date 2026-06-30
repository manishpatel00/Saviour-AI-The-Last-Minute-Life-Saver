import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { 
  Calendar, Mail, Key, Shield, CheckCircle2, RefreshCw, 
  AlertCircle, ExternalLink, Lock, Settings, Sparkles, User as UserIcon, X, HelpCircle
} from 'lucide-react';
import { CTAButton } from './ui/CTAButton';

interface WorkspaceConnectorProps {
  user: User | null;
  accessToken: string | null;
  isLoggingIn: boolean;
  onConnectGoogle: () => void;
  onApplyDeveloperBypass: (displayName: string, email: string, token: string) => void;
  onDisconnect: () => void;
}

export const WorkspaceConnector: React.FC<WorkspaceConnectorProps> = ({
  user,
  accessToken,
  isLoggingIn,
  onConnectGoogle,
  onApplyDeveloperBypass,
  onDisconnect
}) => {
  const [displayName, setDisplayName] = useState('Workspace Tester');
  const [email, setEmail] = useState('workspace@gmail.com');
  const [tokenValue, setTokenValue] = useState('');
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  const isBypassActive = user && user.uid.startsWith('dev_');

  const handleApplyBypass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenValue.trim()) {
      alert('Access Token value is required to apply the override.');
      return;
    }
    onApplyDeveloperBypass(displayName, email, tokenValue.trim());
    setTokenValue(''); // clear input field after dispatch for security
  };

  return (
    <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
      {/* Visual Ambient glow backgrounds */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex flex-col gap-5 text-left">
        {/* Component Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-100 text-base flex items-center gap-2">
                Connect Google Workspace
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Authorizes Calendar synchronization & document draft writing.
              </p>
            </div>
          </div>

          {/* Connection Badge Status */}
          {user && accessToken ? (
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
              isBypassActive 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBypassActive ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isBypassActive ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              {isBypassActive ? 'DEV OVERRIDE ACTIVE' : 'OAUTH CONNECTED'}
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-full bg-zinc-900 border border-white/5 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              ● DISCONNECTED
            </div>
          )}
        </div>

        {/* Connection Active Status Card */}
        {user && accessToken && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-blue-300" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{user.displayName || 'Authorized User'}</h4>
                  <p className="text-xs text-slate-400 font-light">{user.email || 'No email associated'}</p>
                </div>
              </div>

              <CTAButton 
                variant="secondary" 
                size="sm" 
                onClick={onDisconnect}
                className="!text-rose-400 hover:!text-rose-300 !border-rose-500/20 hover:!border-rose-500/40 text-[11px] font-bold"
              >
                Disconnect Session
              </CTAButton>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3 font-light text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Calendar Sync Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gmail Draft Auto-Writes Active</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dual Authentication Methods Grid */}
        {(!user || !accessToken) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Standard Google OAuth Card */}
            <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs text-slate-200 uppercase tracking-wide">Standard Google OAuth</span>
                </div>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Securely connect your Google Calendar and Gmail to allow the AI to schedule slots and draft documents automatically.
                </p>
              </div>

              <CTAButton 
                variant="primary" 
                size="sm" 
                disabled={isLoggingIn}
                onClick={onConnectGoogle}
                className="w-full bg-blue-600 hover:bg-blue-500 text-xs font-bold"
                icon={isLoggingIn ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" /> : <Lock className="w-3.5 h-3.5 text-white" />}
              >
                {isLoggingIn ? 'Authenticating...' : 'Authenticate via Google'}
              </CTAButton>
            </div>

            {/* Developer Bypass Override Card */}
            <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="font-bold text-xs text-slate-200 uppercase tracking-wide">Developer Bypass</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowTokenHelp(!showTokenHelp)}
                    className="text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Running in a secure sandbox? Paste an active <strong>Access Token</strong> (from Google OAuth Playground or CLI) to bypass client registration.
                </p>
              </div>

              <CTAButton 
                variant="secondary" 
                size="sm" 
                onClick={() => setIsFormExpanded(!isFormExpanded)}
                className="w-full text-xs font-bold !border-amber-500/20 hover:!border-amber-500/40 text-amber-300 hover:text-amber-200"
              >
                {isFormExpanded ? 'Hide Developer Override Form' : 'Configure Override Token'}
              </CTAButton>
            </div>

          </div>
        )}

        {/* Detailed Developer Bypass Input Form */}
        <AnimatePresence>
          {(!user || !accessToken) && isFormExpanded && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleApplyBypass}
              className="p-5 bg-zinc-950/60 border border-amber-500/20 rounded-2xl space-y-4 shadow-xl overflow-hidden text-left"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold font-mono tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  DEVELOPER CREDENTIAL OVERRIDE
                </span>
                <span className="text-[9px] font-mono text-slate-500">Dual-Security Bypass Mode</span>
              </div>

              {showTokenHelp && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[11px] text-blue-300 font-light leading-relaxed relative"
                >
                  <button 
                    onClick={() => setShowTokenHelp(false)}
                    className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <strong className="block mb-0.5">Where do I find an Access Token?</strong>
                  Visit <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noreferrer" className="underline hover:text-blue-100 font-medium">Google OAuth Playground</a>, select Gmail/Calendar scopes, authorize, and copy the string beginning with <code className="bg-black/40 px-1 py-0.5 rounded font-mono">ya29.</code>. Paste it below to immediately run automated actions.
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Display Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input 
                      type="text" 
                      required
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Workspace Tester"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Google Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input 
                      type="email" 
                      required
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="workspace@gmail.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Access Token Value</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input 
                    type="password" 
                    required
                    value={tokenValue} 
                    onChange={(e) => setTokenValue(e.target.value)}
                    placeholder="ya29.a0AfB_..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/5">
                <CTAButton 
                  type="submit" 
                  variant="primary" 
                  size="sm" 
                  className="!bg-gradient-to-r !from-amber-600 !to-yellow-600 border border-white/10 text-xs font-bold"
                >
                  Apply Developer Override Token
                </CTAButton>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

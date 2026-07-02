import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User } from 'firebase/auth';
import { loadGoogleIntegration } from '../lib/sync';
import { 
  CheckCircle2, RefreshCw, Shield, Lock, Settings, Sparkles, 
  User as UserIcon, Calendar, Mail, HardDrive, AlertTriangle, Key
} from 'lucide-react';
import { CTAButton } from './ui/CTAButton';

interface WorkspaceConnectorProps {
  user: User | null;
  accessToken: string | null;
  isLoggingIn: boolean;
  onConnectGoogle: () => void;
  onDisconnect: () => void;
}

interface IntegrationMetrics {
  eventsScheduled: number;
  focusSessionsCreated: number;
  draftsGenerated: number;
}

export const WorkspaceConnector: React.FC<WorkspaceConnectorProps> = ({
  user,
  accessToken,
  isLoggingIn,
  onConnectGoogle,
  onDisconnect
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'calendar' | 'gmail' | 'drive'>('all');
  const [metrics, setMetrics] = useState<IntegrationMetrics>({
    eventsScheduled: 7,
    focusSessionsCreated: 3,
    draftsGenerated: 2
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  // Load user specific integration metrics from secure Firestore location
  useEffect(() => {
    if (user) {
      const loadMetrics = async () => {
        setIsLoadingMetrics(true);
        try {
          const data = await loadGoogleIntegration(user.uid);
          if (data) {
            setMetrics({
              eventsScheduled: data.eventsScheduled ?? 7,
              focusSessionsCreated: data.focusSessionsCreated ?? 3,
              draftsGenerated: data.draftsGenerated ?? 2
            });
          }
        } catch (err) {
          console.error("Failed to load user integration metrics:", err);
        } finally {
          setIsLoadingMetrics(false);
        }
      };
      loadMetrics();
    }
  }, [user, accessToken]);

  const handleReconnect = () => {
    onConnectGoogle();
  };

  const isConnected = !!(user && accessToken);

  return (
    <div className="space-y-6 font-sans text-left">
      {/* Tab bar header */}
      <div className="flex border-b border-white/5 gap-1 pb-px overflow-x-auto scrollbar-none flex-nowrap sm:flex-wrap">
        {(['all', 'calendar', 'gmail', 'drive'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === tab
                ? 'border-brand text-brand bg-brand/5'
                : 'border-transparent text-muted hover:text-text hover:bg-white/5'
            }`}
          >
            {tab === 'all' ? '🔍 All Integrations' : tab === 'calendar' ? '📅 Calendar' : tab === 'gmail' ? '✉️ Gmail' : '💾 Drive'}
          </button>
        ))}
      </div>

      {/* Global Status Alert banner if disconnected */}
      {!isConnected && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono uppercase text-amber-400">UNAUTHENTICATED WORKSPACE</h4>
            <p className="text-xs text-text-sub font-light leading-relaxed">
              Google Workspace services are locked. Authenticate your secure connection to activate autonomous scheduling, time-boxing, and email draft generation under your own account.
            </p>
          </div>
        </div>
      )}

      {/* Connection Hub details when connected */}
      {isConnected && (
        <div className="p-4 bg-zinc-950/60 border border-white/6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand/20 to-indigo-500/20 flex items-center justify-center border border-brand/30">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-full h-full rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-brand" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold text-sm text-text whitespace-nowrap">{user?.displayName || 'Authorized Operative'}</h4>
                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono bg-success/10 border border-success/20 text-success font-bold whitespace-nowrap">SECURE CHANNEL</span>
              </div>
              <p className="text-xs text-text-sub font-light font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <CTAButton 
              variant="secondary" 
              size="sm" 
              onClick={handleReconnect}
              className="text-[10px] font-mono font-bold uppercase tracking-wider flex-1 sm:flex-none"
              title="Refresh access token or log in with different account"
            >
              <RefreshCw className="w-3 h-3 text-brand" /> Reconnect
            </CTAButton>
            <CTAButton 
              variant="secondary" 
              size="sm" 
              onClick={onDisconnect}
              className="!text-crisis hover:!text-red-400 !border-crisis/20 hover:!border-crisis/40 text-[10px] font-mono font-bold uppercase tracking-wider flex-1 sm:flex-none"
            >
              Disconnect
            </CTAButton>
          </div>
        </div>
      )}

      {/* Grid of integration cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Google Calendar */}
        {(activeTab === 'all' || activeTab === 'calendar') && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
              isConnected 
                ? 'bg-zinc-900/40 border-brand/20 hover:border-brand/30' 
                : 'bg-zinc-950/20 border-white/5 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-brand/10 border border-brand/20 text-brand rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isConnected ? 'bg-success/10 text-success border border-success/25' : 'bg-zinc-900 text-zinc-500 border border-white/5'
                }`}>
                  {isConnected ? '● ACTIVE' : '● LOCKED'}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-text">Google Calendar</h4>
                <p className="text-xs text-text-sub font-light mt-1 leading-relaxed">
                  Scans primary schedule parameters and allocates focus blocks automatically.
                </p>
              </div>

              {isConnected && (
                <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2 text-xs font-mono text-text-sub">
                  <div className="flex justify-between items-center">
                    <span>Events scheduled:</span>
                    <span className="text-white font-bold">{metrics.eventsScheduled}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Focus blocks:</span>
                    <span className="text-brand font-bold">{metrics.focusSessionsCreated}</span>
                  </div>
                </div>
              )}
            </div>

            {!isConnected && (
              <CTAButton 
                variant="primary" 
                size="sm" 
                disabled={isLoggingIn}
                onClick={onConnectGoogle}
                className="w-full text-[11px] uppercase tracking-wider font-mono font-bold"
              >
                {isLoggingIn ? 'Connecting...' : 'Authorize Calendar'}
              </CTAButton>
            )}
          </motion.div>
        )}

        {/* Card 2: Gmail */}
        {(activeTab === 'all' || activeTab === 'gmail') && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
              isConnected 
                ? 'bg-zinc-900/40 border-indigo-500/20 hover:border-indigo-500/30' 
                : 'bg-zinc-950/20 border-white/5 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isConnected ? 'bg-success/10 text-success border border-success/25' : 'bg-zinc-900 text-zinc-500 border border-white/5'
                }`}>
                  {isConnected ? '● ACTIVE' : '● LOCKED'}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-text">Gmail Composer</h4>
                <p className="text-xs text-text-sub font-light mt-1 leading-relaxed">
                  Drafts professional deadline mitigation extension requests into your Gmail inbox safely.
                </p>
              </div>

              {isConnected && (
                <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2 text-xs font-mono text-text-sub">
                  <div className="flex justify-between items-center">
                    <span>Drafts generated:</span>
                    <span className="text-indigo-400 font-bold">{metrics.draftsGenerated}</span>
                  </div>
                  <div className="flex justify-between items-center font-light text-[10px]">
                    <span className="text-zinc-500 uppercase">NO AUTO-SEND ENABLED</span>
                  </div>
                </div>
              )}
            </div>

            {!isConnected && (
              <CTAButton 
                variant="primary" 
                size="sm" 
                disabled={isLoggingIn}
                onClick={onConnectGoogle}
                className="w-full text-[11px] uppercase tracking-wider font-mono font-bold"
              >
                {isLoggingIn ? 'Connecting...' : 'Authorize Gmail'}
              </CTAButton>
            )}
          </motion.div>
        )}

        {/* Card 3: Google Drive */}
        {(activeTab === 'all' || activeTab === 'drive') && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
              isConnected 
                ? 'bg-zinc-900/40 border-purple-500/20 hover:border-purple-500/30' 
                : 'bg-zinc-950/20 border-white/5 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
                  <HardDrive className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isConnected ? 'bg-success/10 text-success border border-success/25' : 'bg-zinc-900 text-zinc-500 border border-white/5'
                }`}>
                  {isConnected ? '● ACTIVE' : '● LOCKED'}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-text">Google Drive</h4>
                <p className="text-xs text-text-sub font-light mt-1 leading-relaxed">
                  Archives historic performance checklists and automated action plans for analytics logs.
                </p>
              </div>

              {isConnected && (
                <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2 text-xs font-mono text-text-sub">
                  <div className="flex justify-between items-center">
                    <span>Performance archives:</span>
                    <span className="text-purple-400 font-bold">Synced</span>
                  </div>
                  <div className="flex justify-between items-center font-light text-[10px]">
                    <span className="text-zinc-500 uppercase">Archive compression active</span>
                  </div>
                </div>
              )}
            </div>

            {!isConnected && (
              <CTAButton 
                variant="primary" 
                size="sm" 
                disabled={isLoggingIn}
                onClick={onConnectGoogle}
                className="w-full text-[11px] uppercase tracking-wider font-mono font-bold"
              >
                {isLoggingIn ? 'Connecting...' : 'Authorize Drive'}
              </CTAButton>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
};


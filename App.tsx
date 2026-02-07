
import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, Bell, Search, X, Activity, Cpu, Shield, Zap, Terminal, Trash, Clock, Layers } from 'lucide-react';
import { Series, ViewState, Episode } from './types';
import Dashboard from './components/Dashboard';
import SeriesDetail from './components/SeriesDetail';
import AddSeriesModal from './components/AddSeriesModal';

const STORAGE_KEY = 'hexastream_series_v4';

const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = "" }) => (
  <div 
    className={`relative flex items-center justify-center transition-all duration-700 ${className}`}
    style={{ width: size, height: size }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(139,92,246,0.6)] overflow-visible">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      
      {/* Tracking segments */}
      {[0, 1, 2].map((i) => (
        <rect 
          key={i} 
          x="105" 
          y={30 + (i * 15)} 
          width="6" 
          height="6" 
          rx="1" 
          fill={i === 2 ? '#06b6d4' : '#8b5cf6'} 
          className="animate-pulse" 
          style={{ animationDelay: `${i * 0.2}s` }} 
        />
      ))}

      <polygon 
        points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
        fill="none" 
        stroke="url(#logoGradient)" 
        strokeWidth="5" 
        className="animate-[pulse_4s_ease-in-out_infinite]"
      />

      <circle r="3" fill="#06b6d4">
        <animateMotion 
          dur="5s" 
          repeatCount="indefinite" 
          path="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z" 
        />
      </circle>

      <path d="M44,38 L62,50 L44,62 Z" fill="white" className="opacity-90" />
    </svg>
  </div>
);

interface NotificationItem {
  id: string;
  message: string;
  time: string;
  type: 'info' | 'alert' | 'sync';
}

const NotificationsPanel: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  logs: NotificationItem[];
  onClear: () => void;
}> = ({ isOpen, onClose, logs, onClear }) => (
  <>
    {isOpen && <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-md transition-opacity" onClick={onClose} />}
    <aside 
      className={`fixed top-0 right-0 bottom-0 z-[1100] w-full sm:w-96 bg-[#0a0c12] border-l border-white/10 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <Activity size={18} className="text-violet-500" />
          <h2 className="text-xs font-orbitron font-bold text-white uppercase tracking-[0.2em]">Neural Logs</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <Zap size={48} className="mb-4" />
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest">Awaiting system events...</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 glass rounded-xl space-y-2 group border border-white/5 hover:border-violet-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${log.type === 'alert' ? 'border-red-500/30 text-red-500' : log.type === 'sync' ? 'border-cyan-500/30 text-cyan-500' : 'border-violet-500/30 text-violet-500'} uppercase tracking-widest font-mono`}>
                  {log.type}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">{log.time}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">{log.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-black/20">
        <button 
          onClick={onClear}
          className="w-full py-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] rounded-lg transition-all flex items-center justify-center gap-3 border border-transparent hover:border-red-500/20"
        >
          <Trash size={14} /> Purge Cache
        </button>
      </div>
    </aside>
  </>
);

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [view, setView] = useState<ViewState>('dashboard');
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSeriesList(JSON.parse(saved));
      } catch (e) { console.error("Corrupted archive", e); }
    }
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seriesList));
  }, [seriesList]);

  const addLog = (message: string, type: NotificationItem['type'] = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setNotifications(prev => [{ id: Math.random().toString(36).substr(2, 9), message, time, type }, ...prev].slice(0, 20));
  };

  const handleAddSeries = (newSeries: Series) => {
    setSeriesList(prev => [newSeries, ...prev]);
    setIsAddModalOpen(false);
    addLog(`Initialized Node: ${newSeries.title}`, 'sync');
  };

  const handleUpdateSeries = (updatedSeries: Series) => {
    const old = seriesList.find(s => s.id === updatedSeries.id);
    setSeriesList(prev => prev.map(s => s.id === updatedSeries.id ? updatedSeries : s));
    
    if (old && updatedSeries.lastWatchedEpisodeId !== old.lastWatchedEpisodeId) {
      const ep = updatedSeries.episodes.find(e => e.id === updatedSeries.lastWatchedEpisodeId);
      if (ep) addLog(`Segment Cleared: ${updatedSeries.title} // E${ep.number}`, 'info');
    }
  };

  const handleSelectSeries = (id: string) => {
    setSelectedSeriesId(id);
    setView('series-detail');
  };

  const selectedSeries = seriesList.find(s => s.id === selectedSeriesId);

  if (isBooting) {
    return (
      <div className="fixed inset-0 z-[2000] bg-[#01040a] flex flex-col items-center justify-center p-6">
        <Logo size={100} className="mb-12 animate-pulse" />
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-orbitron font-black tracking-[0.5em] text-white">HEXASTREAM</h1>
          <div className="w-64 h-[2px] bg-white/5 relative overflow-hidden rounded-full">
            <div className="absolute inset-y-0 left-0 bg-violet-600 w-full animate-[loading_2s_ease-in-out_forwards]" />
          </div>
          <p className="text-[10px] font-mono text-cyan-500/60 font-bold uppercase tracking-[0.4em]">Establishing Uplink...</p>
        </div>
        <style>{`
          @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(0%); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col selection:bg-violet-500/40">
      <header className="sticky top-0 z-[100] border-b border-white/5 bg-[#01040a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-6 cursor-pointer group" 
            onClick={() => { setView('dashboard'); setSearchQuery(''); }}
          >
            <Logo size={40} className="group-hover:scale-110 transition-transform" />
            <div className="hidden lg:block">
              <h1 className="text-lg font-orbitron font-black tracking-[0.3em] text-white leading-none">HEXASTREAM</h1>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1.5 block">Neural Tracker v4.0</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-12 hidden md:flex items-center glass rounded-2xl px-5 py-3 border border-white/5 focus-within:border-violet-500/40 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all">
            <Search size={18} className="text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query Archives..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-4 w-full text-slate-100 placeholder:text-slate-700 font-medium" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="ml-3 text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </div>

          <nav className="flex items-center gap-6">
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="p-3 text-slate-400 hover:text-white transition-all relative glass rounded-xl hover:scale-105 active:scale-95"
            >
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-violet-600 rounded-full border-2 border-[#01040a] shadow-[0_0_10px_#8b5cf6]" />
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-3 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-widest font-orbitron shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Sync Node</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-20 page-animate">
        {view === 'dashboard' && (
          <Dashboard 
            seriesList={seriesList} 
            searchQuery={searchQuery}
            onSelect={handleSelectSeries} 
            onAddRequest={() => setIsAddModalOpen(true)}
          />
        )}

        {view === 'series-detail' && selectedSeries && (
          <div className="space-y-10">
            <button 
              onClick={() => { setView('dashboard'); addLog('Session Terminated', 'alert'); }}
              className="flex items-center gap-4 text-slate-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-[0.3em] group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
              <span>Terminate Session</span>
            </button>
            <SeriesDetail 
              series={selectedSeries} 
              onUpdate={handleUpdateSeries} 
            />
          </div>
        )}
      </main>

      <NotificationsPanel 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        logs={notifications}
        onClear={() => setNotifications([])}
      />

      <footer className="border-t border-white/5 py-16 bg-black/40 mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 opacity-40">
          <div className="flex items-center gap-6">
            <Logo size={32} className="opacity-50" />
            <div>
              <span className="font-orbitron font-bold text-sm tracking-[0.5em] block text-white uppercase">HEXASTREAM</span>
              <span className="text-[10px] font-mono block text-slate-500 mt-1">Universal Tracking Core X-9</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-10 text-[10px] font-bold uppercase tracking-[0.4em] font-mono">
             <span>v4.0.2 Stable</span>
             <span className="text-violet-500">Encryption Active</span>
             <span className="flex items-center gap-2"><Terminal size={14} /> System Optimal</span>
          </div>
        </div>
      </footer>

      {isAddModalOpen && (
        <AddSeriesModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleAddSeries} 
        />
      )}
    </div>
  );
};

export default App;

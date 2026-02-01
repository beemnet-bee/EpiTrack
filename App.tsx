
import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, Bell, Search, Hexagon, X, Terminal } from 'lucide-react';
import { Series, ViewState } from './types';
import Dashboard from './components/Dashboard';
import SeriesDetail from './components/SeriesDetail';
import AddSeriesModal from './components/AddSeriesModal';

const STORAGE_KEY = 'hexastream_series_v3';

// Custom HexaStream Logo Component
const Logo: React.FC = () => (
  <div className="relative w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Outer Hexagon */}
      <polygon 
        points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
        fill="none" 
        stroke="url(#logoGradient)" 
        strokeWidth="4" 
        className="animate-[pulse_4s_ease-in-out_infinite]"
      />
      {/* Inner Hexagon */}
      <polygon 
        points="50,25 75,37.5 75,62.5 50,75 25,62.5 25,37.5" 
        fill="url(#logoGradient)" 
        className="opacity-80"
      />
      {/* Central Sync Node */}
      <circle cx="50" cy="50" r="6" fill="white" className="animate-pulse" />
    </svg>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSeriesList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load series data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seriesList));
  }, [seriesList]);

  const handleAddSeries = (newSeries: Series) => {
    setSeriesList(prev => [newSeries, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleUpdateSeries = (updatedSeries: Series) => {
    setSeriesList(prev => prev.map(s => s.id === updatedSeries.id ? updatedSeries : s));
  };

  const handleSelectSeries = (id: string) => {
    setSelectedSeriesId(id);
    setView('series-detail');
  };

  const selectedSeries = seriesList.find(s => s.id === selectedSeriesId);

  return (
    <div className="min-h-screen bg-[#010409] text-slate-300 flex flex-col font-mono selection:bg-violet-500/30">
      {/* Background Glows */}
      <div className="glow-overlay w-[400px] h-[400px] bg-purple-900/5 -top-32 -left-32" />
      <div className="glow-overlay w-[300px] h-[300px] bg-cyan-900/5 top-1/2 -right-32" />

      <header className="sticky top-0 z-[100] border-b border-white/5 bg-[#010409]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-4 cursor-pointer group" 
            onClick={() => { setView('dashboard'); setSearchQuery(''); }}
          >
            <Logo />
            <div className="hidden sm:block">
              <h1 className="text-sm font-orbitron font-black tracking-[0.2em] text-white leading-none">
                HEXA<span className="text-violet-500">STREAM</span>
              </h1>
              <span className="text-[7px] text-slate-600 font-bold uppercase tracking-[0.4em]">NEURAL_INTERFACE.v3</span>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8 flex items-center bg-black/40 rounded-lg px-3 py-1.5 border border-white/5 focus-within:border-violet-500/30 transition-all">
            <Search size={14} className="text-slate-600" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query Archive..." 
              className="bg-transparent border-none focus:ring-0 text-[11px] ml-2 w-full text-slate-200 placeholder:text-slate-800 font-mono" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="ml-2 text-slate-700 hover:text-white transition-colors">
                <X size={12} />
              </button>
            )}
          </div>

          <nav className="flex items-center gap-4">
            <button className="p-1.5 text-slate-600 hover:text-white transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-600 rounded-full border border-black" />
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-md transition-all font-bold text-[10px] uppercase tracking-wider font-orbitron"
            >
              <Plus size={14} />
              <span className="hidden lg:inline">SYNC_NODE</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 relative z-20">
        {view === 'dashboard' && (
          <Dashboard 
            seriesList={seriesList} 
            searchQuery={searchQuery}
            onSelect={handleSelectSeries} 
            onAddRequest={() => setIsAddModalOpen(true)}
          />
        )}

        {view === 'series-detail' && selectedSeries && (
          <div className="space-y-6 animate-reveal">
            <button 
              onClick={() => setView('dashboard')}
              className="flex items-center gap-2 text-slate-600 hover:text-violet-500 transition-colors font-bold text-[10px] uppercase tracking-widest group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>TERMINATE_SESSION</span>
            </button>
            <SeriesDetail 
              series={selectedSeries} 
              onUpdate={handleUpdateSeries} 
            />
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 bg-black mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 opacity-40">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 opacity-50"><Logo /></div>
            <span className="font-orbitron font-bold text-[9px] tracking-widest">HEXASTREAM // CORE_ENG_42</span>
          </div>
          <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest">
            <span className="text-slate-700 font-mono">ENCRYPTED_UPLINK_SUCCESS</span>
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

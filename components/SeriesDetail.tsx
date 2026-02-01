
import React, { useState, useEffect } from 'react';
import { Series, Episode } from '../types';
import VideoPlayer from './VideoPlayer';
import HexagonPath from './HexagonPath';
import { Star, Clock, ArrowRight, Activity, ChevronRight, Target, ShieldCheck, Zap, Terminal, LayoutList, Map as MapIcon, X } from 'lucide-react';

interface SeriesDetailProps {
  series: Series;
  onUpdate: (updatedSeries: Series) => void;
}

const SeriesDetail: React.FC<SeriesDetailProps> = ({ series, onUpdate }) => {
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (series.lastWatchedEpisodeId) {
      const last = series.episodes.find(e => e.id === series.lastWatchedEpisodeId);
      if (last) setActiveEpisode(last);
      else setActiveEpisode(series.episodes[0] || null);
    } else {
      setActiveEpisode(series.episodes[0] || null);
    }
  }, [series.id, series.lastWatchedEpisodeId]);

  const handleEpisodeClick = (episode: Episode) => {
    setActiveEpisode(episode);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleEpisodeComplete = () => {
    if (!activeEpisode) return;
    const updatedEpisodes = series.episodes.map(ep => 
      ep.id === activeEpisode.id ? { ...ep, isCompleted: true } : ep
    );
    const currentIndex = series.episodes.findIndex(e => e.id === activeEpisode.id);
    const nextEpisode = series.episodes[currentIndex + 1];

    onUpdate({
      ...series,
      episodes: updatedEpisodes,
      lastWatchedEpisodeId: activeEpisode.id
    });

    if (nextEpisode) {
      setTimeout(() => setActiveEpisode(nextEpisode), 1500);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className={`space-y-8 animate-reveal transition-all duration-500 ease-in-out ${isSidebarOpen ? 'lg:pr-[400px]' : 'pr-0'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/5 group relative shadow-2xl">
              {activeEpisode ? (
                <VideoPlayer 
                  src={activeEpisode.sourceUrl} 
                  title={activeEpisode.title}
                  onEnded={handleEpisodeComplete}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 bg-black">
                  <Zap size={24} className="text-slate-900 mb-2" />
                  <span className="text-[10px] font-mono tracking-widest uppercase opacity-20">Uplink Terminated</span>
                </div>
              )}
            </div>
            
            {activeEpisode && (
              <div className="p-6 glass rounded-xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-4 right-6">
                  {activeEpisode.isCompleted ? (
                     <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-bold rounded border border-green-500/20 uppercase tracking-widest">
                       NODE_CLEARED
                     </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-violet-500/10 text-violet-500 text-[8px] font-bold rounded border border-violet-500/20 uppercase tracking-widest animate-pulse">
                      NODE_ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-slate-900 border border-white/5 rounded-lg flex items-center justify-center text-violet-500 font-mono font-black text-lg shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    {activeEpisode.number}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white font-orbitron uppercase tracking-tighter leading-none">{activeEpisode.title}</h2>
                    <div className="flex items-center gap-2 mt-1 opacity-40">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">NODE_SEGMENT_{activeEpisode.number}</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed max-w-2xl font-mono italic border-l border-violet-500/20 pl-4 py-1">
                  {activeEpisode.description || "Synthesizing stream parameters..."}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 glass rounded-xl border border-white/5 sticky top-20 overflow-hidden">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4 border border-white/5 group">
                <img src={series.coverImage} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" alt={series.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>
              
              <h1 className="text-lg font-bold text-white mb-2 font-orbitron uppercase tracking-tighter leading-none">{series.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-2 py-0.5 bg-black/40 rounded text-[7px] font-bold text-slate-600 uppercase tracking-widest font-mono border border-white/5">{series.category}</span>
                <span className="px-2 py-0.5 bg-violet-600/10 rounded text-[7px] font-bold text-violet-500 uppercase tracking-widest font-mono border border-violet-500/20">{series.episodes.length}_SEGMENTS</span>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[8px] font-bold text-slate-700 uppercase tracking-widest font-mono">
                    <span>SYNC_LVL</span>
                    <span className="text-cyan-500">{Math.round((series.episodes.filter(e => e.isCompleted).length / (series.episodes.length || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 shadow-[0_0_8px_#8b5cf6]" style={{ width: `${(series.episodes.filter(e => e.isCompleted).length / (series.episodes.length || 1)) * 100}%` }} />
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    const next = series.episodes.find(e => !e.isCompleted) || series.episodes[0];
                    handleEpisodeClick(next);
                  }}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded font-bold transition-all flex items-center justify-center gap-2 text-[10px] tracking-widest uppercase font-orbitron shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                >
                  RESUME_SESSION <ArrowRight size={14} />
                </button>

                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className={`w-full py-3 border border-white/10 text-white rounded font-bold transition-all flex items-center justify-center gap-2 text-[10px] tracking-widest uppercase font-orbitron hover:bg-white/5 ${isSidebarOpen ? 'hidden' : 'flex'}`}
                >
                  <MapIcon size={14} className="text-cyan-500" /> SHOW_VECTRA_MAP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed right-6 bottom-12 z-[100] w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-[0_0_25px_#8b5cf6] hover:scale-110 active:scale-95 transition-all group"
          title="Open Vectra Mapping"
        >
          <MapIcon size={20} className="group-hover:animate-pulse" />
        </button>
      )}

      <aside 
        className={`fixed top-14 right-0 bottom-0 z-[120] w-full sm:w-[400px] bg-[#010409]/95 backdrop-blur-xl border-l border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 glass rounded-lg flex items-center justify-center text-cyan-500 border border-white/5 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Target size={16} />
            </div>
            <div>
              <h2 className="text-[11px] font-bold font-orbitron text-white tracking-widest uppercase leading-none">VECTRA_MAPPING</h2>
              <span className="text-[7px] text-slate-500 font-mono tracking-widest uppercase">Node_Path_v4.5_STABLE</span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative group bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.02),transparent)]">
          {isSidebarOpen && (
            <HexagonPath 
              episodes={series.episodes} 
              activeId={activeEpisode?.id || null}
              lastWatchedId={series.lastWatchedEpisodeId}
              onEpisodeClick={handleEpisodeClick}
            />
          )}
          
          <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col gap-2 pointer-events-none">
            <div className="flex gap-2">
               <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-black/80 backdrop-blur rounded-lg border border-white/5 shadow-xl">
                 <div className="w-2 h-2 bg-violet-600 rounded-full shadow-[0_0_8px_#8b5cf6]" />
                 <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest font-mono">SYNCED</span>
               </div>
               <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-black/80 backdrop-blur rounded-lg border border-white/5 shadow-xl">
                 <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_#06b6d4]" />
                 <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest font-mono">ACTIVE</span>
               </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-black/80 border-t border-white/5 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2 text-[8px] font-bold text-slate-600 font-mono tracking-widest uppercase">
            <Activity size={10} className="text-cyan-600" /> NEURAL_PATHWAY_ACTIVE
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-[4px] z-[110] lg:hidden animate-reveal"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SeriesDetail;

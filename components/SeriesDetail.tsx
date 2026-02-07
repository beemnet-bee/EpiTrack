
import React, { useState, useEffect } from 'react';
import { Series, Episode } from '../types';
import VideoPlayer from './VideoPlayer';
import HexagonPath from './HexagonPath';
import { ArrowRight, Activity, Target, Zap, Terminal, Map as MapIcon, X, CheckCircle } from 'lucide-react';

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

  const handleToggleComplete = (episodeId: string) => {
    const updatedEpisodes = series.episodes.map(ep => 
      ep.id === episodeId ? { ...ep, isCompleted: !ep.isCompleted } : ep
    );
    
    const updatedLastWatchedId = updatedEpisodes.find(e => e.id === episodeId)?.isCompleted 
      ? episodeId 
      : series.lastWatchedEpisodeId;

    onUpdate({
      ...series,
      episodes: updatedEpisodes,
      lastWatchedEpisodeId: updatedLastWatchedId
    });
  };

  const handleEpisodeComplete = () => {
    if (!activeEpisode) return;
    handleToggleComplete(activeEpisode.id);
    
    const currentIndex = series.episodes.findIndex(e => e.id === activeEpisode.id);
    const nextEpisode = series.episodes[currentIndex + 1];

    if (nextEpisode) {
      setTimeout(() => setActiveEpisode(nextEpisode), 1500);
    }
  };

  const watchedCount = series.episodes.filter(e => e.isCompleted).length;
  const progress = Math.round((watchedCount / (series.episodes.length || 1)) * 100);
  const watchNext = series.episodes.find(e => !e.isCompleted) || series.episodes[0];

  return (
    <div className="relative min-h-screen pb-20">
      {/* Main Content Area - Fixed width, no shifting */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-10">
          <div className="lg:col-span-8 space-y-6 xl:space-y-8">
            <div className="aspect-video bg-black rounded-[1.5rem] xl:rounded-[2rem] overflow-hidden border border-white/5 shadow-3xl">
              {activeEpisode ? (
                <VideoPlayer 
                  src={activeEpisode.sourceUrl} 
                  title={activeEpisode.title}
                  onEnded={handleEpisodeComplete}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-800">
                  <Zap size={48} className="text-slate-900 mb-6 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-[0.5em] opacity-20">Link Terminated</span>
                </div>
              )}
            </div>
            
            {activeEpisode && (
              <div className="p-6 xl:p-10 glass rounded-[1.5rem] xl:rounded-[2.5rem] relative overflow-hidden group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4 xl:gap-8">
                    <div className="w-14 h-14 xl:w-16 xl:h-16 glass rounded-2xl flex-shrink-0 flex items-center justify-center text-violet-500 font-mono font-bold text-2xl xl:text-3xl shadow-xl border border-white/10">
                      {activeEpisode.number}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl xl:text-3xl font-extrabold text-white tracking-tight leading-tight line-clamp-2 group-hover:text-violet-400 transition-colors">
                        {activeEpisode.title}
                      </h2>
                      <p className="text-[10px] xl:text-xs font-bold text-slate-500 uppercase tracking-widest font-mono mt-1">Archive Segment {activeEpisode.number}</p>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {activeEpisode.isCompleted ? (
                       <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-xl border border-green-500/20 uppercase tracking-widest font-mono">
                         <CheckCircle size={14} /> Node Cleared
                       </div>
                    ) : (
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-violet-500/10 text-violet-500 text-[10px] font-bold rounded-xl border border-violet-500/20 uppercase tracking-widest font-mono animate-pulse">
                        <Activity size={14} /> Tracking Active
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-5 xl:p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-slate-400 text-sm xl:text-base leading-relaxed font-medium">
                    {activeEpisode.description || "System report: No metadata summary available for this archive segment. Initializing default parameters..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6 xl:space-y-8">
            <div className="p-8 xl:p-10 glass rounded-[1.5rem] xl:rounded-[2.5rem] sticky top-24 overflow-hidden shadow-3xl">
              <div className="relative aspect-square rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-inner">
                <img src={series.coverImage} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt={series.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#01040a] to-transparent opacity-80" />
              </div>
              
              <h1 className="text-2xl xl:text-3xl font-black text-white mb-6 font-orbitron uppercase tracking-tight leading-none line-clamp-2">{series.title}</h1>
              
              <div className="flex flex-wrap gap-3 mb-10">
                <span className="px-3 py-1.5 glass rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-widest">{series.category}</span>
                <span className="px-3 py-1.5 glass rounded-lg text-[9px] font-bold text-violet-500 uppercase tracking-widest font-mono border border-violet-500/20">{series.episodes.length} SEGMENTS</span>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] font-mono">
                    <span>Sync Status</span>
                    <span className="text-cyan-500">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 shadow-[0_0_15px_#8b5cf6] transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                
                <button 
                  onClick={() => handleEpisodeClick(watchNext)}
                  className="w-full py-4 xl:py-5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-4 text-xs xl:text-sm tracking-widest uppercase font-orbitron shadow-2xl hover:scale-[1.02] active:scale-95 group"
                >
                  {progress === 100 ? 'Rewatch Node' : `Resume E${watchNext.number}`} 
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>

                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="w-full py-4 xl:py-5 glass border border-white/10 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-4 text-[10px] xl:text-xs tracking-widest uppercase font-orbitron hover:bg-white/5 active:scale-95"
                >
                  <MapIcon size={20} className="text-cyan-500" /> Neural Pathway
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Floating Neural Pathway Modal */}
      <aside 
        className={`fixed top-20 right-0 bottom-0 z-[120] w-full sm:w-[380px] xl:w-[450px] bg-[#0a0c12]/98 backdrop-blur-3xl border-l border-white/10 shadow-3xl transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 xl:p-8 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 xl:w-12 xl:h-12 glass rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner">
              <Target size={24} className="animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <h2 className="text-xs xl:text-sm font-bold font-orbitron text-white tracking-[0.2em] uppercase">Vectra Map</h2>
              <span className="text-[8px] xl:text-[9px] text-slate-500 font-mono tracking-[0.4em] uppercase mt-1 block">Path Config v4.2</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2.5 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative group">
          {isSidebarOpen && (
            <HexagonPath 
              episodes={series.episodes} 
              activeId={activeEpisode?.id || null}
              lastWatchedId={series.lastWatchedEpisodeId}
              onEpisodeClick={handleEpisodeClick}
              onToggleComplete={handleToggleComplete}
            />
          )}
          
          <div className="absolute bottom-6 xl:bottom-10 left-6 xl:left-10 right-6 xl:right-10 z-10 flex flex-col gap-5 pointer-events-none">
             <div className="grid grid-cols-2 gap-4">
               <div className="flex items-center justify-center gap-2.5 xl:gap-3 py-3 glass rounded-xl border border-white/5 bg-black/60">
                 <div className="w-2.5 h-2.5 bg-violet-600 rounded-full shadow-[0_0_10px_#8b5cf6]" />
                 <span className="text-[8px] xl:text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Synced</span>
               </div>
               <div className="flex items-center justify-center gap-2.5 xl:gap-3 py-3 glass rounded-xl border border-white/5 bg-black/60">
                 <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#06b6d4]" />
                 <span className="text-[8px] xl:text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Active</span>
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 xl:p-8 bg-black/80 border-t border-white/10">
          <div className="flex items-center justify-center gap-3 text-[9px] xl:text-[10px] font-bold text-slate-600 font-mono tracking-[0.4em] uppercase">
            <Terminal size={14} className="text-cyan-600" /> Pathway Link Active
          </div>
        </div>
      </aside>

      {/* Persistent Backdrop for visibility */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[110] animate-reveal"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SeriesDetail;

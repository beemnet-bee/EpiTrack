
import React, { useMemo } from 'react';
import { Series } from '../types';
import { Play, Clock, Layers, Plus, Activity, Database, SearchX, Terminal } from 'lucide-react';

interface DashboardProps {
  seriesList: Series[];
  searchQuery?: string;
  onSelect: (id: string) => void;
  onAddRequest: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ seriesList, searchQuery = '', onSelect, onAddRequest }) => {
  const filteredList = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return seriesList;
    return seriesList.filter(s => 
      s.title.toLowerCase().includes(query) || 
      s.category.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    );
  }, [seriesList, searchQuery]);

  const totalEpisodes = seriesList.reduce((acc, s) => acc + s.episodes.length, 0);
  const completedEpisodes = seriesList.reduce((acc, s) => acc + s.episodes.filter(e => e.isCompleted).length, 0);

  return (
    <div className="space-y-12 animate-reveal">
      {/* Compact Hero */}
      {!searchQuery && (
        <section className="relative h-64 rounded-2xl overflow-hidden border border-white/5 flex items-center p-8 bg-[#010409]">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-black opacity-60" />
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-[40px] border-violet-500/10 rounded-full animate-pulse" />
          </div>
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-violet-600/10 border border-violet-500/20 text-violet-500 text-[8px] font-bold uppercase tracking-widest font-mono rounded">SYSTEM.READY</span>
              <Activity size={10} className="text-cyan-500 animate-pulse" />
            </div>
            
            <h2 className="text-3xl font-black font-orbitron text-white tracking-tighter uppercase leading-none">
              NEURAL_ARCHIVE_<span className="text-violet-500">INIT</span>
            </h2>
            
            <p className="text-slate-500 text-xs font-mono max-w-md leading-relaxed">
              Managing <span className="text-white">[{seriesList.length}]</span> data-nodes. Core sync efficiency at <span className="text-cyan-500">[{Math.round((completedEpisodes / (totalEpisodes || 1)) * 100)}%]</span>.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={onAddRequest}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded font-bold flex items-center gap-2 transition-all text-[9px] uppercase tracking-widest font-orbitron"
              >
                <Plus size={12} /> INITIALIZE_SYNC
              </button>
              <div className="px-4 py-2 bg-white/5 border border-white/5 rounded flex items-center gap-3 cursor-default">
                <Terminal size={12} className="text-slate-600" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">NODES: {completedEpisodes}/{totalEpisodes}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Library Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-violet-600 rounded-full" />
            <h3 className="text-xs font-bold text-white font-orbitron uppercase tracking-widest">
              {searchQuery ? 'QUERY_RESULTS' : 'ARCHIVE_COLLECTION'}
            </h3>
          </div>
          <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest font-mono">
            {filteredList.length} NODES_FOUND
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/5 rounded-2xl bg-black/40 text-center">
            <SearchX size={32} className="text-slate-800 mb-4" />
            <h3 className="text-xs font-bold text-slate-600 font-mono tracking-widest uppercase mb-2">ARCHIVE_NOT_FOUND</h3>
            <p className="text-[9px] text-slate-800 font-bold uppercase tracking-widest">Requested node id returned NULL.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredList.map((series) => {
              const progress = Math.round((series.episodes.filter(e => e.isCompleted).length / (series.episodes.length || 1)) * 100);
              return (
                <div 
                  key={series.id}
                  onClick={() => onSelect(series.id)}
                  className="group relative bg-[#0d1117] rounded-lg overflow-hidden border border-white/5 hover:border-violet-500/50 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src={series.coverImage} 
                      alt={series.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent opacity-60" />
                    
                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 bg-black/80 text-cyan-500 text-[7px] font-bold uppercase tracking-widest rounded border border-cyan-500/20">
                        {series.category}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform">
                        <Play fill="white" size={14} className="text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-3">
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-bold text-white truncate font-orbitron uppercase tracking-tighter">
                        {series.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest font-mono">
                        <Layers size={8} /> {series.episodes.length} NODES
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[7px] font-bold text-slate-700 tracking-widest font-mono">
                        <span>PROGRESS</span>
                        <span className="text-slate-500">{progress}%</span>
                      </div>
                      <div className="w-full h-0.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-600 transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

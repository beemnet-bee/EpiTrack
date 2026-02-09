
import React, { useMemo } from 'react';
import { Series } from '../types';
import { Play, Layers, Plus, SearchX, Terminal, Shield, Activity, Clock } from 'lucide-react';

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
      s.category.toLowerCase().includes(query)
    );
  }, [seriesList, searchQuery]);

  return (
    <div className="space-y-16">
      {!searchQuery && (
        <section className="relative h-auto min-h-[24rem] rounded-[2.5rem] overflow-hidden border border-white/5 light:border-slate-200 flex items-center p-8 sm:p-16 bg-[#020617] light:bg-white shadow-3xl group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(139,92,246,0.15),transparent_60%)] light:bg-[radial-gradient(circle_at_70%_20%,rgba(139,92,246,0.05),transparent_60%)] group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent light:from-slate-50 light:via-slate-50/80 light:to-transparent" />
          
          <div className="relative z-10 max-w-2xl space-y-8 sm:space-y-10">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 bg-violet-600/10 border border-violet-500/20 text-violet-500 text-[10px] font-bold uppercase tracking-[0.3em] font-mono rounded-full">System Secure</span>
              <Shield size={16} className="text-cyan-500 animate-pulse" />
            </div>
            
            <div className="space-y-5">
              <h2 className="text-4xl sm:text-6xl font-black font-orbitron text-white light:text-slate-900 tracking-tighter uppercase leading-none">
                Neural <span className="text-violet-500">Archive</span>
              </h2>
              <p className="text-slate-400 light:text-slate-500 text-base sm:text-lg font-medium max-w-lg leading-relaxed">
                Currently tracking <span className="text-white light:text-violet-600 font-bold">{seriesList.length}</span> active archives with synchronized neural progress.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <button 
                onClick={onAddRequest}
                className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold flex items-center gap-4 transition-all text-sm uppercase tracking-widest font-orbitron shadow-2xl active:scale-95"
              >
                <Plus size={20} /> Initialize New Node
              </button>
            </div>
          </div>
          
          <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden xl:block opacity-20 light:opacity-10 group-hover:opacity-40 light:group-hover:opacity-20 transition-opacity duration-1000">
             <div className="w-96 h-96 border-2 border-violet-500/30 rounded-full animate-[spin_60s_linear_infinite]" />
             <div className="absolute inset-0 w-96 h-96 border-2 border-cyan-500/10 rounded-full scale-75 animate-[spin_40s_linear_infinite_reverse]" />
          </div>
        </section>
      )}

      <div className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 light:border-slate-200 pb-8 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-2 h-10 bg-violet-600 rounded-full shadow-[0_0_15px_#8b5cf6]" />
            <h3 className="text-lg sm:text-xl font-bold text-white light:text-slate-900 font-orbitron uppercase tracking-[0.4em]">
              {searchQuery ? 'Search Results' : 'Node Collection'}
            </h3>
          </div>
          <div className="flex items-center gap-4 px-5 py-2 glass rounded-2xl border border-white/10">
             <Activity size={16} className="text-cyan-500" />
             <span className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-widest font-mono">
               {filteredList.length} Channels
             </span>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-48 glass rounded-[3rem] border border-dashed border-white/10 text-center">
            <SearchX size={64} className="text-slate-800 light:text-slate-300 mb-8" />
            <h3 className="text-lg font-bold text-slate-500 light:text-slate-400 uppercase tracking-widest mb-4">Archive Empty</h3>
            <p className="text-sm text-slate-700 light:text-slate-400 font-bold uppercase tracking-widest">No matching node identifiers found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {filteredList.map((series, index) => {
              const watchedCount = series.episodes.filter(e => e.isCompleted).length;
              const totalCount = series.episodes.length || 1;
              const progress = Math.round((watchedCount / totalCount) * 100);
              const nextEpisode = series.episodes.find(e => !e.isCompleted) || series.episodes[0];

              return (
                <div 
                  key={series.id}
                  onClick={() => onSelect(series.id)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="group relative glass rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-violet-500/40 transition-all duration-500 cursor-pointer flex flex-col hover-shine hover:translate-y-[-8px]"
                >
                  <div className="relative aspect-[16/11] overflow-hidden bg-slate-900 light:bg-slate-200">
                    <img 
                      src={series.coverImage} 
                      alt={series.title}
                      className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-70 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/40 to-transparent light:from-slate-50/80 light:to-transparent" />
                    
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 glass-premium rounded-xl text-[10px] font-bold text-cyan-400 light:text-cyan-600 light:bg-white/80 uppercase tracking-widest">
                        {series.category}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.5)] transform scale-50 group-hover:scale-100 transition-transform">
                        <Play fill="white" size={24} className="text-white translate-x-1" />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h4 className="text-xl font-extrabold text-white light:text-slate-900 truncate leading-tight group-hover:text-violet-400 transition-colors">
                        {series.title}
                      </h4>
                      <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 light:text-slate-400 uppercase tracking-widest">
                        <Layers size={14} className="text-slate-700 light:text-slate-300" /> {series.episodes.length} Segments
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 light:text-slate-500 tracking-widest uppercase">
                        <span>Sync Level</span>
                        <span className={progress === 100 ? 'text-cyan-400 light:text-cyan-600' : 'text-slate-200 light:text-slate-700'}>{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 light:bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-[1.5s] ease-out shadow-[0_0_15px_currentColor] ${progress === 100 ? 'bg-cyan-400' : 'bg-violet-600'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      
                      <div className="pt-2 border-t border-white/5 light:border-slate-200 flex items-center gap-3">
                        <Clock size={12} className="text-violet-500" />
                        <span className="text-[10px] font-bold text-slate-500 light:text-slate-400 uppercase tracking-widest truncate">
                          Next: <span className="text-white light:text-slate-800">{nextEpisode?.title || 'None'}</span>
                        </span>
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

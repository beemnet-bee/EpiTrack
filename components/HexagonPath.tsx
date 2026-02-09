
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Episode } from '../types';
import { Check, Navigation, Trophy, Zap, Activity, Clock, Target, ShieldCheck, ShieldAlert } from 'lucide-react';

interface HexagonPathProps {
  episodes: Episode[];
  activeId: string | null;
  lastWatchedId?: string;
  onEpisodeClick: (episode: Episode) => void;
  onToggleComplete?: (episodeId: string) => void;
}

const HexagonPath: React.FC<HexagonPathProps> = ({ episodes, activeId, lastWatchedId, onEpisodeClick, onToggleComplete }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isCentered, setIsCentered] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 100);
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const newScale = Math.min(1, width / 450);
        setScale(newScale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const currentIndex = useMemo(() => {
    if (!episodes.length) return 0;
    const activeIdx = episodes.findIndex(e => e.id === activeId);
    if (activeIdx !== -1) return activeIdx;
    const lastIdx = episodes.findIndex(e => e.id === lastWatchedId);
    if (lastIdx !== -1) return lastIdx;
    const firstUnwatched = episodes.findIndex(e => !e.isCompleted);
    return firstUnwatched !== -1 ? firstUnwatched : 0;
  }, [episodes, activeId, lastWatchedId]);

  const renderHexagonNode = (episode: Episode, index: number) => {
    const segmentSize = 3;
    const segmentIndex = Math.floor(index / segmentSize);
    const stepInSegment = index % segmentSize;
    const isEvenSegment = segmentIndex % 2 === 0;

    const xOffset = isEvenSegment ? stepInSegment * 100 : (2 - stepInSegment) * 100;
    const yOffset = index * -145; 

    const isCompleted = episode.isCompleted;
    const isCurrentFocus = index === currentIndex;
    const isNextToWatch = !isCompleted && (index === 0 || episodes[index - 1]?.isCompleted);
    const isHovered = hoveredId === episode.id;

    const distance = Math.abs(index - currentIndex);
    const opacity = Math.max(0.1, 1 - (distance * 0.18));
    const blur = distance > 4 ? `blur(${Math.min(distance - 3, 5)}px)` : 'none';

    return (
      <div 
        key={episode.id}
        className="absolute transition-all duration-1000 ease-in-out"
        style={{
          transform: `translate3d(${xOffset - 100}px, ${yOffset}px, 0px)`,
          zIndex: isHovered ? 1000 : 100 - index,
          opacity: isInitialized ? opacity : 0,
          filter: blur,
          pointerEvents: opacity < 0.1 && !isHovered ? 'none' : 'auto',
          transformStyle: 'preserve-3d'
        }}
        onMouseEnter={() => setHoveredId(episode.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => onEpisodeClick(episode)}
      >
        {/* Navigation Marker - Counter rotated to billboard */}
        {isCurrentFocus && (
          <div 
            className="absolute -top-24 left-1/2 flex flex-col items-center pointer-events-none z-[110]"
            style={{ 
              transform: `translateX(-50%) rotateZ(12deg) rotateX(-62deg)`,
              transformOrigin: 'bottom center'
            }}
          >
            <div className="bg-cyan-500 p-2 rounded-full shadow-[0_0_25px_#06b6d4] animate-bounce">
              <Navigation size={14} className="text-white fill-white" />
            </div>
            <div className="w-[2px] h-16 bg-gradient-to-t from-cyan-500 via-cyan-500/40 to-transparent" />
          </div>
        )}

        {/* Neural Connector */}
        {index < episodes.length - 1 && (
          <div 
            className="absolute pointer-events-none origin-top transition-all duration-700"
            style={{
              width: '3px',
              height: '155px',
              left: '50%',
              top: '40px',
              transform: `translateX(-50%) rotateZ(${isEvenSegment && stepInSegment < 2 ? '0deg' : !isEvenSegment && stepInSegment < 2 ? '0deg' : isEvenSegment ? '-34deg' : '34deg'})`,
              background: isCompleted 
                ? 'linear-gradient(to bottom, #8b5cf6, #4c1d95, transparent)' 
                : isNextToWatch 
                  ? 'linear-gradient(to bottom, #94a3b8, #1e293b, transparent)'
                  : 'rgba(255, 255, 255, 0.05)',
            }}
          >
            {isCompleted && (
              <div className="absolute inset-x-0 h-10 bg-violet-400/30 blur-lg animate-[energy-pulse_2.5s_linear_infinite]" />
            )}
          </div>
        )}

        {/* Node Hexagon with Hover Pulse Animation */}
        <div className={`relative w-[100px] h-[86px] cursor-pointer transition-all duration-500 ${isHovered ? 'scale-110 -translate-y-6' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0 transition-opacity duration-500 blur-2xl translate-z-[-15px]" style={{ opacity: isCompleted ? 0.4 : isCurrentFocus ? 0.7 : 0 }}>
            <svg viewBox="0 0 100 86.6" className="w-full h-full">
              <polygon points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3" fill={isCompleted ? '#8b5cf6' : '#06b6d4'} />
            </svg>
          </div>
          <svg viewBox="0 0 100 86.6" className="w-full h-full drop-shadow-2xl overflow-visible">
            <polygon 
              points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3" 
              className={`transition-all duration-700 ${
                isCompleted ? 'fill-[#1e1b4b]/95 stroke-violet-500/50' : 
                isCurrentFocus ? 'fill-slate-900/90 stroke-cyan-400' : 
                isNextToWatch ? 'fill-white stroke-white' : 
                'fill-black/90 stroke-white/10'
              } ${isHovered && !isCompleted ? 'animate-hex-pulse' : ''} ${isNextToWatch ? 'animate-idle-pulse' : ''}`}
              strokeWidth="2.5"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={`text-sm font-mono font-bold mb-0.5 tracking-tighter ${isNextToWatch ? 'text-black' : isCompleted ? 'text-violet-300' : 'text-slate-600'}`}>
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <div className="flex items-center justify-center">
              {isCompleted ? <Check size={16} className="text-violet-400" /> : 
               isCurrentFocus ? <Activity size={16} className="text-cyan-400 animate-pulse" /> :
               <Zap size={16} className={isNextToWatch ? 'text-violet-700' : 'text-slate-800'} />}
            </div>
          </div>
        </div>

        {/* Tooltip Overlay - Perfect Billboarding and Interactive */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.(episode.id);
          }}
          className={`
            absolute bottom-full mb-14 left-1/2 w-80 rounded-[2rem] shadow-3xl transition-all duration-500 z-[1200]
            ${isHovered ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto cursor-pointer' : 'opacity-0 scale-90 translate-y-12 pointer-events-none'}
            bg-[#01040a]/98 backdrop-blur-3xl border border-white/10 overflow-hidden group/tooltip
          `}
          style={{ 
            transform: `translateX(-50%) rotateZ(12deg) rotateX(-62deg)`, 
            transformOrigin: 'bottom center',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Episode Thumbnail with Data Scan Effect */}
          <div className="relative w-full aspect-video overflow-hidden">
            {episode.thumbnail ? (
              <img src={episode.thumbnail} className="w-full h-full object-cover group-hover/tooltip:scale-110 transition-transform duration-[2s]" alt="" />
            ) : (
              <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                <Zap size={32} className="text-slate-900 animate-pulse" />
              </div>
            )}
            
            {/* Scanned Data Overlay Effect */}
            <div className="absolute inset-0 bg-scan-grid opacity-15 pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-[2px] bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-data-scan" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#01040a] via-[#01040a]/20 to-transparent" />
            
            <div className="absolute top-5 left-5">
              <span className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em] font-mono border border-white/5 shadow-xl">
                NODE_{episode.number.toString().padStart(3, '0')}
              </span>
            </div>

            {/* Completion Status Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/tooltip:opacity-100 transition-all duration-500 bg-black/50 backdrop-blur-[1px]">
               <div className="px-6 py-3 glass rounded-2xl border border-white/15 flex items-center gap-3 text-xs font-black text-white uppercase tracking-[0.2em] shadow-2xl">
                 {isCompleted ? <ShieldAlert size={18} className="text-red-500" /> : <ShieldCheck size={18} className="text-cyan-500" />}
                 {isCompleted ? 'DESYNC SEGMENT' : 'SYNC SEGMENT'}
               </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <h4 className="text-base font-black text-white tracking-tight font-sans leading-tight line-clamp-2">
              {episode.title}
            </h4>
            
            {/* Tooltip Completion Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 tracking-[0.3em] uppercase font-mono">
                <span>SYNC_PROGRESS</span>
                <span className={isCompleted ? 'text-cyan-400' : 'text-slate-700'}>{isCompleted ? '100%' : '0%'}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${isCompleted ? 'w-full shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'w-0'}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold tracking-widest pt-5 border-t border-white/5 uppercase">
              <div className="flex items-center gap-2 text-slate-500 font-mono">
                <Clock size={14} className="text-slate-700" /> {episode.duration || '24m'}
              </div>
              <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' : 'bg-slate-800'}`} />
                 <span className={isCompleted ? 'text-cyan-400 font-bold' : 'text-slate-600'}>
                   {isCompleted ? 'CLEARED' : 'PENDING'}
                 </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const focusY = currentIndex * -145;

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden bg-transparent select-none"
      style={{ perspective: '3000px' }} 
    >
      <style>{`
        @keyframes energy-pulse {
          0% { transform: translateY(0) scaleY(0.4); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(155px) scaleY(1); opacity: 0; }
        }
        @keyframes hex-pulse {
          0% { stroke-width: 2.5; stroke-opacity: 0.5; filter: drop-shadow(0 0 0px transparent); }
          50% { stroke-width: 5.5; stroke-opacity: 1; filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.5)); }
          100% { stroke-width: 2.5; stroke-opacity: 0.5; filter: drop-shadow(0 0 0px transparent); }
        }
        @keyframes idle-pulse {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.2)); }
          50% { filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.6)); }
        }
        @keyframes data-scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .bg-scan-grid {
          background-image: radial-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px);
          background-size: 12px 12px;
        }
        .animate-hex-pulse {
          animation: hex-pulse 1.8s ease-in-out infinite;
        }
        .animate-idle-pulse {
          animation: idle-pulse 3s ease-in-out infinite;
        }
        .animate-data-scan {
          animation: data-scan 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* 3D Map Container */}
      <div 
        className="absolute w-full h-full flex items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(62deg) rotateZ(-12deg) translate3d(0, ${isCentered ? (-focusY - 140) * scale : 0}px, -150px) scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        <div className="relative transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
           {episodes.map((ep, i) => renderHexagonNode(ep, i))}
           
           {/* Final Trophy Node Decor */}
           {episodes.length > 0 && (
             <div 
               className="absolute transition-all duration-1000"
               style={{
                 transform: `translate3d(${(episodes.length % 3 === 0 ? 0 : (episodes.length % 6 < 3 ? (episodes.length % 3) * 100 : (2 - (episodes.length % 3)) * 100)) - 100}px, ${episodes.length * -145}px, 0px)`,
                 opacity: 0.1,
                 transformStyle: 'preserve-3d'
               }}
             >
                <div className="w-[100px] h-[86px] flex items-center justify-center glass rounded-full border border-dashed border-white/20 animate-[spin_30s_linear_infinite]">
                   <Trophy size={28} className="text-white" />
                </div>
             </div>
           )}
        </div>
      </div>

      {/* UI Controls - Absolute within the modal view */}
      <div className="absolute top-6 right-6 xl:top-10 xl:right-10 flex flex-col gap-3 pointer-events-auto z-[200]">
         <button 
           onClick={(e) => { e.stopPropagation(); setIsCentered(!isCentered); }}
           className={`p-3.5 rounded-2xl glass border transition-all hover:scale-105 active:scale-95 ${isCentered ? 'border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-white/10 text-slate-500 hover:text-white'}`}
           title="Toggle Neural Map Centering"
         >
           <Target size={22} className={isCentered ? 'animate-pulse' : ''} />
         </button>
      </div>

      {/* Atmospheric Fog Visuals */}
      <div className="absolute inset-x-0 top-0 h-48 xl:h-72 pointer-events-none bg-gradient-to-b from-[#0a0c12] via-[#0a0c12]/70 to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-48 xl:h-72 pointer-events-none bg-gradient-to-t from-[#0a0c12] via-[#0a0c12]/70 to-transparent z-10" />
    </div>
  );
};

export default HexagonPath;

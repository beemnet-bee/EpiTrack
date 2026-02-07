
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Episode } from '../types';
import { Check, Navigation, Terminal, Trophy, Zap, Activity, Clock, Target } from 'lucide-react';

interface HexagonPathProps {
  episodes: Episode[];
  activeId: string | null;
  lastWatchedId?: string;
  onEpisodeClick: (episode: Episode) => void;
}

const HexagonPath: React.FC<HexagonPathProps> = ({ episodes, activeId, lastWatchedId, onEpisodeClick }) => {
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
    const opacity = Math.max(0.02, 1 - (distance * 0.18));
    const blur = distance > 3 ? `blur(${Math.min(distance - 2, 8)}px)` : 'none';

    return (
      <div 
        key={episode.id}
        className="absolute transition-all duration-1000 ease-in-out"
        style={{
          transform: `translate3d(${xOffset - 100}px, ${yOffset}px, 0px)`,
          zIndex: 100 - index,
          opacity: isInitialized ? opacity : 0,
          filter: blur,
          pointerEvents: opacity < 0.1 ? 'none' : 'auto',
          transformStyle: 'preserve-3d'
        }}
        onMouseEnter={() => setHoveredId(episode.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => onEpisodeClick(episode)}
      >
        {/* Navigation Marker */}
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

        {/* Node Hexagon */}
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
              }`}
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

        {/* Tooltip Overlay */}
        <div 
          className={`
            absolute bottom-full mb-14 left-1/2 w-64 p-5 glass rounded-2xl shadow-2xl transition-all duration-500 pointer-events-none z-[300]
            ${isHovered ? 'opacity-100' : 'opacity-0 scale-95'}
            border-t-4 ${isCompleted ? 'border-violet-500' : isCurrentFocus ? 'border-cyan-500' : 'border-white/10'}
          `}
          style={{ 
            transform: isHovered 
              ? `translateX(-50%) translateY(0) rotateZ(12deg) rotateX(-62deg)` 
              : `translateX(-50%) translateY(20px) rotateZ(12deg) rotateX(-62deg)`,
            transformOrigin: 'bottom center',
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Segment {episode.number}</span>
            <div className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-green-500 shadow-[0_0_12px_#22c55e]' : 'bg-cyan-500 animate-pulse'}`} />
          </div>
          <h4 className="text-sm font-bold text-white tracking-tight mb-3 font-sans leading-tight line-clamp-2">{episode.title}</h4>
          <div className="flex items-center justify-between text-[10px] font-bold tracking-widest pt-3 border-t border-white/5 uppercase">
            <div className="flex items-center gap-2 text-slate-500 font-mono">
              <Clock size={12} /> {episode.duration || '24m'}
            </div>
            <span className={isCompleted ? 'text-violet-400' : 'text-slate-700'}>{isCompleted ? 'Synced' : 'Waiting'}</span>
          </div>
        </div>
      </div>
    );
  };

  const focusY = currentIndex * -145;

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-transparent select-none scene-3d">
      <style>{`
        @keyframes energy-pulse {
          0% { transform: translateY(0) scaleY(0.4); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(155px) scaleY(1); opacity: 0; }
        }
      `}</style>

      {/* 3D Container */}
      <div 
        className="container-3d absolute w-full h-full flex items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          transform: `rotateX(62deg) rotateZ(-12deg) translate3d(0, ${isCentered ? (-focusY - 140) * scale : 0}px, -100px) scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        <div className="relative transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
           {episodes.map((ep, i) => renderHexagonNode(ep, i))}
           
           {/* Finish line */}
           {episodes.length > 0 && (
             <div 
               className="absolute transition-all duration-1000"
               style={{
                 transform: `translate3d(${(episodes.length % 3 === 0 ? 0 : (episodes.length % 6 < 3 ? (episodes.length % 3) * 100 : (2 - (episodes.length % 3)) * 100)) - 100}px, ${episodes.length * -145}px, 0px)`,
                 opacity: 0.1,
                 transformStyle: 'preserve-3d'
               }}
             >
                <div className="w-[100px] h-[86px] flex items-center justify-center glass rounded-full border border-dashed border-white/20">
                   <Trophy size={28} className="text-slate-800" />
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="absolute top-10 right-10 flex flex-col gap-3">
         <button 
           onClick={() => setIsCentered(!isCentered)}
           className={`p-3 rounded-2xl glass border transition-all ${isCentered ? 'border-cyan-500/50 text-cyan-400' : 'border-white/10 text-slate-600 hover:text-white'}`}
         >
           <Target size={20} className={isCentered ? 'animate-pulse' : ''} />
         </button>
      </div>

      {/* Neural Fog Effects */}
      <div className="absolute inset-x-0 top-0 h-64 pointer-events-none bg-gradient-to-b from-[#0a0c12] to-transparent opacity-95" />
      <div className="absolute inset-x-0 bottom-0 h-64 pointer-events-none bg-gradient-to-t from-[#0a0c12] to-transparent opacity-95" />
    </div>
  );
};

export default HexagonPath;

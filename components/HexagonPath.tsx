
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
        const newScale = Math.min(1, width / 400);
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

    const xOffset = isEvenSegment ? stepInSegment * 90 : (2 - stepInSegment) * 90;
    const yOffset = index * -135; 

    const isCompleted = episode.isCompleted;
    const isCurrentFocus = index === currentIndex;
    const isNextToWatch = !isCompleted && (index === 0 || episodes[index - 1]?.isCompleted);
    const isHovered = hoveredId === episode.id;

    const distance = Math.abs(index - currentIndex);
    const opacity = Math.max(0.05, 1 - (distance * 0.15));
    const blur = distance > 4 ? `blur(${Math.min(distance - 3, 5)}px)` : 'none';

    return (
      <div 
        key={episode.id}
        className="absolute transition-all duration-1000 ease-in-out"
        style={{
          transform: `translate3d(${xOffset - 90}px, ${yOffset}px, 0px)`,
          zIndex: 100 - index,
          opacity: isInitialized ? opacity : 0,
          filter: blur,
          pointerEvents: opacity < 0.2 ? 'none' : 'auto',
          transformStyle: 'preserve-3d'
        }}
        onMouseEnter={() => setHoveredId(episode.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => onEpisodeClick(episode)}
      >
        {/* Navigation Marker - Also Billboarded */}
        {isCurrentFocus && (
          <div 
            className="absolute -top-20 left-1/2 flex flex-col items-center pointer-events-none z-[110]"
            style={{ 
              transform: `translateX(-50%) rotateZ(12deg) rotateX(-62deg)`,
              transformOrigin: 'bottom center'
            }}
          >
            <div className="bg-cyan-500 p-1.5 rounded-full shadow-[0_0_20px_#06b6d4] animate-pulse">
              <Navigation size={12} className="text-white fill-white" />
            </div>
            <div className="w-0.5 h-12 bg-gradient-to-t from-cyan-500 via-cyan-500/50 to-transparent" />
          </div>
        )}

        {/* Neural Conduit (Connector) */}
        {index < episodes.length - 1 && (
          <div 
            className="absolute pointer-events-none origin-top transition-all duration-700"
            style={{
              width: '4px',
              height: '145px',
              left: '50%',
              top: '35px',
              transform: `translateX(-50%) rotateZ(${isEvenSegment && stepInSegment < 2 ? '0deg' : !isEvenSegment && stepInSegment < 2 ? '0deg' : isEvenSegment ? '-34deg' : '34deg'})`,
              background: isCompleted 
                ? 'linear-gradient(to bottom, #8b5cf6, #4c1d95, transparent)' 
                : isNextToWatch 
                  ? 'linear-gradient(to bottom, #cbd5e1, #1e293b, transparent)'
                  : 'rgba(30, 41, 59, 0.1)',
            }}
          >
            {isCompleted && (
              <div className="absolute inset-x-0 h-8 bg-violet-400/40 blur-md animate-[energy-pulse_3s_linear_infinite]" />
            )}
          </div>
        )}

        {/* Volumetric Hexagon SVG Container */}
        <div className={`relative w-[90px] h-[78px] cursor-pointer group/hex transition-all duration-500 ${isHovered ? 'scale-110 -translate-y-4' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
          
          {/* Bottom Glow Plate */}
          <div className="absolute inset-0 transition-opacity duration-500 blur-xl translate-z-[-10px]" style={{ opacity: isCompleted ? 0.3 : isCurrentFocus ? 0.6 : 0 }}>
            <svg viewBox="0 0 100 86.6" className="w-full h-full">
              <polygon points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3" fill={isCompleted ? '#8b5cf6' : '#06b6d4'} />
            </svg>
          </div>

          {/* Main Hexagon Body */}
          <svg viewBox="0 0 100 86.6" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Hexagon Surface */}
            <polygon 
              points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3" 
              className={`transition-all duration-500 ${
                isCompleted ? 'fill-violet-950/90 stroke-violet-500' : 
                isCurrentFocus ? 'fill-slate-900 stroke-cyan-400' : 
                isNextToWatch ? 'fill-slate-100 stroke-white' : 
                'fill-black/95 stroke-white/10'
              }`}
              strokeWidth="2.5"
            />
            
            {/* Inner HUD Detailing */}
            {isCurrentFocus && (
              <polygon points="30,8 70,8 92,43.3 70,78.6 30,78.6 8,43.3" fill="none" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="4,2" className="animate-[spin_10s_linear_infinite] origin-center" />
            )}
          </svg>

          {/* Node Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={`text-[12px] font-mono font-black mb-0.5 tracking-tighter ${isNextToWatch ? 'text-black' : isCompleted ? 'text-violet-300' : 'text-slate-500'}`}>
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <div className="flex items-center justify-center">
              {isCompleted ? <Check size={14} className="text-violet-300" /> : 
               isCurrentFocus ? <Activity size={14} className="text-cyan-400 animate-pulse" /> :
               <Zap size={14} className={isNextToWatch ? 'text-violet-600' : 'text-slate-800'} />}
            </div>
          </div>
        </div>

        {/* Tooltip Overlay - Billboarded (Not Flattened) */}
        <div 
          className={`
            absolute bottom-full mb-10 left-1/2 w-64 p-4 glass border-t-4 rounded shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 pointer-events-none z-[300]
            ${isHovered ? 'opacity-100' : 'opacity-0 scale-90'}
            ${isCompleted ? 'border-violet-500' : isCurrentFocus ? 'border-cyan-500' : 'border-slate-800'}
          `}
          style={{ 
            transform: isHovered 
              ? `translateX(-50%) translateY(0) rotateZ(12deg) rotateX(-62deg)` 
              : `translateX(-50%) translateY(20px) rotateZ(12deg) rotateX(-62deg)`,
            transformOrigin: 'bottom center',
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">NODE_PULSE_{episode.number}</span>
            <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-cyan-500 animate-pulse'}`} />
          </div>
          <h4 className="text-[11px] font-bold text-white uppercase tracking-tighter mb-2 font-orbitron line-clamp-2">{episode.title}</h4>
          <div className="flex items-center justify-between text-[8px] font-mono tracking-widest pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock size={10} /> {episode.duration || '24m'}
            </div>
            <span className={isCompleted ? 'text-violet-400' : 'text-slate-700'}>{isCompleted ? 'SYNCED' : 'AWAITING'}</span>
          </div>
          
          {/* Arrow pointing down - Part of billboarded div so it stays upright too */}
          <div 
            className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] ${
              isCompleted ? 'border-t-violet-950/90' : isCurrentFocus ? 'border-t-slate-900' : 'border-t-black/95'
            }`}
          />
        </div>
      </div>
    );
  };

  const renderFinishLine = () => {
    const lastIndex = episodes.length;
    if (lastIndex === 0) return null;

    const segmentSize = 3;
    const segmentIndex = Math.floor(lastIndex / segmentSize);
    const stepInSegmentLocal = lastIndex % segmentSize;
    const isEvenSegmentLocal = segmentIndex % 2 === 0;

    const xOffset = isEvenSegmentLocal ? stepInSegmentLocal * 90 : (2 - stepInSegmentLocal) * 90;
    const yOffset = lastIndex * -135;
    const isCompletedAll = episodes.length > 0 && episodes.every(e => e.isCompleted);

    return (
      <div 
        className="absolute transition-all duration-1000"
        style={{
          transform: `translate3d(${xOffset - 90}px, ${yOffset}px, 0px)`,
          opacity: isCompletedAll ? 1 : 0.1,
          filter: isCompletedAll ? 'none' : 'grayscale(1)',
          transformStyle: 'preserve-3d'
        }}
      >
        <div className={`relative w-[90px] h-[78px] flex items-center justify-center transition-all ${isCompletedAll ? 'scale-125' : ''}`}>
           <svg viewBox="0 0 100 86.6" className="absolute inset-0 w-full h-full overflow-visible">
             <polygon points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="8,4" />
           </svg>
           <div className="flex flex-col items-center z-10" style={{ transform: `rotateZ(12deg) rotateX(-62deg)` }}>
             <Trophy size={20} className={isCompletedAll ? 'text-cyan-400' : 'text-slate-800'} />
             <span className="text-[7px] font-black text-cyan-500 mt-1 uppercase tracking-widest font-mono">FINAL_GATE</span>
           </div>
        </div>
      </div>
    );
  };

  const focusY = currentIndex * -135;

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-transparent select-none scene-3d">
      <style>{`
        @keyframes energy-pulse {
          0% { transform: translateY(0) scaleY(0.5); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(145px) scaleY(1); opacity: 0; }
        }
      `}</style>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* 3D Content Container */}
      <div 
        className="container-3d absolute w-full h-full flex items-center justify-center transform-gpu"
        style={{
          transform: `rotateX(62deg) rotateZ(-12deg) translate3d(0, ${isCentered ? (-focusY - 120) * scale : 0}px, -80px) scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        <div className="relative transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
           {episodes.map((ep, i) => renderHexagonNode(ep, i))}
           {renderFinishLine()}
        </div>
      </div>

      {/* Snap Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2">
         <button 
           onClick={() => setIsCentered(!isCentered)}
           className={`p-2.5 rounded-lg border transition-all ${isCentered ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-black/60 border-white/10 text-slate-700 hover:text-white'}`}
           title="Sync Neural Camera"
         >
           <Target size={16} className={isCentered ? 'animate-pulse' : ''} />
         </button>
      </div>

      {/* Depth Vignettes */}
      <div className="absolute inset-x-0 top-0 h-48 pointer-events-none bg-gradient-to-b from-[#010409] to-transparent opacity-95" />
      <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none bg-gradient-to-t from-[#010409] to-transparent opacity-95" />
    </div>
  );
};

export default HexagonPath;

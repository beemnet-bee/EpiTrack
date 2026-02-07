
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, RefreshCw, Zap, Settings, Activity } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title: string;
  onEnded: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play().catch(() => setError("UPLINK_CONNECTION_TIMEOUT"));
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) document.exitFullscreen();
      else videoRef.current.parentElement?.requestFullscreen();
    }
  };

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setError(null);
  }, [src]);

  return (
    <div 
      className="relative w-full h-full group bg-black overflow-hidden flex items-center justify-center font-mono rounded-xl border border-white/5"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Visual Scanning Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5 z-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      </div>

      <video
        ref={videoRef} src={src}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay} onTimeUpdate={handleTimeUpdate} onEnded={onEnded}
        onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
        onError={() => setError("DATA_PACKET_CORRUPTION")}
      />

      {error && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center z-50 animate-reveal">
          <div className="relative mb-6">
            <RefreshCw size={32} className="text-red-500 animate-spin" />
            <Activity size={16} className="absolute -bottom-1 -right-1 text-red-500 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-white mb-2 tracking-[0.4em] uppercase font-orbitron">SIGNAL_LOST</h3>
          <p className="text-[9px] text-red-500/60 font-bold uppercase tracking-widest font-mono">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 px-5 py-2 border border-red-500/20 text-red-500 text-[9px] uppercase tracking-widest hover:bg-red-500/10 transition-all font-bold"
          >
            RETRY_UPLINK
          </button>
        </div>
      )}

      {/* Play Overlay UI */}
      {!isPlaying && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-40 transition-all group-hover:bg-black/20" onClick={togglePlay}>
          <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.6)] transform group-hover:scale-110 transition-transform">
            <Play fill="white" size={24} className="text-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Cyber Controls */}
      <div className={`absolute bottom-0 inset-x-0 p-6 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-500 z-50 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative w-full h-1.5 flex items-center mb-6 group/seek">
          <input 
            type="range" min="0" max="100" step="0.01" value={progress} 
            onChange={handleProgressChange} 
            className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-violet-500 transition-all hover:h-2" 
          />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-violet-500 rounded-full pointer-events-none shadow-[0_0_8px_#8b5cf6]" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={togglePlay} className="text-slate-400 hover:text-white transition-all transform hover:scale-125">
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-600 tracking-[0.3em] uppercase mb-0.5">NEURAL_STREAM</span>
              <span className="text-[11px] font-bold text-white uppercase tracking-tight max-w-[200px] truncate font-orbitron">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-[10px] font-bold text-slate-500 tracking-widest font-mono">
               <span className="text-white">{videoRef.current ? Math.floor(videoRef.current.currentTime / 60) : 0}:{(videoRef.current ? Math.floor(videoRef.current.currentTime % 60) : 0).toString().padStart(2, '0')}</span>
               <span className="mx-3 text-slate-800 opacity-40">|</span>
               {videoRef.current && videoRef.current.duration ? Math.floor(videoRef.current.duration / 60) : 0}:{(videoRef.current && videoRef.current.duration ? Math.floor(videoRef.current.duration % 60) : 0).toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-4">
              <Settings size={16} className="text-slate-700 hover:text-slate-400 cursor-pointer transition-colors" />
              <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white transition-all transform hover:scale-110">
                <Maximize size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;


import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, RefreshCw, Zap, Settings } from 'lucide-react';

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
    else videoRef.current.play().catch(() => setError("UPLINK_ERROR_CODE_404"));
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
      className="relative w-full h-full group bg-black overflow-hidden flex items-center justify-center font-mono"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef} src={src}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay} onTimeUpdate={handleTimeUpdate} onEnded={onEnded}
        onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
        onError={() => setError("DATA_CORRUPTION_DETECTED")}
      />

      {error && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 text-center z-50">
          <RefreshCw size={24} className="text-red-500 mb-4 animate-spin" />
          <h3 className="text-xs font-bold text-white mb-2 tracking-widest uppercase">SYNC_FAILED</h3>
          <p className="text-[9px] text-slate-800 font-bold uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* Compact Overlay UI */}
      {!isPlaying && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-40" onClick={togglePlay}>
          <div className="w-12 h-12 bg-violet-600 rounded flex items-center justify-center shadow-2xl">
            <Play fill="white" size={20} className="text-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Slim Controls */}
      <div className={`absolute bottom-0 inset-x-0 p-4 pt-10 bg-gradient-to-t from-black to-transparent transition-all duration-300 z-50 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="relative w-full h-1 flex items-center mb-4 group/seek">
          <input type="range" min="0" max="100" step="0.01" value={progress} onChange={handleProgressChange} className="w-full h-0.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-violet-500" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-violet-600 rounded-full pointer-events-none" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-slate-400 hover:text-white transition-all"><Play size={16} /></button>
            <div className="flex flex-col">
              <span className="text-[7px] font-bold text-slate-600 tracking-widest">LIVE_SESSION</span>
              <span className="text-[9px] font-bold text-white uppercase tracking-tight max-w-[150px] truncate">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-[9px] font-bold text-slate-600 tracking-widest">
               {videoRef.current ? Math.floor(videoRef.current.currentTime / 60) : 0}:{(videoRef.current ? Math.floor(videoRef.current.currentTime % 60) : 0).toString().padStart(2, '0')} 
               <span className="mx-2 text-slate-800">|</span>
               {videoRef.current && videoRef.current.duration ? Math.floor(videoRef.current.duration / 60) : 0}:{(videoRef.current && videoRef.current.duration ? Math.floor(videoRef.current.duration % 60) : 0).toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-3">
              <Settings size={14} className="text-slate-700" />
              <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white"><Maximize size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

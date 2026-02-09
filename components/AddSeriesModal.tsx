
import React, { useState, useCallback, useEffect } from 'react';
import { X, Plus, Trash2, Info, Upload, FileVideo, CheckCircle2, Terminal, Target, Clock, MessageSquareQuote } from 'lucide-react';
import { Series, Episode } from '../types';

interface AddSeriesModalProps {
  onClose: () => void;
  onAdd: (series: Series) => void;
}

const AddSeriesModal: React.FC<AddSeriesModalProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Sci-Fi');
  const [episodes, setEpisodes] = useState<Partial<Episode>[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Helper to generate a deterministic placeholder image based on series title
  const getPlaceholderImage = (seed: string) => 
    `https://picsum.photos/seed/${encodeURIComponent(seed || 'node-archiver')}/800/450`;

  const extractEpisodeNumber = (fileName: string, fallback: number): number => {
    const nameWithoutExt = fileName.split('.')[0];
    const keywordMatch = nameWithoutExt.match(/(?:ep|episode|e|seg|segment)\s*(\d+)/i);
    if (keywordMatch && keywordMatch[1]) {
      return parseInt(keywordMatch[1], 10);
    }
    const allNumbers = nameWithoutExt.match(/\d+/g);
    if (allNumbers && allNumbers.length > 0) {
      const filtered = allNumbers.filter(n => !['720', '1080', '2160', '480', '264', '265'].includes(n));
      if (filtered.length > 0) {
        return parseInt(filtered[filtered.length - 1], 10);
      }
      return parseInt(allNumbers[allNumbers.length - 1], 10);
    }
    return fallback;
  };

  const addEpisodeTemplate = () => {
    setEpisodes(prev => {
      const nextNum = prev.length > 0 ? Math.max(...prev.map(e => e.number || 0)) + 1 : 1;
      // Priority: 1. coverImage, 2. placeholder from series title, 3. placeholder from generic name
      const thumb = coverImage.trim() || getPlaceholderImage(title || `segment-${nextNum}`);
      return [...prev, { 
        id: Math.random().toString(36).substr(2, 9), 
        number: nextNum, 
        title: `NODE_SEGMENT_${nextNum}`,
        sourceUrl: '',
        description: '',
        duration: '24m',
        isCompleted: false,
        thumbnail: thumb
      }];
    });
  };

  const removeEpisode = (id: string) => {
    setEpisodes(prev => prev.filter(e => e.id !== id));
  };

  const updateEpisode = (id: string, fields: Partial<Episode>) => {
    setEpisodes(prev => prev.map(e => e.id === id ? { ...e, ...fields } : e));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const processFiles = (files: File[]) => {
    setEpisodes(prev => {
      const currentCount = prev.length;
      const newEps = files.map((file, idx) => {
        const extractedNum = extractEpisodeNumber(file.name, currentCount + idx + 1);
        // Priority: 1. coverImage, 2. placeholder from series title, 3. placeholder from filename
        const thumb = coverImage.trim() || getPlaceholderImage(title || file.name);
        return {
          id: Math.random().toString(36).substr(2, 9),
          number: extractedNum,
          title: file.name.split('.')[0].replace(/[_\-]/g, ' ').toUpperCase(),
          sourceUrl: URL.createObjectURL(file),
          description: `Linked source: ${file.name}`,
          duration: '24m',
          isCompleted: false,
          thumbnail: thumb
        };
      });
      return [...prev, ...newEps].sort((a, b) => (a.number || 0) - (b.number || 0));
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || episodes.length === 0) return;

    // Determine final cover for the series
    const finalCover = coverImage.trim() || getPlaceholderImage(title);

    // Map through episodes to ensure all have a valid thumbnail on submission
    const formattedEpisodes = episodes.map(ep => ({
      ...ep,
      id: ep.id || Math.random().toString(36).substr(2, 9),
      number: ep.number || 0,
      title: ep.title || 'Untitled Node',
      description: ep.description || '',
      sourceUrl: ep.sourceUrl || '',
      duration: ep.duration || 'N/A',
      isCompleted: !!ep.isCompleted,
      // If the thumbnail is missing or was a placeholder, we use finalCover as the authoritative source
      thumbnail: ep.thumbnail && ep.thumbnail.trim() !== "" ? ep.thumbnail : finalCover
    })) as Episode[];

    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim(),
      coverImage: finalCover,
      category,
      episodes: formattedEpisodes.sort((a, b) => a.number - b.number),
      createdAt: Date.now()
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-reveal font-sans">
      <div className="bg-[#0a0c12] border border-white/10 rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] flex flex-col shadow-3xl overflow-hidden glass-premium">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-violet-500 border border-white/10">
              <Terminal size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] font-orbitron leading-none">Initialize Archive Node</h2>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest">Protocol Version 4.0.2</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form id="series-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-12 scroll-smooth custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Target size={14} className="text-violet-500" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Node Configuration</span>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Target Identifier</label>
                  <input 
                    required 
                    autoFocus 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-violet-500/40 focus:ring-4 focus:ring-violet-500/5 outline-none transition-all placeholder:text-slate-800" 
                    placeholder="Enter series title..." 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Classification</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)} 
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white appearance-none cursor-pointer outline-none focus:border-violet-500/40 transition-all"
                    >
                      {['Action', 'Animation', 'Drama', 'Fantasy', 'Sci-Fi', 'Thriller'].map(cat => (
                        <option key={cat} className="bg-[#0a0c12]" value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Cover Source (URL)</label>
                    <input 
                      value={coverImage} 
                      onChange={(e) => setCoverImage(e.target.value)} 
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-violet-500/40 transition-all placeholder:text-slate-800" 
                      placeholder="https://..." 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Synopsis Buffer</label>
                  <textarea 
                    rows={4} 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white resize-none outline-none focus:border-violet-500/40 transition-all placeholder:text-slate-800" 
                    placeholder="Enter node summary..." 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Upload size={14} className="text-cyan-500" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Source Linkage</span>
              </div>
              <div 
                onDragEnter={handleDrag} 
                onDragLeave={handleDrag} 
                onDragOver={handleDrag} 
                onDrop={handleDrop} 
                className={`relative border-2 border-dashed rounded-[2rem] h-56 flex flex-col items-center justify-center text-center gap-4 transition-all group ${dragActive ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/5 bg-black/20 hover:border-slate-800 hover:bg-black/30'}`}
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-cyan-500 group-hover:scale-110 transition-all">
                  <Upload size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Drop archive segments here</span>
                  <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">Automatic Parsing Protocol v2</p>
                </div>
                <input 
                  type="file" 
                  multiple 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => { if (e.target.files) processFiles(Array.from(e.target.files)); }} 
                />
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-10 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-6 bg-violet-600 rounded-full" />
                <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em] font-orbitron">Sequence Stack [{episodes.length}]</h3>
              </div>
              <button 
                type="button" 
                onClick={addEpisodeTemplate} 
                className="flex items-center gap-3 px-5 py-2.5 glass rounded-xl border border-violet-500/30 text-violet-400 text-[10px] font-bold hover:bg-violet-600/10 tracking-widest uppercase transition-all"
              >
                <Plus size={14} /> Add Manual Node
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {episodes.map((ep) => (
                <div key={ep.id} className="p-6 glass border border-white/5 rounded-3xl space-y-5 relative group hover:border-violet-500/20 transition-all animate-reveal">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-violet-500 text-sm font-mono font-bold border border-white/10 group-hover:border-violet-500/30 transition-colors">
                        {ep.number}
                      </div>
                      <input 
                        value={ep.title} 
                        onChange={(e) => updateEpisode(ep.id!, { title: e.target.value })} 
                        className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-white focus:ring-0 uppercase tracking-tight outline-none" 
                        placeholder="Segment Title..." 
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeEpisode(ep.id!)} 
                      className="text-slate-700 hover:text-red-500 transition-all p-2 bg-white/5 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row justify-end gap-6 items-center">
          <button 
            type="button" 
            onClick={onClose} 
            className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            Abort Protocol
          </button>
          <button 
            type="submit" 
            form="series-form" 
            disabled={!title || episodes.length === 0} 
            className="w-full sm:w-auto px-10 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] font-orbitron hover:scale-105 active:scale-95"
          >
            Execute Deployment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSeriesModal;

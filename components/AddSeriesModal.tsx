
import React, { useState, useCallback } from 'react';
import { X, Plus, Trash2, Info, Upload, FileVideo, CheckCircle2, Terminal, Target, Clock, MessageSquareQuote } from 'lucide-react';
import { Series, Episode } from '../types';

interface AddSeriesModalProps {
  onClose: () => void;
  onAdd: (series: Series) => void;
}

const DURATION_OPTIONS = ['24m', '30m', '45m', '60m', 'N/A'];

const AddSeriesModal: React.FC<AddSeriesModalProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Sci-Fi');
  const [episodes, setEpisodes] = useState<Partial<Episode>[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const addEpisodeTemplate = () => {
    setEpisodes(prev => {
      const nextNum = prev.length + 1;
      return [...prev, { 
        id: Math.random().toString(36).substr(2, 9), 
        number: nextNum, 
        title: `NODE_SEGMENT_${nextNum}`,
        sourceUrl: '',
        description: '',
        duration: '24m',
        isCompleted: false
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files) as File[];
      setEpisodes(prev => {
        const currentCount = prev.length;
        const newEps = files.map((file, idx) => ({
          id: Math.random().toString(36).substr(2, 9),
          number: currentCount + idx + 1,
          title: file.name.split('.')[0].replace(/[_\-]/g, ' ').toUpperCase(),
          sourceUrl: URL.createObjectURL(file),
          description: `SOURCE_LINKED: ${file.name}`,
          duration: '24m',
          isCompleted: false
        }));
        return [...prev, ...newEps];
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || episodes.length === 0) return;

    const formattedEpisodes = episodes.map(ep => ({
      ...ep,
      id: ep.id || Math.random().toString(36).substr(2, 9),
      number: ep.number || 0,
      title: ep.title || 'Untitled Node',
      description: ep.description || '',
      sourceUrl: ep.sourceUrl || '',
      duration: ep.duration || 'N/A',
      isCompleted: !!ep.isCompleted
    })) as Episode[];

    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim(),
      coverImage: coverImage.trim() || `https://picsum.photos/seed/${title}/400/600`,
      category,
      episodes: formattedEpisodes,
      createdAt: Date.now()
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-reveal font-mono">
      <div className="bg-[#0d1117] border border-white/5 rounded-lg w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-slate-900 border border-white/10 rounded flex items-center justify-center text-violet-500">
              <Terminal size={14} />
            </div>
            <h2 className="text-[10px] font-bold text-white uppercase tracking-widest font-orbitron">INITIALIZE_DATA_NODE_PROTOCOL</h2>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-red-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <form id="series-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Metadata Left */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 opacity-30 border-b border-white/5 pb-1">
                <Target size={10} className="text-violet-500" />
                <span className="text-[8px] font-bold uppercase tracking-widest">ARCHIVE_PARAM_CONFIG</span>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-slate-700 uppercase tracking-widest pl-1">TARGET_IDENTIFIER</label>
                  <input 
                    required 
                    autoFocus
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full bg-black/60 border border-white/5 rounded px-3 py-1.5 text-[10px] text-white focus:border-violet-500/40 outline-none font-mono" 
                    placeholder="ENTER_TITLE..." 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[7px] font-bold text-slate-700 uppercase tracking-widest pl-1">CLASS_CATEGORY</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)} 
                      className="w-full bg-black/60 border border-white/5 rounded px-3 py-1.5 text-[10px] text-white appearance-none cursor-pointer outline-none focus:border-violet-500/40"
                    >
                      {['Action', 'Animation', 'Drama', 'Fantasy', 'Sci-Fi', 'Thriller'].map(cat => (
                        <option key={cat} className="bg-[#0d1117]" value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-bold text-slate-700 uppercase tracking-widest pl-1">VISUAL_SOURCE_URI</label>
                    <input 
                      value={coverImage} 
                      onChange={(e) => setCoverImage(e.target.value)} 
                      className="w-full bg-black/60 border border-white/5 rounded px-3 py-1.5 text-[10px] text-white outline-none focus:border-violet-500/40" 
                      placeholder="HTTPS://..." 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-slate-700 uppercase tracking-widest pl-1">SYNOPSIS_BUFFER</label>
                  <textarea 
                    rows={3} 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="w-full bg-black/60 border border-white/5 rounded px-3 py-1.5 text-[10px] text-white resize-none outline-none focus:border-violet-500/40" 
                    placeholder="ENTER_DATA_SUMMARY..." 
                  />
                </div>
              </div>
            </div>

            {/* Source Right */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 opacity-30 border-b border-white/5 pb-1">
                <Upload size={10} className="text-cyan-500" />
                <span className="text-[8px] font-bold uppercase tracking-widest">SOURCE_STREAM_LINKAGE</span>
              </div>
              
              <div 
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                className={`relative border border-dashed rounded h-32 flex flex-col items-center justify-center text-center gap-2 transition-all ${dragActive ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/5 bg-black/20 hover:border-slate-800'}`}
              >
                <Upload size={16} className="text-slate-700" />
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">DROP_NODE_FILES_HERE</span>
                <p className="text-[7px] text-slate-800">AUTOMATIC_MAPPING_PROTOCOL</p>
                <input 
                  type="file" 
                  multiple 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files) as File[];
                      setEpisodes(prev => {
                        const currentCount = prev.length;
                        return [...prev, ...files.map((file, idx) => ({ 
                          id: Math.random().toString(36).substr(2,9), 
                          number: currentCount + idx + 1, 
                          title: file.name.split('.')[0].replace(/[_\-]/g, ' ').toUpperCase(), 
                          sourceUrl: URL.createObjectURL(file), 
                          duration: '24m', 
                          description: `LOCAL_FILE: ${file.name}`,
                          isCompleted: false 
                        }))];
                      });
                    }
                  }} 
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-cyan-500/5 rounded border border-cyan-500/10">
                <Info size={12} className="text-cyan-600 mt-0.5 flex-shrink-0" />
                <p className="text-[7px] text-slate-600 font-bold uppercase tracking-widest leading-tight">
                  WARNING: SESSION_PERSISTENCE_LIMITATION. <br />
                  LOCAL_FILES_ARE_MAPPED_TO_BLOB_URIs. <br />
                  FOR_PERMANENT_PATH_STORAGE_USE_ONLINE_URLs_OR_MANUAL_STRING_PATHS.
                </p>
              </div>
            </div>
          </div>

          {/* Episode Nodes List */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={10} className="text-violet-500" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">NODE_SEQUENCE_STACK [{episodes.length}]</span>
              </div>
              <button 
                type="button" 
                onClick={addEpisodeTemplate} 
                className="px-2 py-1 bg-violet-600/10 border border-violet-500/20 rounded text-[7px] font-bold text-violet-400 hover:bg-violet-600/20 tracking-widest uppercase transition-colors"
              >
                + ADD_MANUAL_NODE
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {episodes.map((ep) => (
                <div key={ep.id} className="p-3 bg-black/40 border border-white/5 rounded space-y-3 relative group hover:border-violet-500/20 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-slate-900 border border-white/10 rounded flex items-center justify-center text-violet-500 text-[9px] font-black">{ep.number}</div>
                      <input 
                        value={ep.title} 
                        onChange={(e) => updateEpisode(ep.id!, { title: e.target.value.toUpperCase() })} 
                        className="flex-1 bg-transparent border-none p-0 text-[9px] font-bold text-white focus:ring-0 uppercase tracking-tighter outline-none" 
                        placeholder="NODE_NAME..."
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeEpisode(ep.id!)} 
                      className="text-slate-700 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex gap-2">
                      <div className="w-1/3">
                        <select 
                          value={ep.duration} 
                          onChange={(e) => updateEpisode(ep.id!, { duration: e.target.value })} 
                          className="w-full bg-black border border-white/5 rounded px-2 py-1 text-[8px] text-slate-400 outline-none focus:border-violet-500/30"
                        >
                          {DURATION_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-[#0d1117]">{opt}</option>)}
                        </select>
                      </div>
                      <div className="w-2/3">
                        <input 
                          value={ep.sourceUrl} 
                          onChange={(e) => updateEpisode(ep.id!, { sourceUrl: e.target.value })} 
                          className="w-full bg-black border border-white/5 rounded px-2 py-1 text-[8px] text-slate-400 outline-none focus:border-violet-500/30" 
                          placeholder="STREAM_SOURCE_PATH..." 
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquareQuote size={10} className="text-slate-800 flex-shrink-0" />
                      <input 
                        value={ep.description} 
                        onChange={(e) => updateEpisode(ep.id!, { description: e.target.value })} 
                        className="w-full bg-transparent border-b border-white/5 py-0.5 text-[8px] text-slate-600 outline-none focus:border-violet-500/20 italic" 
                        placeholder="ENTER_SEGMENT_DESCRIPTION..." 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {episodes.length === 0 && (
              <div className="text-center py-6 border border-dashed border-white/5 rounded opacity-20">
                <span className="text-[8px] font-bold uppercase tracking-widest">AWAITING_NODE_INPUT</span>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-black/40 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose} 
            className="px-4 py-2 text-slate-700 text-[9px] font-bold uppercase tracking-widest hover:text-slate-400 transition-colors"
          >
            ABORT_INIT
          </button>
          <button 
            type="submit"
            form="series-form"
            disabled={!title || episodes.length === 0} 
            className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded text-[9px] font-bold uppercase tracking-widest disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          >
            EXECUTE_DEPLOYMENT
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSeriesModal;

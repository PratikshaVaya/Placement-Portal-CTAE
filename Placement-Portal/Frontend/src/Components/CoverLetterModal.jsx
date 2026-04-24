import React from 'react';

const CoverLetterModal = ({ isOpen, content, title, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle backdrop-blur-md z-[9999]">
      <div className="modal-box bg-slate-900 border border-white/10 shadow-2xl p-8 rounded-[2.5rem] max-w-2xl relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -ml-12 -mb-12"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              {title || "Cover Letter"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        <div className="relative z-10">
          <div className="p-8 rounded-3xl bg-white/5 border border-white/5 shadow-inner max-h-[70vh] overflow-y-auto custom-scrollbar">
            <p className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap font-semibold mb-6">
              {content || "No cover letter content provided."}
            </p>
          </div>
        </div>

        <div className="modal-action mt-10 relative z-10">
          <button
            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            onClick={onClose}
          >
            Close Viewer
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/60" onClick={onClose}>
        <button className="cursor-default">close</button>
      </div>
    </div>
  );
};

export default CoverLetterModal;

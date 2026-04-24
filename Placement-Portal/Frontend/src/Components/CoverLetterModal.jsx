import React, { useEffect } from 'react';
import { FiX, FiFileText } from 'react-icons/fi';

const CoverLetterModal = ({ isOpen, content, title, onClose }) => {
  // Handle Escape key to close
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop with enhanced blur */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none"></div>

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <FiFileText className="text-xl text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {title || "Cover Letter"}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Document Viewer</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="group p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all duration-300 active:scale-95"
            aria-label="Close modal"
          >
            <FiX className="text-2xl group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Breathable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-12 lg:p-16">
          <div className="relative">
            {/* The actual letter paper effect */}
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-50 mb-10"></div>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-200 text-lg sm:text-xl leading-[1.8] whitespace-pre-wrap font-medium tracking-wide">
                  {content || "No cover letter content provided."}
                </p>
              </div>
              
              <div className="pt-12 border-t border-white/5">
                <p className="text-slate-500 text-sm italic">
                  End of document
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Action */}
        <div className="px-8 py-6 border-t border-white/5 bg-slate-900/80 backdrop-blur-md flex justify-end">
          <button
            className="group px-8 py-3 rounded-xl bg-white text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl active:scale-95 flex items-center gap-2"
            onClick={onClose}
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterModal;


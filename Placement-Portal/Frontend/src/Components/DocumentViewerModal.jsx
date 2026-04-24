import React, { useEffect } from 'react';
import { FiX, FiFileText, FiMaximize2 } from 'react-icons/fi';

const DocumentViewerModal = ({ isOpen, isLoading, fileUrl, error, title, onClose }) => {
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
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <FiMaximize2 className="text-lg text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white tracking-tight">{title || 'Document Viewer'}</h4>
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Secure Preview</p>
                        </div>
                    </div>
                    
                    <button 
                        className="group p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all duration-300" 
                        onClick={onClose}
                    >
                        <FiX className="text-xl group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-slate-950 relative overflow-hidden">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/50">
                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-medium animate-pulse text-sm tracking-widest uppercase">Fetching Document...</p>
                        </div>
                    )}
                    
                    {!isLoading && error && (
                        <div className="h-full w-full flex flex-col items-center justify-center text-center p-12">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                                <FiX className="text-2xl text-red-500" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">Unable to Load Document</h3>
                            <p className="text-slate-400 max-w-md leading-relaxed">{error}</p>
                            <button 
                                onClick={onClose}
                                className="mt-8 px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                Close Preview
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && fileUrl && (
                        <iframe 
                            title={title || 'Document Viewer'} 
                            src={fileUrl} 
                            className="w-full h-full border-none"
                        />
                    )}
                </div>

                {/* Footer action (Optional, but adds to breathability) */}
                <div className="px-8 py-4 bg-slate-900 border-t border-white/5 flex justify-end">
                     <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mr-auto flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Encrypted Connection
                     </p>
                     <button 
                        className="px-6 py-2 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all" 
                        onClick={onClose}
                     >
                        Close Viewer
                     </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewerModal;


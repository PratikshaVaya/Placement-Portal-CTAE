const DocumentViewerModal = ({ isOpen, isLoading, fileUrl, error, title, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-5xl h-[85vh] rounded-2xl border border-white/10 bg-slate-950 shadow-2xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <h4 className="text-white font-semibold">{title || 'Document Viewer'}</h4>
                    <button className="btn btn-sm btn-ghost text-white" onClick={onClose}>
                        Close
                    </button>
                </div>
                <div className="flex-1 bg-slate-900">
                    {isLoading && (
                        <div className="h-full w-full flex items-center justify-center text-slate-300">
                            Loading document...
                        </div>
                    )}
                    {!isLoading && error && (
                        <div className="h-full w-full flex items-center justify-center text-red-300 px-8 text-center">
                            {error}
                        </div>
                    )}
                    {!isLoading && !error && fileUrl && (
                        <iframe title={title || 'Document Viewer'} src={fileUrl} className="w-full h-full" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentViewerModal;

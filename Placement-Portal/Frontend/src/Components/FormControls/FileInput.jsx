import { useState } from 'react';

const FileInput = ({ name, label, accept, required = false, onChange }) => {
  const [fileName, setFileName] = useState('No file chosen');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : 'No file chosen');
    if (onChange) onChange(e);
  };

  return (
    <div className="form-control w-full space-y-2 group">
      <label htmlFor={name} className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          {label}
        </span>
        {required && <span className="text-indigo-500 text-[10px]">*</span>}
      </label>
      <div className="relative group/file">
        <input
          id={name}
          type="file"
          name={name}
          className="hidden"
          accept={accept}
          required={required}
          onChange={handleFileChange}
        />
        <label
          htmlFor={name}
          className="flex items-center justify-between w-full bg-black/20 border border-white/10 rounded-2xl p-1 pr-6 cursor-pointer hover:border-indigo-500/50 transition-all group-focus-within:border-indigo-500/50 shadow-inner overflow-hidden"
        >
          <div className="px-6 py-3 rounded-xl bg-white/5 text-indigo-400 font-bold text-xs uppercase tracking-widest border border-white/5 group-hover/file:bg-indigo-500 group-hover/file:text-white transition-all">
            Choose File
          </div>
          <span className="text-slate-400 text-xs font-medium ml-4 truncate flex-1 text-right">
            {fileName}
          </span>
        </label>
      </div>
    </div>
  );
};

export default FileInput;

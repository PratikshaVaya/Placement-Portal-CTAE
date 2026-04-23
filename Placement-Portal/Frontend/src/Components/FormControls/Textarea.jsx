import { useState } from 'react';

const Textarea = ({
  label,
  name,
  placeholder,
  defaultValue,
  className = '',
  required = false,
  rows = 4,
}) => {
  return (
    <div className="form-control w-full space-y-2 group">
      <label htmlFor={name} className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          {label}
        </span>
        {required && <span className="text-indigo-500 text-[10px]">*</span>}
      </label>
      <textarea
        className={`w-full bg-black/20 border border-white/10 rounded-[1.5rem] p-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner resize-none whitespace-pre-line ${className}`}
        placeholder={placeholder}
        name={name}
        id={name}
        defaultValue={defaultValue}
        rows={rows}
        required={required}
      />
    </div>
  );
};
export default Textarea;

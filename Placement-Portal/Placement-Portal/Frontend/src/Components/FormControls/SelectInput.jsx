import { useState, useEffect } from 'react';

const SelectInput = ({
  label,
  name,
  options,
  id,
  changeFn,
  defaultValue,
  emptyMessage,
  size,
  required = true,
  className = '',
  labelColor = 'text-slate-300',
}) => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
    if (changeFn) changeFn(e);
  };

  useEffect(() => {
    setSelectedOption(defaultValue);
  }, [defaultValue]);

  return (
    <div className="form-control w-full space-y-2 group">
      <label htmlFor={name} className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          {label}
        </span>
        {required && <span className="text-indigo-500 text-[10px]">*</span>}
      </label>
      {options.length ? (
        <div className="relative">
          <select
            name={name}
            id={id || name}
            value={selectedOption}
            className={`w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner cursor-pointer appearance-none ${size} ${className}`}
            onChange={handleSelectChange}
            required={required}
          >
            {options.map((item) => {
              return (
                <option key={item.value} value={item.value} className="bg-slate-900 text-white capitalize">
                  {item.text || item.value}
                </option>
              );
            })}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 italic mt-1">{emptyMessage}</p>
      )}
    </div>
  );
};

export default SelectInput;

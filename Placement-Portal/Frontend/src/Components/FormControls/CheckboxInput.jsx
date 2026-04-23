import { useState } from 'react';

const CheckboxInput = ({ 
  label, 
  name, 
  options, 
  defaultValues = [], 
  emptyMsg, 
  onChange,
  labelColor = 'text-slate-300'
}) => {
  const [selected, setSelected] = useState(defaultValues);

  const handleToggle = (value) => {
    let newSelected;
    if (selected.includes(value)) {
      newSelected = selected.filter(v => v !== value);
    } else {
      newSelected = [...selected, value];
    }
    setSelected(newSelected);
    if (onChange) onChange({ target: { name, value: newSelected } });
  };

  return (
    <div className="form-control w-full space-y-3 group">
      <label className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          {label}
        </span>
      </label>
      
      {options.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {options.map((option) => {
            const isChecked = selected.includes(option.value);
            return (
              <label
                key={option.value}
                className={`relative flex items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer select-none group/opt ${
                  isChecked 
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                  : 'bg-black/20 border-white/5 text-slate-500 hover:border-white/20'
                }`}
              >
                <input
                  type="checkbox"
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  onChange={() => handleToggle(option.value)}
                  className="absolute opacity-0"
                />
                <span className={`text-[10px] font-black uppercase tracking-tighter text-center transition-colors ${isChecked ? 'text-indigo-400' : 'group-hover/opt:text-slate-300'}`}>
                  {option.text}
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-black/10 border border-dashed border-white/5 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{emptyMsg}</span>
        </div>
      )}
    </div>
  );
};

export default CheckboxInput;

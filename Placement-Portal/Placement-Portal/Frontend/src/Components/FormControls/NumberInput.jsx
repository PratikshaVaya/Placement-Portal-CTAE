const NumberInput = ({
  label,
  name,
  defaultValue,
  size,
  minValue,
  maxValue,
  step,
  required = true,
  placeholder,
  className = '',
  labelColor = 'text-slate-300',
}) => {
  return (
    <div className="form-control w-full space-y-2 group">
      <label htmlFor={name} className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          {label}
        </span>
      </label>
      <input
        type="number"
        name={name}
        id={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner ${size} ${className}`}
        min={minValue}
        max={maxValue}
        step={step}
        required={required}
      />
    </div>
  );
};
export default NumberInput;

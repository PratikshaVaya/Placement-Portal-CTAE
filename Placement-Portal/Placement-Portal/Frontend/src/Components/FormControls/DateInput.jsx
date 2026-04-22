const DateInput = ({
  label,
  name,
  defaultValue,
  size,
  minDate,
  maxDate,
  isRequired = true,
  className = '',
  labelColor = 'text-slate-300',
}) => {
  return (
    <div className="form-control w-full space-y-2 group">
      <label htmlFor={name} className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          {label}
        </span>
        {isRequired && <span className="text-indigo-500 text-[10px]">*</span>}
      </label>
      <input
        type="date"
        name={name}
        id={name}
        defaultValue={defaultValue}
        className={`w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner appearance-none cursor-pointer ${size} ${className}`}
        min={minDate}
        max={maxDate}
        required={isRequired}
      />
    </div>

  );
};
export default DateInput;

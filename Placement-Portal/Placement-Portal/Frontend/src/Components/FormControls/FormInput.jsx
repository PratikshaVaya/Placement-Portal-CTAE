const FormInput = ({
  label,
  name,
  type,
  defaultValue,
  size,
  placeholder,
  isRequired = true,
  className = '',
  labelColor = 'text-slate-300',
  icon: Icon,
}) => {
  return (
    <div className="form-control w-full space-y-2 group">
      <label htmlFor={name} className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          {label}
        </span>
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          id={name}
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner ${
            Icon ? 'pl-14' : ''
          } ${size} ${className}`}
          required={isRequired}
        />
      </div>
    </div>
  );
};
export default FormInput;

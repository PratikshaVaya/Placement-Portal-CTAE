const FormInput = ({
  label,
  name,
  type,
  defaultValue,
  size,
  isRequired = true,
  className = '',
  labelColor = 'text-slate-300',
  icon: Icon,
}) => {
  return (
    <div className="form-control w-full">
      <label htmlFor={name} className="label py-1.5">
        <span className={`text-sm font-semibold capitalize ${labelColor}`}>
          {label}
        </span>
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors z-10">
            <Icon size={18} />
          </div>
        )}
        <input
          id={name}
          type={type}
          name={name}
          defaultValue={defaultValue}
          className={`input input-bordered w-full transition-all duration-200 bg-slate-800/50 text-white border-white/10 focus:border-indigo-500 ${
            Icon ? 'pl-11' : ''
          } ${size} ${className}`}
          required={isRequired}
        />
      </div>
    </div>
  );
};
export default FormInput;

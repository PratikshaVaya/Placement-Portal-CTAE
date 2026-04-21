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
    <div className="form-control w-full">
      <label htmlFor={name} className="label py-1.5">
        <span className={`text-sm font-semibold capitalize ${labelColor}`}>{label}</span>
      </label>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        className={`input input-bordered w-full transition-all duration-200 bg-slate-800/50 text-white border-white/10 focus:border-indigo-500 ${size} ${className}`}
        min={minValue}
        max={maxValue}
        step={step}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};
export default NumberInput;

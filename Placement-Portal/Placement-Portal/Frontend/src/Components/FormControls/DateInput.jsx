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
    <div className="form-control w-full">
      <label htmlFor={name} className="label py-1.5">
        <span className={`text-sm font-semibold capitalize ${labelColor}`}>{label}</span>
      </label>
      <input
        type="date"
        name={name}
        defaultValue={defaultValue}
        className={`input input-bordered w-full transition-all duration-200 bg-slate-800/50 text-white border-white/10 focus:border-indigo-500 ${size} ${className}`}
        min={minDate}
        max={maxDate}
        required={isRequired}
      />
    </div>
  );
};
export default DateInput;

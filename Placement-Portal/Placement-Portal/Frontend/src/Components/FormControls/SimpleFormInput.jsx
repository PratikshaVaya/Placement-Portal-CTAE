const SimpleFormInput = ({ name, type, label, defaultValue, className = '' }) => {
  return (
    <div className="form-control w-full">
      <label htmlFor={name} className="label py-1.5">
        <span className="capitalize font-semibold text-sm text-slate-300">{label}</span>
      </label>
      <input
        id={name}
        type={type}
        name={name}
        defaultValue={defaultValue}
        className={`bg-transparent border-b-2 border-white/20 text-white focus:border-indigo-500 focus:outline-none py-2 transition-all ${className}`}
      />
    </div>
  );
};
export default SimpleFormInput;

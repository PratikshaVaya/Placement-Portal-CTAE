const CheckboxInput = ({ 
  label, 
  name, 
  options, 
  defaultValues, 
  emptyMsg, 
  onChange,
  labelColor = 'text-slate-300'
}) => {
  return (
    <div className="form-control w-full">
      <label className="label py-1.5">
        <span className={`text-sm font-semibold capitalize ${labelColor}`}>{label}</span>
      </label>

      <div className="flex flex-wrap gap-4 px-1">
        {options.length ? (
          options.map((option) => {
            const { text, value } = option;
            const checked = defaultValues?.includes(value);
            return (
              <label
                key={value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={value}
                  name={name}
                  className="checkbox checkbox-primary border-white/30"
                  defaultChecked={checked}
                  onChange={onChange}
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{text}</span>
              </label>
            );
          })
        ) : (
          <p className="text-sm text-slate-500 italic">{emptyMsg}</p>
        )}
      </div>
    </div>
  );
};
export default CheckboxInput;

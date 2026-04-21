import { useState, useEffect } from 'react';

const SelectInput = ({
  label,
  name,
  options,
  id,
  changeFn,
  defaultValue,
  emptyMessage,
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
    <div className="form-control w-full">
      <label className="label py-1.5">
        <span className={`text-sm font-semibold capitalize ${labelColor}`}>
          {label}
        </span>
      </label>
      {options.length ? (
        <select
          className={`select select-bordered w-full transition-all duration-200 bg-slate-800/50 text-white border-white/10 focus:border-indigo-500 ${className}`}
          id={id}
          onChange={handleSelectChange}
          name={name}
          value={selectedOption}
          required
        >
          {options.map((option) => {
            const { text, value } = option;
            return (
              <option key={value} value={value} className="bg-slate-900 text-white capitalize">
                {text}
              </option>
            );
          })}
        </select>
      ) : (
        <p className="text-sm text-slate-500 italic mt-1">{emptyMessage}</p>
      )}
    </div>
  );
};
export default SelectInput;

import { useState } from 'react';

const Textarea = ({
  label,
  name,
  placeholder,
  defaultValue,
  className = '',
  labelColor = 'text-slate-300',
}) => {
  return (
    <div className="form-control w-full">
      <label htmlFor={name} className="label py-1.5">
        <span className={`text-sm font-semibold capitalize ${labelColor}`}>
          {label}
        </span>
      </label>
      <textarea
        className={`textarea textarea-bordered whitespace-pre-line p-4 w-full transition-all duration-200 ${className}`}
        placeholder={placeholder}
        name={name}
        defaultValue={defaultValue}
      />
    </div>
  );
};
export default Textarea;

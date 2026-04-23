const MultipleInputs = ({
  label,
  name,
  type,
  defaultValue,
  manageFields,
}) => {
  return (
    <div className="form-control w-full space-y-4 group">
      <div className="flex items-center justify-between px-1">
        <label htmlFor={name} className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            {label}
          </span>
        </label>
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-95"
          onClick={() => {
            manageFields([...defaultValue, '']);
          }}
        >
          + Add Skill
        </button>
      </div>
      <div id={`${name}Container`} className="flex gap-3 flex-wrap animate-in fade-in slide-in-from-bottom-2 duration-500">
        {defaultValue.map((value, idx) => {
          return (
            <input
              type={type}
              name={`${name}`}
              defaultValue={value}
              placeholder="Enter skill..."
              className="bg-black/40 border border-white/10 rounded-xl py-3 px-5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-xl hover:bg-black/60 w-full sm:w-auto min-w-[180px]"
              key={`${name}-${idx}`}
              required
            />
          );
        })}
      </div>
    </div>
  );
};
export default MultipleInputs;

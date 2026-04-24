const ScoreFieldInput = ({ type, label, data, semesterNum }) => {
  return (
    <div className="form-control">
      <label className="label">
        <span className="capitalize font-bold text-slate-300">{label}</span>
      </label>
      <div className="flex flex-col gap-4">
        <input
          disabled={type === 'public'}
          type="number"
          name={`gpa-${semesterNum}`}
          placeholder="GPA Score"
          defaultValue={data?.gpa}
          min="1"
          max="10"
          step="0.01"
          className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/20 !text-white placeholder:!text-slate-400 focus:border-indigo-500 focus:outline-none transition-all font-bold text-sm shadow-inner"
        />
        <input
          disabled={type === 'public'}
          type="number"
          name={`backsCount-${semesterNum}`}
          min="0"
          step="1"
          placeholder="Backs Count"
          defaultValue={data?.backsCount}
          className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/20 !text-white placeholder:!text-slate-400 focus:border-indigo-500 focus:outline-none transition-all font-bold text-sm shadow-inner"
        />
      </div>
    </div>
  );
};
export default ScoreFieldInput;

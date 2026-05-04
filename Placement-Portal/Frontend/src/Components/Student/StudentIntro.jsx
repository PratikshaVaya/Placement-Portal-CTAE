import { useSelector } from 'react-redux';
import defaultAvatar from '../../assets/default-avatar.jpg';
import { getFileUrl } from '../../utils';

const StudentIntro = () => {
  const {
    name,
    email,
    courseName,
    departmentName,
    rollNo,
    batchYear,
    photo,
    activeBacklogs,
    completedBacklogs,
    resume,
  } = useSelector((state) => state.studentProfileState);

  const DetailItem = ({ label, value }) => (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</span>
      <span className="text-slate-200 font-medium">{value ?? 'N/A'}</span>
    </div>
  );

  return (
    <section className="p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
      
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <img
            src={getFileUrl(photo) || defaultAvatar}
            alt={name}
            className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-slate-900 shadow-2xl"
          />
        </div>

        <div className="flex-1 flex flex-col gap-6 w-full">
          <div className="text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">{name}</h2>
              <p className="text-indigo-400 font-medium mt-1">{email}</p>
            </div>
            {resume && (
              <a
                href={getFileUrl(resume)}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all flex items-center gap-2 text-sm font-bold shadow-xl backdrop-blur-md active:scale-95 group/btn"
              >
                <span>View Resume</span>
                <span className="text-lg transition-transform group-hover/btn:translate-x-1">→</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-2xl bg-black/20 border border-white/5">
            <DetailItem label="Course" value={courseName} />
            <DetailItem label="Department" value={departmentName} />
            <DetailItem label="Batch Year" value={batchYear} />
            <DetailItem label="Roll No" value={rollNo} />
            <DetailItem label="Active Backlogs" value={activeBacklogs ?? 0} />
            <DetailItem label="Completed Backlogs" value={completedBacklogs ?? 0} />
          </div>
        </div>
      </div>
    </section>
  );
};
export default StudentIntro;

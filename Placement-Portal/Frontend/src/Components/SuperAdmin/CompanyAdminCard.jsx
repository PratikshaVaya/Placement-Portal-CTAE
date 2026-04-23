import { FaEdit, FaExternalLinkAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import defaultAvatar from '../../assets/default-avatar.jpg';

const CompanyAdminCard = ({ admin }) => {
  const { photo, name, email, companyRole } = admin;
  return (
    <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg hover:bg-white/[0.08] transition-all group">
      <div className="flex gap-5 items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <img
            src={photo || defaultAvatar}
            alt={name}
            className="relative w-20 h-20 rounded-full object-cover border-2 border-slate-700 shadow-xl"
          />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h5 className="text-white font-bold truncate tracking-tight">{name}</h5>
          <p className="text-xs text-slate-400 truncate font-medium">{email}</p>
          <div className="pt-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              {companyRole}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CompanyAdminCard;

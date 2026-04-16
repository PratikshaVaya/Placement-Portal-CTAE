import { useQuery } from '@tanstack/react-query';
import { fetchTopCandidatesQuery } from '../../utils';
import { CiUser } from 'react-icons/ci';
import { FaHatWizard } from 'react-icons/fa';

const TopCandidates = ({ jobId }) => {
  const { data, isLoading, isError } = useQuery(fetchTopCandidatesQuery(jobId));

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <FaHatWizard className="text-purple-600 text-xl" />
          <h3 className="font-semibold text-lg underline">AI Recommended Top Candidates</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[250px] h-32 bg-slate-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data?.candidates?.length) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <FaHatWizard className="text-purple-600 text-xl" />
          <h3 className="font-semibold text-lg underline">AI Recommended Top Candidates</h3>
        </div>
        <p className="text-slate-500 italic">No recommendations found for this job yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <FaHatWizard className="text-purple-600 text-xl animate-bounce" />
        <h3 className="font-semibold text-lg underline text-purple-700">AI Recommended Top Candidates</h3>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {data.candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="min-w-[280px] bg-white border border-purple-100 shadow-md hover:shadow-xl transition-all p-4 rounded-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">
              {candidate.matchScore}% Match
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                <CiUser className="text-2xl" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 line-clamp-1">{candidate.name}</h4>
                <p className="text-xs text-slate-500">{candidate.department}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">CGPA:</span>
                <span className="font-semibold text-purple-700">{candidate.cgpa}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{candidate.skills.length - 3} more</span>
                )}
              </div>
            </div>

            {candidate.isApplied ? (
              <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">
                Already Applied
              </span>
            ) : (
                <span className="text-xs bg-slate-50 text-slate-400 px-2 py-1 rounded-full italic">
                  Not Applied yet
                </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCandidates;

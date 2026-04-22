import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';

import { fetchStudentAnnouncements, getFileUrl } from '../utils';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

export const loader = (queryClient, store) => {
  return async function () {
    try {
      const data = await queryClient.ensureQueryData(fetchStudentAnnouncements());
      return data;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch announcements!';
      console.log(error);
      toast.error(errorMessage);
      return error;
    }
  };
};

const StudentAnnouncements = () => {
  const { notices, lastNoticeFetched } = useLoaderData();
  const hasNotices = Array.isArray(notices) && notices.length > 0;

  return (
    <section className="p-4 sm:p-8 max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
        <div>
          <h3 className="text-3xl font-black text-white tracking-tight">Portal <span className="text-indigo-400">Announcements</span></h3>
          <p className="text-slate-400 text-sm font-medium mt-1">Stay updated with the latest news and placement alerts</p>
        </div>
      </div>

      {hasNotices ? (
        <div className="space-y-6">
          {notices.map((notice, index) => {
            const isNew = new Date(notice.createdAt) > new Date(lastNoticeFetched);
            return (
              <article
                key={notice._id}
                className="group relative rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 hover:bg-slate-800/60 transition-all duration-500 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Decorative background glow for urgent notices */}
                {notice.isUrgent && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
                )}
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between relative z-10">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h4 className="text-xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                        {notice.noticeTitle}
                      </h4>
                      <div className="flex gap-2">
                        {notice.isUrgent && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                            Urgent
                          </span>
                        )}
                        {isNew && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <span>🕒</span> {new Date(notice.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-slate-300 leading-relaxed font-medium relative z-10 prose prose-invert prose-indigo max-w-none">
                  <Markdown 
                    remarkPlugins={[remarkBreaks, remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline transition-colors" />
                    }}
                  >
                    {notice.noticeBody}
                  </Markdown>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6 relative z-10">
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-slate-600 font-black mb-1">Target Branches</span>
                      <span className="text-slate-400 text-xs font-bold">
                        {notice.receivingDepartments?.map((dept) => dept.departmentName).join(', ') || 'All Branches'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-slate-600 font-black mb-1">Target Batches</span>
                      <span className="text-slate-400 text-xs font-bold">
                        {notice.receivingBatches?.map((batch) => batch.batchYear).join(', ') || 'All Batches'}
                      </span>
                    </div>
                  </div>

                  {notice.noticeFile && (
                    <a
                      className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center gap-2"
                      href={getFileUrl(notice.noticeFile)}
                      target="_blank"
                      rel="noopener"
                    >
                      <span>📎</span> View Attachment
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-20 rounded-[3rem] bg-slate-900/20 border border-dashed border-white/10 text-center animate-in zoom-in duration-700">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-3xl opacity-50">🔔</div>
          <h4 className="text-2xl font-black text-white tracking-tight">No New Announcements</h4>
          <p className="text-slate-500 font-medium mt-2">We'll notify you when something important comes up.</p>
        </div>
      )}
    </section>
  );
};

export default StudentAnnouncements;

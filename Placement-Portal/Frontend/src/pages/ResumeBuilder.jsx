import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import ResumeForm from '../Components/ResumeBuilder/ResumeForm';
import ResumePreview from '../Components/ResumeBuilder/ResumePreview';

export const loader = (queryClient) => {
  return async function () {
    try {
      const { resume } = await queryClient.ensureQueryData({
        queryKey: ['resume'],
        queryFn: async () => {
          const { data } = await customFetch.get('/student/resume');
          return data;
        },
      });
      return { resume };
    } catch (error) {
      console.log(error);
      return { resume: null };
    }
  };
};

const ResumeBuilder = () => {
  const queryClient = useQueryClient();
  const [resumeData, setResumeData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: resumeRes, isLoading } = useQuery({
    queryKey: ['resume'],
    queryFn: async () => {
      const { data } = await customFetch.get('/student/resume');
      setResumeData(data.resume);
      return data.resume;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const { data } = await customFetch.post('/student/resume', updatedData);
      return data.resume;
    },
    onSuccess: (updated) => {
      setResumeData(updated);
      queryClient.setQueryData(['resume'], updated);
      toast.success('Resume saved successfully!');
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to save resume');
      setIsSaving(false);
    },
  });

  const handleSaveResume = async (data) => {
    setIsSaving(true);
    updateMutation.mutate(data);
  };

  const downloadPDF = async () => {
    window.print();
    toast.success('Recommendation: Select "Save as PDF" and set margins to "None"');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="text-xl font-black text-indigo-400 tracking-widest uppercase animate-pulse">Building your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 lg:p-12 relative overflow-x-hidden">
      {/* Dynamic Background Accents */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] -mr-96 -mt-96 no-print pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[120px] -ml-96 -mb-96 no-print pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <header className="mb-16 no-print animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-1.5 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
             <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Resume <span className="text-indigo-400">Architect</span>
             </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-3xl leading-relaxed font-medium">
            Generate a professional, ATS-optimized resume using our industry-standard engineering template.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form Section */}
          <div className="lg:col-span-7 no-print animate-in slide-in-from-left duration-700">
            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden group">
              <div className="relative z-10 p-2 sm:p-4">
                <ResumeForm initialData={resumeData} onSave={handleSaveResume} isSaving={isSaving} />
              </div>
            </div>
          </div>

          {/* Right Column: Preview Section */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-8 animate-in slide-in-from-right duration-700">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 no-print">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl shadow-inner border border-white/5">📄</div>
                  <div>
                     <h4 className="text-white font-black text-lg">Live Artifact</h4>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Real-time compilation</p>
                  </div>
               </div>
               <button
                  onClick={downloadPDF}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white text-black hover:bg-indigo-50 transition-all font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-white/5 active:scale-95"
                >
                  <span>Download</span>
                  <span className="text-xl">↓</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 print:shadow-none print:transform-none print-area-container">
               <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between no-print">
                  <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/40"></div>
                     <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/40"></div>
                     <div className="w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-400/40"></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engineering Template v2.4</span>
               </div>
               <div className="print-content">
                  <ResumePreview data={resumeData} />
               </div>
            </div>
            
            <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] flex items-start gap-5 no-print relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
               <span className="text-2xl mt-1">💡</span>
               <p className="text-indigo-300/70 text-sm leading-relaxed font-medium relative z-10">
                  <strong className="text-indigo-300">Strategy:</strong> Use reverse chronological order for your experience. Start with your most recent role and highlight achievements that showcase leadership and impact.
               </p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .print-content {
            padding: 0 !important;
            margin: 0 !important;
          }
          #resume-print-area {
            padding: 15mm !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default ResumeBuilder;


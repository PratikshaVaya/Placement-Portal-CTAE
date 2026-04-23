import { useState, useEffect } from 'react';
import { FiX, FiList } from 'react-icons/fi';

const ResumeForm = ({ initialData, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    header: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      email: '',
      phone: '',
      linkedIn: '',
      github: '',
      leetcode: '',
    },
    education: [],
    experience: [],
    leadership: [],
    skills: {
      technical: '',
      languages: '',
      laboratory: '',
    },
    interests: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [name]: value,
      },
    }));
  };

  const handleSkillsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [name]: value,
      },
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      education: newEducation,
    }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: '',
          degree: '',
          concentration: '',
          gpa: '',
          graduationMonth: '',
          graduationYear: '',
          city: '',
          state: '',
          relevantCoursework: '',
          thesis: '',
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...formData.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      experience: newExperience,
    }));
  };

  const handleBulletPoint = (sectionIndex, bulletIndex, value, section = 'experience') => {
    const sectionData = formData[section];
    const newSection = [...sectionData];
    if (!newSection[sectionIndex].bulletPoints) {
      newSection[sectionIndex].bulletPoints = [];
    }
    // Ensure we have enough bullet points
    while (newSection[sectionIndex].bulletPoints.length <= bulletIndex) {
      newSection[sectionIndex].bulletPoints.push({ text: '' });
    }
    newSection[sectionIndex].bulletPoints[bulletIndex].text = value;
    setFormData((prev) => ({
      ...prev,
      [section]: newSection,
    }));
  };

  const addExperience = () => {
    if (formData.experience.length >= 3) return;
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          organization: '',
          positionTitle: '',
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: '',
          isCurrent: false,
          city: '',
          location: '',
          bulletPoints: [],
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addLeadership = () => {
    if (formData.leadership.length >= 2) return;
    setFormData((prev) => ({
      ...prev,
      leadership: [
        ...prev.leadership,
        {
          organization: '',
          role: '',
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: '',
          isCurrent: false,
          city: '',
          state: '',
          bulletPoints: [],
        },
      ],
    }));
  };

  const removeLeadership = (index) => {
    setFormData((prev) => ({
      ...prev,
      leadership: prev.leadership.filter((_, i) => i !== index),
    }));
  };

  const handleLeadershipChange = (index, field, value) => {
    const newLeadership = [...formData.leadership];
    newLeadership[index] = {
      ...newLeadership[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      leadership: newLeadership,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-10 pb-12 px-6">
      {/* Action Bar (Not Sticky for cleaner UI) */}
      <div className="flex flex-col sm:flex-row justify-end items-center pb-6 border-b border-white/5 mb-6 transition-all duration-300">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? 'Syncing...' : 'Save Draft'}
        </button>
      </div>


      {/* Header Section */}
      <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
        <div className="flex items-center gap-3 mb-8 relative z-10">
           <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm">👤</div>
           <h3 className="text-xl font-black text-white tracking-tight">Header Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">First Name</label>
            <input
              type="text"
              placeholder="e.g. John"
              name="firstName"
              value={formData.header.firstName}
              onChange={handleHeaderChange}
              className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
            <input
              type="text"
              placeholder="e.g. Doe"
              name="lastName"
              value={formData.header.lastName}
              onChange={handleHeaderChange}
              className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Address</label>
            <input
              type="text"
              placeholder="e.g. 123 Main St"
              name="address"
              value={formData.header.address}
              onChange={handleHeaderChange}
              className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">City</label>
            <input
              type="text"
              placeholder="e.g. New York"
              name="city"
              value={formData.header.city}
              onChange={handleHeaderChange}
              className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">State</label>
                <input
                  type="text"
                  placeholder="NY"
                  name="state"
                  value={formData.header.state}
                  onChange={handleHeaderChange}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">ZIP Code</label>
                <input
                  type="text"
                  placeholder="10001"
                  name="zipCode"
                  value={formData.header.zipCode}
                  onChange={handleHeaderChange}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                />
             </div>
          </div>
          <div className="sm:col-span-2 grid sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="john.doe@example.com"
                  name="email"
                  value={formData.header.email}
                  onChange={handleHeaderChange}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  name="phone"
                  value={formData.header.phone}
                  onChange={handleHeaderChange}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                />
             </div>
          </div>
          
          {/* Social Links */}
          <div className="sm:col-span-2 space-y-4 pt-4 border-t border-white/5">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Professional Profiles</h4>
            <div className="grid sm:grid-cols-3 gap-4">
               <input
                type="url"
                placeholder="LinkedIn URL"
                name="linkedIn"
                value={formData.header.linkedIn || ''}
                onChange={handleHeaderChange}
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3 text-slate-200 text-xs focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
              />
              <input
                type="url"
                placeholder="GitHub URL"
                name="github"
                value={formData.header.github || ''}
                onChange={handleHeaderChange}
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3 text-slate-200 text-xs focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
              />
              <input
                type="url"
                placeholder="LeetCode URL"
                name="leetcode"
                value={formData.header.leetcode || ''}
                onChange={handleHeaderChange}
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3 text-slate-200 text-xs focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm">🎓</div>
              <h3 className="text-xl font-black text-white tracking-tight">Education</h3>
           </div>
           <button
              onClick={addEducation}
              className="px-5 py-2 rounded-xl bg-white/5 text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all font-black text-xs uppercase tracking-widest border border-white/5"
            >
              + Add
            </button>
        </div>
        
        <div className="space-y-8">
          {formData.education.map((edu, idx) => (
            <div key={idx} className="relative p-8 bg-black/20 rounded-[2rem] border border-white/5 animate-in slide-in-from-bottom duration-500">
              <button
                onClick={() => removeEducation(idx)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-xl"
              >
                <FiX />
              </button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Institution</label>
                   <input
                    type="text"
                    placeholder="e.g. University of California, Berkeley"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Degree</label>
                   <input
                    type="text"
                    placeholder="e.g. Bachelor of Science"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Concentration</label>
                   <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={edu.concentration}
                    onChange={(e) => handleEducationChange(idx, 'concentration', e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:col-span-2">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">GPA</label>
                      <input
                        type="text"
                        placeholder="3.8/4.0"
                        value={edu.gpa}
                        onChange={(e) => handleEducationChange(idx, 'gpa', e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">City</label>
                      <input
                        type="text"
                        placeholder="Udaipur"
                        value={edu.city}
                        onChange={(e) => handleEducationChange(idx, 'city', e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Month</label>
                      <input
                        type="text"
                        placeholder="May"
                        value={edu.graduationMonth}
                        onChange={(e) => handleEducationChange(idx, 'graduationMonth', e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Year</label>
                      <input
                        type="text"
                        placeholder="2024"
                        value={edu.graduationYear}
                        onChange={(e) => handleEducationChange(idx, 'graduationYear', e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                   </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Relevant Coursework</label>
                   <input
                    type="text"
                    placeholder="e.g. Data Structures, Algorithms, Machine Learning"
                    value={edu.relevantCoursework}
                    onChange={(e) => handleEducationChange(idx, 'relevantCoursework', e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          ))}
          {formData.education.length === 0 && (
             <div className="text-center py-10 rounded-[2rem] border border-dashed border-white/10 text-slate-500 font-medium">
                No education records added yet.
             </div>
          )}
        </div>
      </section>

      {/* Experience Section */}
      <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm">💼</div>
              <h3 className="text-xl font-black text-white tracking-tight">Experience <span className="text-slate-500 font-normal text-sm ml-2">(Max 3)</span></h3>
           </div>
           {formData.experience.length < 3 && (
             <button
                onClick={addExperience}
                className="px-5 py-2 rounded-xl bg-white/5 text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all font-black text-xs uppercase tracking-widest border border-white/5"
              >
                + Add
              </button>
           )}
        </div>

        <div className="space-y-8">
          {formData.experience.slice(0, 3).map((exp, idx) => (
            <div key={idx} className="relative p-8 bg-black/20 rounded-[2rem] border border-white/5 animate-in slide-in-from-bottom duration-500">
              <button
                onClick={() => removeExperience(idx)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-xl"
              >
                <FiX />
              </button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Organization</label>
                   <input
                    type="text"
                    placeholder="e.g. Google"
                    value={exp.organization}
                    onChange={(e) => handleExperienceChange(idx, 'organization', e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Position Title</label>
                   <input
                    type="text"
                    placeholder="e.g. Software Engineering Intern"
                    value={exp.positionTitle}
                    onChange={(e) => handleExperienceChange(idx, 'positionTitle', e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:col-span-2">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Start Date</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="June"
                          value={exp.startMonth}
                          onChange={(e) => handleExperienceChange(idx, 'startMonth', e.target.value)}
                          className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="2023"
                          value={exp.startYear}
                          onChange={(e) => handleExperienceChange(idx, 'startYear', e.target.value)}
                          className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center pr-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">End Date</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`current-${idx}`}
                            checked={exp.isCurrent}
                            onChange={(e) => handleExperienceChange(idx, 'isCurrent', e.target.checked)}
                            className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor={`current-${idx}`} className="text-[10px] font-black uppercase tracking-widest text-slate-500">I'm currently working here</label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Present"
                          value={exp.isCurrent ? 'Present' : exp.endMonth}
                          onChange={(e) => handleExperienceChange(idx, 'endMonth', e.target.value)}
                          disabled={exp.isCurrent}
                          className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all disabled:opacity-20"
                        />
                        <input
                          type="text"
                          placeholder="2024"
                          value={exp.isCurrent ? '' : exp.endYear}
                          onChange={(e) => handleExperienceChange(idx, 'endYear', e.target.value)}
                          disabled={exp.isCurrent}
                          className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all disabled:opacity-20"
                        />
                      </div>
                   </div>
                </div>

                
                <div className="sm:col-span-2 pt-6 border-t border-white/5 space-y-4">
                   <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Responsibility Highlights <span className="text-slate-600 font-normal">(Max 4)</span></h4>
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                     {[0, 1, 2, 3].map((bulletIdx) => (
                        <div key={bulletIdx} className="flex items-center gap-3">
                           <span className="text-indigo-500/50 text-xs shrink-0"><FiList /></span>
                           <input
                            key={bulletIdx}
                            type="text"
                            placeholder={`Quantified achievement ${bulletIdx + 1}`}
                            value={exp.bulletPoints?.[bulletIdx]?.text || ''}
                            onChange={(e) => handleBulletPoint(idx, bulletIdx, e.target.value, 'experience')}
                            className="w-full bg-black/10 border-b border-white/5 hover:border-white/20 px-2 py-3 text-slate-300 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                          />
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          ))}
          {formData.experience.length === 0 && (
             <div className="text-center py-10 rounded-[2rem] border border-dashed border-white/10 text-slate-500 font-medium">
                No experience records added yet.
             </div>
          )}
        </div>
      </section>

      {/* Leadership Section */}
      <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl mt-10">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm">🎖</div>
              <h3 className="text-xl font-black text-white tracking-tight">Leadership & Activities <span className="text-slate-500 font-normal text-sm ml-2">(Max 2)</span></h3>
           </div>
           {formData.leadership.length < 2 && (
             <button
                onClick={addLeadership}
                className="px-5 py-2 rounded-xl bg-white/5 text-amber-400 hover:text-white hover:bg-amber-600 transition-all font-black text-xs uppercase tracking-widest border border-white/5"
              >
                + Add
              </button>
           )}
        </div>

        <div className="space-y-8">
          {formData.leadership.slice(0, 2).map((lead, idx) => (
            <div key={idx} className="relative p-8 bg-black/20 rounded-[2rem] border border-white/5 animate-in slide-in-from-bottom duration-500">
              <button
                onClick={() => removeLeadership(idx)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-xl"
              >
                <FiX />
              </button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Organization</label>
                   <input
                    type="text"
                    placeholder="e.g. Student Council"
                    value={lead.organization}
                    onChange={(e) => handleLeadershipChange(idx, 'organization', e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Role</label>
                   <input
                    type="text"
                    placeholder="e.g. President"
                    value={lead.role}
                    onChange={(e) => handleLeadershipChange(idx, 'role', e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:col-span-2">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Start Date</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="June"
                          value={lead.startMonth}
                          onChange={(e) => handleLeadershipChange(idx, 'startMonth', e.target.value)}
                          className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="2023"
                          value={lead.startYear}
                          onChange={(e) => handleLeadershipChange(idx, 'startYear', e.target.value)}
                          className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center pr-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">End Date</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`current-lead-${idx}`}
                            checked={lead.isCurrent}
                            onChange={(e) => handleLeadershipChange(idx, 'isCurrent', e.target.checked)}
                            className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor={`current-lead-${idx}`} className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ongoing</label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Present"
                          value={lead.isCurrent ? 'Present' : lead.endMonth}
                          onChange={(e) => handleLeadershipChange(idx, 'endMonth', e.target.value)}
                          disabled={lead.isCurrent}
                          className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all disabled:opacity-20"
                        />
                        <input
                          type="text"
                          placeholder="2024"
                          value={lead.isCurrent ? '' : lead.endYear}
                          onChange={(e) => handleLeadershipChange(idx, 'endYear', e.target.value)}
                          disabled={lead.isCurrent}
                          className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all disabled:opacity-20"
                        />
                      </div>
                   </div>
                </div>

                
                <div className="sm:col-span-2 pt-6 border-t border-white/5 space-y-4">
                   <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Key Accomplishments <span className="text-slate-600 font-normal">(Max 3)</span></h4>
                   <div className="grid grid-cols-1 gap-3">
                     {[0, 1, 2].map((bulletIdx) => (
                        <div key={bulletIdx} className="flex items-center gap-3">
                           <span className="text-amber-500/50 text-xs shrink-0"><FiList /></span>
                           <input
                            key={bulletIdx}
                            type="text"
                            placeholder={`Accomplishment ${bulletIdx + 1}`}
                            value={lead.bulletPoints?.[bulletIdx]?.text || ''}
                            onChange={(e) => handleBulletPoint(idx, bulletIdx, e.target.value, 'leadership')}
                            className="w-full bg-black/10 border-b border-white/5 hover:border-white/20 px-2 py-3 text-slate-300 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                          />
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          ))}
          {formData.leadership.length === 0 && (
             <div className="text-center py-10 rounded-[2rem] border border-dashed border-white/10 text-slate-500 font-medium">
                No leadership records added yet.
             </div>
          )}
        </div>
      </section>

      {/* Skills Section */}
      <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden mt-10">
        <div className="absolute top-0 left-0 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl -ml-24 -mt-24"></div>
        <div className="flex items-center gap-3 mb-8 relative z-10">
           <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm">🛠</div>
           <h3 className="text-xl font-black text-white tracking-tight">Skills & Interests</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-8 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
               Technical Skills <span className="text-slate-700 font-normal lowercase">(Languages, Frameworks, Tools)</span>
            </label>
            <textarea
              placeholder="e.g. JavaScript, React, Node.js, Python, AWS, Docker..."
              name="technical"
              value={formData.skills.technical}
              onChange={handleSkillsChange}
              className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all min-h-[100px] resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                   Languages
                </label>
                <textarea
                  placeholder="e.g. English (Fluent), Hindi (Native), Spanish (Beginner)..."
                  name="languages"
                  value={formData.skills.languages}
                  onChange={handleSkillsChange}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all min-h-[80px] resize-none"
                />
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                   Interests
                </label>
                <textarea
                  placeholder="e.g. Open Source Contribution, Photography, Chess..."
                  value={formData.interests}
                  onChange={(e) => setFormData(p => ({...p, interests: e.target.value}))}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50 transition-all min-h-[80px] resize-none"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Footer Save */}
      <div className="pt-10 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-12 py-5 rounded-[2rem] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg transition-all shadow-2xl shadow-indigo-500/25 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? 'Saving Resume...' : 'Complete & Save Resume'}
        </button>
      </div>
    </div>
  );
};

export default ResumeForm;

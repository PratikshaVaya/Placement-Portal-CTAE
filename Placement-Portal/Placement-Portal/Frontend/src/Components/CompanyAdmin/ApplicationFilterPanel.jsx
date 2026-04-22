import { useState } from 'react';
import { FiSearch, FiChevronDown, FiX } from 'react-icons/fi';

const ApplicationFilterPanel = ({ onFiltersChange, branches = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    minCGPA: '',
    min10thPercentage: '',
    min12thPercentage: '',
    minGraduationPercentage: '',
    hasResume: 'all', // all, true, false
    branch: '',
    skills: '',
    sortBy: 'recently-applied',
  });

  const [activeFilters, setActiveFilters] = useState({});

  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...filters, [field]: value };
    setFilters(updatedFilters);
  };

  const applyFilters = () => {
    // Build active filters object
    const active = {};
    
    if (filters.search) active.search = filters.search;
    if (filters.minCGPA) active.minCGPA = `CGPA ≥ ${filters.minCGPA}`;
    if (filters.min10thPercentage) active.min10thPercentage = `10th ≥ ${filters.min10thPercentage}%`;
    if (filters.min12thPercentage) active.min12thPercentage = `12th ≥ ${filters.min12thPercentage}%`;
    if (filters.minGraduationPercentage) active.minGraduationPercentage = `Grad ≥ ${filters.minGraduationPercentage}%`;
    if (filters.hasResume !== 'all') active.hasResume = filters.hasResume === 'true' ? 'Has Resume' : 'No Resume';
    if (filters.branch) active.branch = filters.branch;
    if (filters.skills) active.skills = filters.skills;
    if (filters.sortBy) active.sortBy = filters.sortBy;
    
    setActiveFilters(active);
    onFiltersChange(filters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      search: '',
      minCGPA: '',
      min10thPercentage: '',
      min12thPercentage: '',
      minGraduationPercentage: '',
      hasResume: 'all',
      branch: '',
      skills: '',
      sortBy: 'recently-applied',
    };
    setFilters(emptyFilters);
    setActiveFilters({});
    onFiltersChange(emptyFilters);
  };

  const removeActiveFilter = (filterKey) => {
    const updatedFilters = { ...filters };
    
    switch (filterKey) {
      case 'minCGPA':
      case 'min10thPercentage':
      case 'min12thPercentage':
      case 'minGraduationPercentage':
        updatedFilters[filterKey] = '';
        break;
      case 'hasResume':
        updatedFilters.hasResume = 'all';
        break;
      case 'search':
      case 'branch':
      case 'skills':
        updatedFilters[filterKey] = '';
        break;
      default:
        break;
    }
    
    setFilters(updatedFilters);
    
    const newActiveFilters = { ...activeFilters };
    delete newActiveFilters[filterKey];
    setActiveFilters(newActiveFilters);
    
    onFiltersChange(updatedFilters);
  };

  return (
    <div className="mb-8 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden transition-all duration-500">
      {/* Filter Header */}
      <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
           onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 transition-transform duration-500 ${isExpanded ? 'scale-110' : ''}`}>
            <FiSearch size={22} />
          </div>
          <div>
            <span className="font-black text-white tracking-tight text-lg">Filters & Smart Search</span>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Optimize candidate selection</p>
          </div>
          {Object.keys(activeFilters).length > 0 && (
            <span className="px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-black shadow-lg shadow-indigo-500/30 animate-in zoom-in duration-300">
              {Object.keys(activeFilters).length} Active
            </span>
          )}
        </div>
        <div className={`p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 transition-all duration-500 ${isExpanded ? 'rotate-180 bg-indigo-500/10 text-indigo-400' : ''}`}>
          <FiChevronDown size={20} />
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="px-6 py-4 bg-white/5 flex flex-wrap gap-2.5 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
          {Object.entries(activeFilters).map(([key, label]) => (
            <div key={key} className="group/badge px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-[10px] font-black text-slate-300 flex items-center gap-2.5 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800 transition-all shadow-lg"
                 onClick={() => removeActiveFilter(key)}>
              <span className="opacity-60 uppercase tracking-tighter">{key.replace('min', '').replace('Percentage', '')}:</span>
              <span>{label}</span>
              <FiX size={14} className="text-slate-500 group-hover/badge:text-red-400 transition-colors" />
            </div>
          ))}
          <button 
            onClick={(e) => { e.stopPropagation(); resetFilters(); }}
            className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest ml-auto"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-8 border-t border-white/5 space-y-8 animate-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Search */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Universal Search</label>
              <div className="relative group/input">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Name, Email, or Skills"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Academic Range Filters */}
            <div className="lg:col-span-2 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Academic Benchmarks (Minimum %)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'minCGPA', label: 'CGPA', step: '0.1', max: '10', placeholder: '0.0' },
                  { id: 'min10thPercentage', label: '10th', step: '1', max: '100', placeholder: '0' },
                  { id: 'min12thPercentage', label: '12th', step: '1', max: '100', placeholder: '0' },
                  { id: 'minGraduationPercentage', label: 'Grad', step: '1', max: '100', placeholder: '0' },
                ].map((input) => (
                  <div key={input.id} className="relative group/input">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600 group-focus-within/input:text-indigo-400 transition-colors">{input.label}</span>
                    <input
                      type="number"
                      min="0"
                      max={input.max}
                      step={input.step}
                      placeholder={input.placeholder}
                      value={filters[input.id]}
                      onChange={(e) => handleFilterChange(input.id, e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-12 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all text-right font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Resume & Branch */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Resume & Course</label>
              <div className="flex gap-3">
                <select
                  value={filters.hasResume}
                  onChange={(e) => handleFilterChange('hasResume', e.target.value)}
                  className="flex-1 bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">All Status</option>
                  <option value="true" className="bg-slate-900">Has Resume</option>
                  <option value="false" className="bg-slate-900">No Resume</option>
                </select>
                <select
                  value={filters.branch}
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
                  className="flex-[2] bg-black/20 border border-white/10 rounded-2xl py-3.5 px-4 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch} className="bg-slate-900">{branch}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Specific Skills</label>
              <input
                type="text"
                placeholder="e.g., React, Python, Java"
                value={filters.skills}
                onChange={(e) => handleFilterChange('skills', e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
              />
            </div>

            {/* Sort */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Sort Logic</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 px-5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="recently-applied" className="bg-slate-900">Recently Applied</option>
                <option value="highest-cgpa" className="bg-slate-900">Highest CGPA</option>
                <option value="highest-graduation" className="bg-slate-900">Highest Graduation %</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/5">
            <button
              onClick={applyFilters}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              Apply Analytics
            </button>
            <button
              onClick={() => {
                const newSmartValue = !filters.isSmartFilter;
                handleFilterChange('isSmartFilter', newSmartValue);
                onFiltersChange({ ...filters, isSmartFilter: newSmartValue });
              }}
              className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 border shadow-xl active:scale-95 ${
                filters.isSmartFilter 
                ? 'bg-purple-600 text-white border-purple-400 shadow-purple-500/30 animate-pulse' 
                : 'bg-white/5 text-purple-400 border-purple-500/30 hover:bg-purple-500/10'
              }`}
            >
              <span className="text-lg">✨</span> {filters.isSmartFilter ? 'Smart AI Active' : 'Smart AI Ranking'}
            </button>
            <button
              onClick={resetFilters}
              className="px-8 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationFilterPanel;

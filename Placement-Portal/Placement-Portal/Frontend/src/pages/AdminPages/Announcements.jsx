import { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Form, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import {
  customFetch,
  fetchAnnouncements,
  getBatchOptions,
  getCourseOptions,
  getDepartmentOptions,
  getFileUrl,
} from '../../utils';

const Announcements = () => {
  const courseOptions = useSelector((state) => state.courseOptions);
  const [selectedCourse, setSelectedCourse] = useState('-1');
  const [targetType, setTargetType] = useState('all');
  const [deptOptions, setDeptOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(fetchAnnouncements());
  const announcements = data?.notices ?? [];

  const allUniqueBatches = useMemo(() => {
    const years = new Set();
    const result = [];
    Object.values(courseOptions).forEach(course => {
      course.batches.forEach(batch => {
        if (!years.has(batch.batchYear)) {
          years.add(batch.batchYear);
          result.push({ text: batch.batchYear, value: batch.batchYear });
        }
      });
    });
    return result.sort((a, b) => String(b.text).localeCompare(String(a.text)));
  }, [courseOptions]);

  const handleDeleteAnnouncement = async (id) => {
    const confirmed = window.confirm('Delete this announcement for all students?');
    if (!confirmed) return;

    try {
      await customFetch.delete(`/notice/${id}`);
      queryClient.removeQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted successfully!');
    } catch (error) {
      console.log(error);
      const message =
        error?.response?.data?.message || error?.message || 'Failed to delete announcement!';
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!selectedCourse || selectedCourse === '-1') {
      setDeptOptions([]);
      setBatchOptions([]);
      return;
    }

    const course = courseOptions[selectedCourse];
    setDeptOptions(getDepartmentOptions(course?.departments || []));
    setBatchOptions(getBatchOptions(course?.batches || []));
  }, [selectedCourse, courseOptions]);

  const selectAll = (name) => {
    const checkboxes = document.querySelectorAll(`input[name='${name}']`);
    checkboxes.forEach((checkbox) => {
      checkbox.checked = true;
    });
  };

  const handleTargetTypeChange = (e) => {
    const newTargetType = e.target.value;
    setTargetType(newTargetType);
    if (newTargetType === 'all') {
      setSelectedCourse('-1');
    }
  };

  return (
    <div className="flex flex-col gap-8 text-slate-200">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Announcements / Broadcast</h1>
        <p className="text-slate-400 text-base md:text-lg">Send urgent updates and important notices to students</p>
      </div>

      {/* CREATE ANNOUNCEMENT FORM */}
      <div className="p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-2">New Broadcast</h4>
        <Form
          method="post"
          encType="multipart/form-data"
          name="announcementForm"
          className="grid gap-6"
        >
          <input type="hidden" name="intent" value="createAnnouncement" />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-slate-300 font-medium">Title</span>
              </label>
              <input
                type="text"
                name="noticeTitle"
                className="input input-bordered bg-slate-800/50 border-white/10 text-white focus:border-indigo-500 focus:bg-slate-800 transition-all"
                placeholder="Announcement title"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-slate-300 font-medium">Target Type</span>
              </label>
              <select
                name="targetType"
                className="select select-bordered bg-slate-800/50 border-white/10 text-white focus:border-indigo-500 focus:bg-slate-800 transition-all"
                value={targetType}
                onChange={handleTargetTypeChange}
                required
              >
                <option value="all">All Students</option>
                <option value="course">Course-wise</option>
                <option value="branch">Branch-wise</option>
                <option value="batch">Batch-wise</option>
                <option value="branch_batch">Branch + Batch</option>
              </select>
            </div>
          </div>

          {targetType !== 'all' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text text-slate-300 font-medium">Target Course</span>
              </label>
              <select
                name="receivingCourse"
                id="announcementCourse"
                className="select select-bordered bg-slate-800/50 border-white/10 text-white focus:border-indigo-500 focus:bg-slate-800 transition-all"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
              >
                <option value="-1">Select Course</option>
                {getCourseOptions(courseOptions).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetType === 'all' && (
            <div className="form-control">
              <label className="label justify-between gap-2">
                <span className="label-text text-slate-300 font-medium">Filter by Batches (Optional - Leave empty for Truly All)</span>
                <button
                  type="button"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  onClick={() => selectAll('globalBatches')}
                >
                  Select all
                </button>
              </label>
              <div className="flex flex-wrap gap-3 rounded-xl border border-white/10 bg-slate-800/30 p-4">
                {allUniqueBatches.length ? (
                  allUniqueBatches.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="globalBatches"
                        value={option.value}
                        className="checkbox checkbox-xs checkbox-primary border-white/30"
                      />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{option.text}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">No batches found in system.</p>
                )}
              </div>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-300 font-medium">Message</span>
            </label>
            <textarea
              name="noticeBody"
              className="textarea textarea-bordered bg-slate-800/50 border-white/10 text-white h-36 focus:border-indigo-500 focus:bg-slate-800 transition-all"
              placeholder="Write the announcement message here"
              required
            />
          </div>

          {(targetType === 'branch' || targetType === 'branch_batch') && (
            <div className="form-control">
              <label className="label justify-between gap-2">
                <span className="label-text text-slate-300 font-medium">Branches</span>
                <button
                  type="button"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  onClick={() => selectAll('receivingDepartments')}
                >
                  Select all
                </button>
              </label>
              <div className="flex flex-wrap gap-3 rounded-xl border border-white/10 bg-slate-800/30 p-4">
                {deptOptions.length ? (
                  deptOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="receivingDepartments"
                        value={option.value}
                        className="checkbox checkbox-xs checkbox-primary border-white/30"
                      />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{option.text}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">Choose a course to load branches.</p>
                )}
              </div>
            </div>
          )}

          {(targetType === 'batch' || targetType === 'branch_batch') && (
            <div className="form-control">
              <label className="label justify-between gap-2">
                <span className="label-text text-slate-300 font-medium">Batches</span>
                <button
                  type="button"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  onClick={() => selectAll('receivingBatches')}
                >
                  Select all
                </button>
              </label>
              <div className="flex flex-wrap gap-3 rounded-xl border border-white/10 bg-slate-800/30 p-4">
                {batchOptions.length ? (
                  batchOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="receivingBatches"
                        value={option.value}
                        className="checkbox checkbox-xs checkbox-primary border-white/30"
                      />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{option.text}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">Choose a course to load batches.</p>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 items-end">
            <div className="form-control">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isUrgent" className="checkbox checkbox-error border-white/30" value="true" />
                <span className="text-slate-300 group-hover:text-white transition-colors font-medium">Mark as urgent</span>
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-slate-300 font-medium">Attachment (optional)</span>
              </label>
              <input
                type="file"
                name="noticeFile"
                className="file-input file-input-bordered bg-slate-800/50 border-white/10 text-slate-200 file-input-sm w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              Publish Announcement
            </button>
            <span id="announcementFormError" className="text-sm text-rose-400" />
          </div>
        </Form>
      </div>

      {/* RECENT ANNOUNCEMENTS */}
      <div className="space-y-6">
        <h4 className="text-xl font-bold text-white tracking-wide">Recent Broadcasts</h4>
        {isLoading ? (
          <div className="py-10 text-center">
            <span className="loading loading-spinner loading-lg text-indigo-500"></span>
            <p className="mt-4 text-slate-400">Loading announcements...</p>
          </div>
        ) : announcements.length ? (
          <div className="grid gap-6">
            {announcements.map((announcement) => (
              <article
                key={announcement._id}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg hover:bg-white/[0.08] transition-all"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h5 className="text-xl font-bold text-white tracking-tight">{announcement.noticeTitle}</h5>
                      {announcement.isUrgent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-widest">Urgent</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(announcement.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-medium border border-rose-500/20 transition-all self-start sm:self-auto"
                    onClick={() => handleDeleteAnnouncement(announcement._id)}
                  >
                    Delete Broadcast
                  </button>
                </div>

                <div className="mt-4 text-slate-300 leading-relaxed text-base prose prose-invert prose-indigo max-w-none">
                  <Markdown
                    remarkPlugins={[remarkBreaks, remarkGfm]}
                    components={{
                      a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline transition-colors" />
                    }}
                  >
                    {announcement.noticeBody}
                  </Markdown>
                </div>

                {announcement.noticeFile && (
                  <a
                    href={getFileUrl(announcement.noticeFile)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-sm font-medium border border-indigo-500/20 transition-all"
                  >
                    View Attachment
                  </a>
                )}

                <div className="mt-6 pt-4 border-t border-white/5 grid gap-4 sm:grid-cols-3 text-xs text-slate-400 uppercase tracking-wide">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500">Course</span>
                    <span className="text-slate-200 font-medium truncate">{announcement.receivingCourse?.courseName || 'All Students'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500">Branches</span>
                    <span className="text-slate-200 font-medium truncate">
                      {announcement.receivingDepartments
                        ?.map((dept) => dept.departmentName)
                        ?.join(', ') || 'All Branches'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500">Batches</span>
                    <span className="text-slate-200 font-medium truncate">
                      {announcement.receivingBatches
                        ?.map((batch) => batch.batchYear)
                        ?.join(', ') || 'All Batches'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl border border-white/5 bg-white/5">
            <p className="text-slate-400">No announcements have been published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const action = (queryClient, store) => {
  return async ({ request }) => {
    const formData = await request.formData();
    const intent = formData.get('intent');

    if (intent !== 'createAnnouncement') {
      return null;
    }

    try {
      const targetType = formData.get('targetType') || 'all';
      const receivingCourse = formData.get('receivingCourse');
      const receivingDepartments = formData.getAll('receivingDepartments');
      let receivingBatches = formData.getAll('receivingBatches');
      const globalBatches = formData.getAll('globalBatches');

      const noticeTitle = formData.get('noticeTitle');
      const noticeBody = formData.get('noticeBody');
      const isUrgent = formData.get('isUrgent');

      if (!noticeTitle?.trim() || !noticeBody?.trim()) {
        throw new Error('Notice title and body are required!');
      }

      if (targetType !== 'all') {
        if (!receivingCourse || receivingCourse === '-1' || receivingCourse === 'Select Course') {
          throw new Error('Please select a target course!');
        }
      }

      // If Global All Students with Batch Filter
      if (targetType === 'all' && globalBatches.length > 0) {
        const courseOptions = store.getState().courseOptions;
        const resolvedBatchIds = [];
        Object.values(courseOptions).forEach(course => {
          course.batches.forEach(batch => {
            if (globalBatches.includes(batch.batchYear)) {
              resolvedBatchIds.push(batch.batchId);
            }
          });
        });
        receivingBatches = resolvedBatchIds;
      }

      if (targetType === 'branch' && !receivingDepartments.length) {
        throw new Error('Please select at least one branch!');
      }

      if (targetType === 'batch' && !receivingBatches.length) {
        throw new Error('Please select at least one batch!');
      }

      if (targetType === 'branch_batch' && (!receivingDepartments.length || !receivingBatches.length)) {
        throw new Error('Please select at least one branch and one batch!');
      }

      const payload = new FormData();
      payload.append('noticeTitle', noticeTitle);
      payload.append('noticeBody', noticeBody);
      payload.append('targetType', targetType);

      if (targetType !== 'all') {
        payload.append('receivingCourse', receivingCourse);
      }

      if (receivingDepartments.length && targetType !== 'batch') {
        payload.append('receivingDepartments', JSON.stringify(receivingDepartments));
      }

      if (receivingBatches.length) {
        payload.append('receivingBatches', JSON.stringify(receivingBatches));
      }

      if (isUrgent) payload.append('isUrgent', true);

      const noticeFile = formData.get('noticeFile');
      if (noticeFile?.name) payload.append('noticeFile', noticeFile);

      await customFetch.post('/notice', payload);

      queryClient.removeQueries({ queryKey: ['announcements'] });

      toast.success('Announcement created successfully!');
      document.forms.announcementForm?.reset();
      return redirect('/admin-dashboard/announcements');
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to create announcement!';
      toast.error(errorMessage);
      return null;
    }
  };
};

export default Announcements;

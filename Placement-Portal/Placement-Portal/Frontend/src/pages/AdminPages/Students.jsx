import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useMemo, useState } from 'react';
import { Form } from 'react-router-dom';

import { SelectInput, CheckboxInput, StudentsTable } from '../../Components';
import {
  fetchStudents,
  getCourseOptions,
  getDepartmentOptions,
  getBatchOptions,
  customFetch,
} from '../../utils';

export const loader = (queryClient, store) => {
  return async function ({ request }) {
    const url = new URL(request.url);
    const params = new URLSearchParams(url.search);

    const query = {
      page: 1, limit: 10
    };

    if (params.size) {
      query.page = parseInt(params.get('page')) || 1;
      query.limit = parseInt(params.get('limit')) || 10;
      query.course = params.get('course');
      query.departments = params.getAll('departments')?.join('|');
      query.batches = params.getAll('batches')?.join('|');
    }

    try {
      const { students, totalPages } = await queryClient.ensureQueryData(
        fetchStudents(query)
      );
      return { students, totalPages, ...query };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch students!';
      console.log(error);
      toast.error(errorMessage);
      return error;
    }
  };
};

const Students = () => {
  const courseOptions = useSelector((state) => state.courseOptions);
  const [deptOptions, setDeptOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [exportSummary, setExportSummary] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isImportLoading, setIsImportLoading] = useState(false);

  const invalidRows = useMemo(
    () =>
      (previewData?.previewRows || []).filter(
        (row) => Array.isArray(row.errors) && row.errors.length
      ),
    [previewData]
  );

  const downloadErrorCsv = (failedRows = []) => {
    if (!failedRows.length) {
      toast.info('No failed rows to export');
      return;
    }
    const headers = [
      'Row Number',
      'Name',
      'Roll No',
      'Email',
      'Course',
      'Department',
      'Batch',
      'DOB',
      'Errors',
    ];
    const escapeValue = (value) => {
      const str = value === null || value === undefined ? '' : String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replaceAll('"', '""')}"`;
      }
      return str;
    };
    const rows = failedRows.map((item) => {
      const row = item.row || {};
      return [
        item.rowNumber,
        row.name,
        row['roll no'],
        row.email,
        row.course,
        row.department,
        row.batch,
        row.dob,
        (item.errors || []).join(' | '),
      ]
        .map(escapeValue)
        .join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students-import-errors-${Date.now()}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8 text-slate-200">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Students Management</h1>
        <p className="text-slate-400 text-base md:text-lg">Filter, bulk import, and manage student records</p>
      </div>

      {/* FILTERS */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-2">Filter Students</h4>
        <Form className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <SelectInput
                label="Select Course"
                options={getCourseOptions(courseOptions)}
                id="createJobCourse"
                changeFn={handleCourseChange}
                name="course"
                containerClass="w-full"
              />
            </div>
            <div>
              <CheckboxInput
                label="Select Departments"
                options={deptOptions}
                name="departments"
                emptyMsg="Select a course!"
              />
            </div>
            <div>
              <CheckboxInput
                label="Batches"
                options={batchOptions}
                name="batches"
                emptyMsg="no batches found!"
              />
            </div>
          </div>
          <button
            type="submit"
            className="self-end px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            Apply Filters
          </button>
        </Form>
      </div>

      {/* BULK OPERATIONS */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-2">Bulk Student Operations</h4>
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <input
            type="file"
            accept=".csv"
            className="file-input file-input-bordered file-input-sm w-full max-w-xs bg-slate-800 text-slate-200 border-white/20 focus:border-indigo-500"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setImportFile(file || null);
              setPreviewData(null);
              setImportSummary(null);
            }}
          />
          <button
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePreviewImport}
            disabled={!importFile || isPreviewLoading}
          >
            {isPreviewLoading ? 'Previewing...' : 'Preview Before Upload'}
          </button>
          <button
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleConfirmImport}
            disabled={!importFile || !previewData || isImportLoading}
          >
            {isImportLoading ? 'Uploading...' : 'Confirm Upload'}
          </button>
          <button 
            className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition-colors border border-white/10"
            onClick={handleExportStudents}
          >
            Export Students (CSV)
          </button>
          <a
            className="px-4 py-1.5 rounded-lg bg-transparent hover:bg-white/5 text-slate-300 font-medium text-sm transition-colors border border-white/20"
            href={`${import.meta.env.VITE_API_URL}/admin/students/import/sample`}
            target="_blank"
            rel="noopener"
          >
            Sample Import CSV
          </a>
        </div>

        {previewData && (
          <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-white/5">
            <p className="text-sm text-slate-300">
              Total: <span className="font-bold text-white">{previewData.summary?.totalRows || 0}</span> | Valid:{' '}
              <span className="font-bold text-emerald-400">{previewData.summary?.validCount || 0}</span> | Invalid:{' '}
              <span className="font-bold text-rose-400">{previewData.summary?.invalidCount || 0}</span>
            </p>
            {!!invalidRows.length && (
              <p className="text-sm text-rose-400 mt-2">Invalid rows are highlighted below.</p>
            )}
          </div>
        )}

        {importSummary && (
          <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-white/5">
            <p className="text-sm font-medium text-slate-300">
              Imported: <span className="font-bold text-emerald-400">{importSummary.summary?.importedCount || 0}</span> | Failed:{' '}
              <span className="font-bold text-rose-400">{importSummary.summary?.failedCount || 0}</span>
            </p>
            {!!importSummary.summary?.forcePasswordResetCount && (
              <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
                {importSummary.summary.forcePasswordResetCount} imported student(s)
                are marked as password reset required on first login.
              </div>
            )}
            {!!importSummary.failedRows?.length && (
              <button
                className="mt-4 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-colors shadow-lg shadow-rose-500/20"
                onClick={() => downloadErrorCsv(importSummary.failedRows)}
              >
                Download Error Report CSV
              </button>
            )}
          </div>
        )}

        {exportSummary && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm">
            Latest export contains <span className="font-bold">{exportSummary.forcePasswordResetCount}</span> student(s)
            with password reset required.
          </div>
        )}

        {previewData?.previewRows?.length ? (
          <div className="overflow-x-auto max-h-96 rounded-xl border border-white/10 bg-slate-900 custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-3 font-medium">Row</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Roll No</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">DOB</th>
                  <th className="px-4 py-3 font-medium">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {previewData.previewRows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={`hover:bg-white/5 transition-colors ${row.isValid ? 'bg-emerald-500/5' : 'bg-rose-500/10'}`}
                  >
                    <td className="px-4 py-3">{row.rowNumber}</td>
                    <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                    <td className="px-4 py-3">{row['roll no']}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.course}</td>
                    <td className="px-4 py-3">{row.department}</td>
                    <td className="px-4 py-3">{row.batch}</td>
                    <td className="px-4 py-3">{row.dob}</td>
                    <td className={`px-4 py-3 font-medium ${row.isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.isValid ? 'Valid' : row.errors?.join(' | ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* TABLE */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-2">Student Directory</h4>
        <StudentsTable />
      </div>
    </div>
  );

  async function handleCourseChange() {
    const courseId = document.getElementById('createJobCourse').value;

    if (!courseId || courseId == -1) {
      setDeptOptions([]);
      setBatchOptions([]);
    } else {
      const deptOptions = getDepartmentOptions(
        courseOptions[courseId].departments
      );
      setDeptOptions(deptOptions);
      const batchOptions = getBatchOptions(courseOptions[courseId].batches);
      setBatchOptions(batchOptions);
    }
  }

  async function handlePreviewImport(event) {
    event.preventDefault();
    if (!importFile) {
      toast.error('Please choose a CSV file first');
      return;
    }
    try {
      setIsPreviewLoading(true);
      const formData = new FormData();
      formData.append('file', importFile);
      const { data } = await customFetch.post('/admin/students/import/preview', formData);
      setPreviewData(data);
      setImportSummary(null);
      toast.success('Preview generated');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to preview CSV import';
      toast.error(errorMessage);
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleConfirmImport(event) {
    event.preventDefault();
    if (!importFile || !previewData) {
      toast.error('Generate preview before uploading');
      return;
    }
    try {
      setIsImportLoading(true);
      const formData = new FormData();
      formData.append('file', importFile);
      const { data } = await customFetch.post('/admin/students/import/confirm', formData);
      setImportSummary(data);
      toast.success(data?.message || 'Students imported successfully');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to import students';
      toast.error(errorMessage);
    } finally {
      setIsImportLoading(false);
    }
  }

  async function handleExportStudents(event) {
    event.preventDefault();
    try {
      const queryString = window.location.search || '';
      const response = await customFetch.get(`/admin/students/export${queryString}`, {
        responseType: 'blob',
      });
      const forcePasswordResetCount = Number(
        response.headers?.['x-force-password-reset-count'] || 0
      );
      setExportSummary({ forcePasswordResetCount });
      const url = URL.createObjectURL(
        new Blob([response.data], { type: 'text/csv;charset=utf-8' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `students-export-${Date.now()}.csv`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(
        `Export complete. ${forcePasswordResetCount} student(s) require password reset.`
      );
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to export students';
      toast.error(errorMessage);
    }
  }
};
export default Students;

import { Link, useLoaderData } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { setModalData } from '../../features/createStudentModal/studentModalData';
import { customFetch } from '../../utils';

const StudentsTable = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { students, page, limit, totalPages, course, departments, batches } =
    useLoaderData();

  const handleDeleteStudent = async (studentId) => {
    const confirmed = globalThis.confirm(
      'Are you sure you want to delete this student?'
    );
    if (!confirmed) return;

    try {
      await customFetch.delete(`/admin/students/single/${studentId}`);
      toast.success('Student deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['students'], exact: false });
      globalThis.location.reload();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to delete student';
      toast.error(errorMessage);
    }
  };

  const handleToggleBlock = async (studentId, isBlocked) => {
    const action = isBlocked ? 'unblock' : 'block';
    const confirmed = globalThis.confirm(
      `Are you sure you want to ${action} this student?`
    );
    if (!confirmed) return;

    try {
      await customFetch.patch(`/admin/students/single/${studentId}/${action}`);
      toast.success(
        `Student ${isBlocked ? 'unblocked' : 'blocked'} successfully`
      );
      queryClient.invalidateQueries({ queryKey: ['students'], exact: false });
      globalThis.location.reload();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || `Failed to ${action} student`;
      toast.error(errorMessage);
    }
  };

  function getPageLink(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) {
      return;
    }

    let link = `${globalThis.location.pathname}?page=${pageNum}&limit=${limit}`;
    if (course) {
      link += `&course=${course}`;
    }
    if (departments) {
      link += `&departments=${departments}`;
    }
    if (batches) {
      link += `&batches=${batches}`;
    }

    return link;
  }

  const prevLinkClass = page > 1 ? 'btn btn-sm btn-secondary' : 'btn btn-sm';
  const nextLinkClass =
    page < totalPages ? 'btn btn-sm btn-secondary' : 'btn btn-sm';

  return (
    <div className="w-full">
      {students.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-400 text-lg">No students found!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900 custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-4 font-medium">Roll No</th>
                <th className="px-4 py-4 font-medium">Name</th>
                <th className="px-4 py-4 font-medium">Course</th>
                <th className="px-4 py-4 font-medium">Batch</th>
                <th className="px-4 py-4 font-medium">Department</th>
                <th className="px-4 py-4 font-medium text-center">Status</th>
                <th className="px-4 py-4 font-medium text-center">Password</th>
                <th className="px-4 py-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">{student.rollNo}</td>
                  <td className="px-4 py-4 font-medium text-white">{student.name}</td>
                  <td className="px-4 py-4">{student.courseName}</td>
                  <td className="px-4 py-4">{student.batchYear}</td>
                  <td className="px-4 py-4">{student.departmentName}</td>
                  <td className="px-4 py-4 text-center">
                    {student.isBlocked ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Blocked</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {student.forcePasswordReset ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Required</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">Not Required</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                        title="Edit Student"
                        onClick={() => {
                          dispatch(setModalData({ student }));
                          document.getElementById('addSingleStudentModal').showModal();
                        }}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                        title="Delete Student"
                        onClick={() => handleDeleteStudent(student._id)}
                      >
                        <MdDelete size={18} />
                      </button>
                      <button
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                          student.isBlocked 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                        onClick={() => handleToggleBlock(student._id, student.isBlocked)}
                      >
                        {student.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {students.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <Link 
            to={getPageLink(page - 1)} 
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors border ${
              page > 1 
                ? 'bg-white/5 text-white hover:bg-white/10 border-white/10' 
                : 'bg-transparent text-slate-600 border-white/5 cursor-not-allowed pointer-events-none'
            }`}
          >
            Previous
          </Link>
          <span className="text-slate-400 text-sm">Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong></span>
          <Link 
            to={getPageLink(page + 1)} 
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors border ${
              page < totalPages 
                ? 'bg-white/5 text-white hover:bg-white/10 border-white/10' 
                : 'bg-transparent text-slate-600 border-white/5 cursor-not-allowed pointer-events-none'
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
};
export default StudentsTable;

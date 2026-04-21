import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa';
import { redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

const DepartmentsTab = ({ departments, courseId, setModalData }) => {
  return (
    <>
      <input
        type="radio"
        name={`course-tab-${courseId}`}
        role="tab"
        className="tab sm:text-lg font-semibold text-slate-400 checked:text-indigo-400 transition-colors border-slate-700 checked:border-indigo-500"
        aria-label="Departments"
        defaultChecked={true}
      />
      <div role="tabpanel" className="mt-8 tab-content">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white tracking-tight">Department List</h3>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
            onClick={() => {
              setModalData({ action: 'add', courseId });
              document.getElementById('departmentModal').showModal();
              document.getElementById('departmentFormError').innerText = '';
            }}
          >
            <FaPlusSquare />
            Add New
          </button>
        </div>

        {departments?.length ? (
          <div className="grid gap-3">
            {departments.map((department) => (
              <DepartmentContainer
                key={department.departmentId}
                department={department}
                setModalData={setModalData}
                courseId={courseId}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center rounded-xl bg-white/5 border border-white/5 text-slate-500 italic">
            No departments associated with this course yet.
          </div>
        )}
      </div>
    </>
  );
};

const DepartmentContainer = ({ department, courseId, setModalData }) => {
  return (
    <div className="flex justify-between items-center py-3 px-5 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 hover:border-white/10 transition-all group">
      <h4 className="text-slate-200 font-medium group-hover:text-white transition-colors">
        <span className="text-indigo-400 font-bold mr-2">{department.departmentCode}</span>
        {department.departmentName}
      </h4>
      <div className="flex gap-2">
        <button
          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
          title="Edit Department"
          onClick={() => {
            setModalData({ action: 'update', department, courseId });
            document.getElementById('departmentModal').showModal();
            document.getElementById('departmentFormError').innerText = '';
          }}
        >
          <FaEdit size={16} />
        </button>
      </div>
    </div>
  );
};

async function handleDeleteDepartment({ queryClient, dispatch, skill }) {
  try {
    await customFetch.delete(`/admin/courses/`);
    toast.success('Department deleted successfully!');
    return redirect('/admin-dashboard/courses');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete department!';
    toast.error(errorMessage);
    return error;
  }
}

export default DepartmentsTab;

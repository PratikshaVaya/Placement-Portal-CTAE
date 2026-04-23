import { Link, useLoaderData, redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { FaEdit, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { customFetch, fetchCompanies } from '../../utils';
import { setModalData } from '../../features/companyModal/companyModal';
import { resetModalData } from '../../features/companyAdminModal/companyAdminModal';
import { CompanyAdminModal } from '../../Components';

export const action = (queryClient, store) => {
  return async function ({ request }) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    /* CREATE & UPDATE COMPANY ADMIN */
    if (intent === 'addCompanyAdmin' || intent === 'updateCompanyAdmin') {
      const companyId = formData.get('companyId');
      let url = `/admin/companies/${companyId}/admins/`;
      if (intent === 'updateCompanyAdmin') url += formData.get('adminId');
      try {
        if (intent === 'addCompanyAdmin') await customFetch.post(url, formData);
        else await customFetch.patch(url, formData);
        queryClient.removeQueries({ queryKey: [companyId] });
        toast.success('Company Admin added successfully!');
        document.forms.companyAdminForm.reset();
        document.getElementById('companyAdminModal').close();
        return redirect(`/admin-dashboard/companies/${companyId}`);
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to add admin!';
        document.getElementById('companyAdminFormError').textContent =
          errorMessage;
        return error;
      }
    }
  };
};

export const loader = (queryClient, store) => {
  return async function () {
    try {
      const { companies } = await queryClient.ensureQueryData(fetchCompanies());
      return { companies };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch companies!';
      console.log(error);
      toast.error(errorMessage);
      return error;
    }
  };
};

const Companies = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { companies } = useLoaderData();

  const handleDeleteCompany = async (companyId) => {
    const confirmed = globalThis.confirm(
      'Are you sure you want to delete this company?'
    );
    if (!confirmed) return;

    try {
      await customFetch.delete(`/admin/companies/${companyId}`);
      toast.success('Company deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['companies'], exact: false });
      globalThis.location.reload();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to delete company!';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-slate-200">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Partner Companies</h1>
        <p className="text-slate-400 text-base md:text-lg">Manage recruiting companies and their administrative access</p>
      </div>

      <CompanyAdminModal />

      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
        {companies.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400 text-lg">No companies found!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900 custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-4 font-medium">Name</th>
                  <th className="px-4 py-4 font-medium">Website</th>
                  <th className="px-4 py-4 font-medium">Email</th>
                  <th className="px-4 py-4 font-medium text-center">Jobs Posted</th>
                  <th className="px-4 py-4 font-medium text-center">Openings Created</th>
                  <th className="px-4 py-4 font-medium text-center">Candidates Hired</th>
                  <th className="px-4 py-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {companies.map((company) => (
                  <tr key={company._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 font-medium">
                      <Link
                        to={`${company._id}`}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        to={company?.website}
                        target="_blank"
                        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Visit <FaExternalLinkAlt size={12} />
                      </Link>
                    </td>
                    <td className="px-4 py-4">{company.email}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{company?.jobsPosted || 0}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{company?.openingsCreated || 0}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{company?.candidatesHired || 0}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors inline-flex">
                          <FaEdit size={16} />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-20 menu p-2 shadow-xl bg-slate-800 border border-white/10 rounded-xl w-52 text-slate-200"
                        >
                          <li>
                            <button
                              className="hover:bg-white/10 hover:text-white transition-colors"
                              onClick={() => {
                                dispatch(setModalData({ company }));
                                document.getElementById('companyModal').showModal();
                              }}
                            >
                              Edit Company
                            </button>
                          </li>
                          <li>
                            <button
                              className="hover:bg-white/10 hover:text-white transition-colors"
                              onClick={() => {
                                dispatch(
                                  resetModalData({
                                    companyId: company._id,
                                    companyName: company.name,
                                  })
                                );
                                document.getElementById('companyAdminModal').showModal();
                              }}
                            >
                              Add Admin
                            </button>
                          </li>
                          <div className="divider my-1 h-[1px] bg-white/10"></div>
                          <li>
                            <button
                              className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                              onClick={() => handleDeleteCompany(company._id)}
                            >
                              Delete Company
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Companies;

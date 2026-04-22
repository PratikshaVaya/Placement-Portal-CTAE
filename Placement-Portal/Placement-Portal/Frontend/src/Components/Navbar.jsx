import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { FaPowerOff } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { logoutUser } from '../features/user/userSlice';
import { resetStudentProfile } from '../features/studentProfile/studentProfileSlice';
import { customFetch } from '../utils/axiosSetup';

const Navbar = ({ options }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { name: userName, role: userRole } = useSelector(
    (state) => state?.userState?.user
  );
  const queryClient = useQueryClient();

  async function logout() {
    try {
      await customFetch.get('/auth/logout');
      toast.error('Logged out successfully!');
      dispatch(logoutUser());
      dispatch(resetStudentProfile());
      queryClient.clear();
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  }

  function returnOptions() {
    return options.map((option) => {
      const { id, href, text, isParentMenu, subMenus } = option;

      if (!isParentMenu)
        return (
          <li className="capitalize text-slate-200 hover:text-white" key={id}>
            <NavLink to={href} end>
              {text}
            </NavLink>
          </li>
        );
      else
        return (
          <li key={id}>
            <details>
              <summary className="capitalize text-slate-200 hover:text-white">{text}</summary>
              <ul className="p-2 z-10 bg-slate-800 rounded-lg border border-white/10 shadow-xl text-slate-200 min-w-max">
                {subMenus.map((menu) => (
                  <li key={menu.id} className="hover:text-white hover:bg-white/10 rounded-md transition-colors">
                    {menu.element}
                  </li>
                ))}
              </ul>
            </details>
          </li>
        );
    });
  }

  return (
    <div className="navbar bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="navbar-start ml-4">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-slate-800 border border-white/10 rounded-box w-52"
          >
            {returnOptions()}
          </ul>
        </div>
        <p className="normal-case text-slate-200 font-medium tracking-wide text-xl">Hello, {userName}</p>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{returnOptions()}</ul>
      </div>
      <div className="navbar-end">
        {userRole === 'company_admin' && (
          <button
            className="btn btn-sm  btn-primary"
            onClick={() => {
              // window.location.href = '/company-dashboard/create-job?action=create';
              navigate('/company-dashboard/create-job');
            }}
          >
            Create Job
          </button>
        )}
        <button className="p-4 text-slate-300 hover:text-red-400 transition-colors" onClick={logout}>
          <FaPowerOff size={18} />
        </button>
      </div>
    </div>
  );
};
export default Navbar;

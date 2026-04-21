import { Form, redirect, Link } from 'react-router-dom';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaUserShield } from 'react-icons/fa';

import { setUser } from '../features/user/userSlice';
import { FormInput } from '../Components';

export function loader(store) {
  return async function () {
    try {
      const { data } = await customFetch.get('/user/whoami');
      const { user } = data;
      store.dispatch(setUser({ user }));
      const role = user.role;
      if (role == 'student' && user.forcePasswordReset)
        return redirect('/student-dashboard/reset-password');
      if (role == 'student') return redirect('/student-dashboard');
      if (role == 'company_admin') return redirect('/company-dashboard');
      if (role == 'admin') return redirect('/admin-dashboard');
    } catch (error) {
      return null;
    }
  };
}

export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await customFetch.post('/auth/login', data);
    toast.success('Login successful!');
    return redirect('/');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Please double check your credentials';
    toast.error(errorMessage);
    return null;
  }
}

const Login = () => {
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden bg-slate-950 px-6 lg:px-24">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s]"
        style={{ backgroundImage: "url('/ctaecampus.jpeg')" }}
      ></div>
      
      {/* Dark Overlay Gradients - Heavier on the left for text readability */}
      <div className="absolute inset-0 z-1 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
      <div className="absolute inset-0 z-1 bg-slate-950/40"></div>
      <div className="absolute inset-0 z-1 backdrop-blur-[1px]"></div>

      <div className="w-full max-w-lg relative z-10 flex flex-col py-12">
        {/* Branding & Header Section */}
        <div className="mb-10 space-y-8 animate-in fade-in slide-in-from-left duration-700">
          <div className="flex items-center gap-4">
            <img src="/ctae-logo.png" alt="CTAE Logo" className="w-14 h-14 object-contain drop-shadow-2xl" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">CTAE Udaipur</h1>
              <p className="text-xs font-bold text-emerald-400 tracking-[0.3em] uppercase mt-1.5">Placement Portal</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Welcome <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Back</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium max-w-sm">
              Sign in to access your dashboard and manage placements.
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
          <Form
            method="POST"
            className="p-8 lg:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-6 max-w-md"
          >
            <FormInput 
              type="email" 
              name="email" 
              label="Email Address" 
              placeholder="name@college.edu"
              icon={FaEnvelope}
            />
            
            <div className="space-y-1">
              <FormInput
                type="password"
                name="password"
                label="Password"
                placeholder="••••••••"
                icon={FaLock}
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" className="checkbox checkbox-xs checkbox-primary border-white/20" id="remember" />
              <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] border border-white/10"
            >
              Sign In
            </button>
          </Form>
        </div>
        
        {/* Footer info */}
        <div className="mt-auto pt-12 animate-in fade-in duration-1000 delay-500">
          <p className="text-slate-500 text-[10px] tracking-[0.4em] uppercase font-bold">
            Established 1964 • CTAE Udaipur
          </p>
        </div>
      </div>
    </section>
  );
};
export default Login;

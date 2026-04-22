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
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 px-6">
      {/* Top-Left Branding */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-4 bg-slate-900/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-xl animate-in fade-in slide-in-from-left duration-700">
        <img src="/ctae-logo.png" alt="CTAE Logo" className="w-12 h-12 object-contain drop-shadow-lg" />
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-white tracking-tight leading-none">CTAE Udaipur</h1>
          <p className="text-[10px] font-black text-emerald-400 tracking-[0.2em] uppercase mt-1">Placement Portal</p>
        </div>
      </div>

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s]"
        style={{ backgroundImage: "url('/ctaecampus.jpeg')" }}
      ></div>
      
      {/* Dark Overlay Gradients - Radial for center focus */}
      <div className="absolute inset-0 z-1 bg-slate-950/60"></div>
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/80"></div>
      <div className="absolute inset-0 z-1 radial-overlay"></div>
      <div className="absolute inset-0 z-1 backdrop-blur-[2px]"></div>

      <style>{`
        .radial-overlay {
          background: radial-gradient(circle at center, transparent 0%, rgba(2, 6, 23, 0.9) 100%);
        }
      `}</style>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Header Section - Centered */}
        <div className="mb-10 space-y-3 text-center animate-in fade-in zoom-in duration-700">
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Back</span>
          </h2>
          <p className="text-slate-300 text-sm font-medium max-w-xs mx-auto opacity-80">
            Sign in to access your dashboard and manage placements.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="w-full animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
          <Form
            method="POST"
            className="p-8 lg:p-10 rounded-[2.5rem] bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-6"
          >
            <FormInput 
              type="email" 
              name="email" 
              label="Email Address" 
              placeholder="name@college.edu"
              icon={FaEnvelope}
            />
            
            <FormInput
              type="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              icon={FaLock}
            />

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" className="checkbox checkbox-sm checkbox-primary border-white/20" id="remember" />
              <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] border border-white/10"
            >
              Sign In
            </button>
          </Form>
        </div>
        
        {/* Footer info */}
        <div className="mt-12 animate-in fade-in duration-1000 delay-500">
          <p className="text-slate-500 text-[10px] tracking-[0.5em] uppercase font-bold text-center">
            Established 1964 • CTAE Udaipur
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;

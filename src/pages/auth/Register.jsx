import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiUser, FiMail, FiLock, FiPhone, FiBookOpen, FiBookmark, FiLoader } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loadingLocal, setLoadingLocal] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      department: 'CSE',
      semester: '1',
      phoneNumber: '',
    }
  });

  const onSubmit = async (data) => {
    setLoadingLocal(true);
    try {
      await register(data.email, data.password, {
        name: data.name,
        department: data.department,
        semester: data.semester,
        phoneNumber: data.phoneNumber
      });

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Your account has been created. A verification email has been sent. (Simulated in mock mode)',
        confirmButtonText: 'Proceed to Login',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      }).then(() => {
        navigate('/login');
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.message || 'An error occurred during sign up.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <FiUser />
            </div>
            <input
              type="text"
              placeholder="Alex Johnson"
              {...registerField('name', { required: 'Full name is required' })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <FiMail />
            </div>
            <input
              type="email"
              placeholder="alex.student@campus.edu"
              {...registerField('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address format'
                }
              })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <FiLock />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              {...registerField('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            />
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
        </div>

        {/* Department & Semester (Two columns) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <FiBookOpen />
              </div>
              <select
                {...registerField('department')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">Mech Eng</option>
                <option value="EEE">Electrical</option>
                <option value="CE">Civil Eng</option>
                <option value="IT">Info Tech</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Semester
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <FiBookmark />
              </div>
              <select
                {...registerField('semester')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <FiPhone />
            </div>
            <input
              type="text"
              placeholder="+1 555-0199"
              {...registerField('phoneNumber', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[+]?[0-9\s-]{10,15}$/,
                  message: 'Invalid phone number (must be 10-15 digits)'
                }
              })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            />
          </div>
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phoneNumber.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loadingLocal}
          className="w-full py-3.5 rounded-xl bg-gradient-primary hover:shadow-lg hover:shadow-primary-500/20 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-6 text-sm"
        >
          {loadingLocal ? (
            <>
              <FiLoader className="animate-spin text-lg" />
              Registering Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-500 font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

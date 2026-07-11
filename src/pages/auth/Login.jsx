import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMock } from '../../firebase/config';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  });

  // Calculate redirect path
  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setLoadingLocal(true);
    try {
      await login(data.email, data.password, data.rememberMe);
      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: 'Login successful. Redirecting...',
        timer: 1500,
        showConfirmButton: false,
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1500);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Failed',
        text: err.message || 'Invalid email or password.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleForgotPassword = () => {
    Swal.fire({
      title: 'Reset Password',
      text: 'Enter your registered email address to receive a password reset link.',
      input: 'email',
      inputPlaceholder: 'Enter email...',
      showCancelButton: true,
      confirmButtonText: 'Send Reset Link',
      background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      preConfirm: (email) => {
        if (!email) {
          Swal.showValidationMessage('Email is required');
        }
        return email;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Link Sent!',
          text: `Reset link has been dispatched to ${result.value}. (In mock mode, this is simulated)`,
          background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        });
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <FiMail />
            </div>
            <input
              type="email"
              placeholder="alex@campus.edu"
              {...registerField('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address format'
                }
              })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <FiLock />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...registerField('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me Toggle */}
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            {...registerField('rememberMe')}
            className="w-4.5 h-4.5 rounded border-slate-300 text-primary-500 focus:ring-primary-500 dark:border-dark-border bg-slate-50 dark:bg-slate-900"
          />
          <label htmlFor="rememberMe" className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer">
            Remember my session
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loadingLocal}
          className="w-full py-3.5 rounded-xl bg-gradient-primary hover:shadow-lg hover:shadow-primary-500/20 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed text-sm"
        >
          {loadingLocal ? (
            <>
              <FiLoader className="animate-spin text-lg" />
              Verifying Credentials...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Register Redirect */}
      <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-500 font-bold hover:underline">
          Create Account
        </Link>
      </div>

      {/* Demo Credentials Alert Box (VIVA SPECIAL FEATURE) */}
      {useMock && (
        <div className="mt-8 p-4 rounded-2xl bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/10 dark:border-primary-500/20 text-left">
          <h4 className="text-[10px] font-bold text-primary-500 tracking-wider uppercase mb-1.5">
            Quick Demo Accounts
          </h4>
          <div className="space-y-1 text-slate-500 dark:text-slate-400 text-xs">
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Student:</span>{' '}
              <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-primary-600 dark:text-primary-400">student@campus.edu</code> (pass: `password123`)
            </div>
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Admin:</span>{' '}
              <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-primary-600 dark:text-primary-400">admin@campus.edu</code> (pass: `admin123`)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

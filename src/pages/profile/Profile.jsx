import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { validateImageFile } from '../../utils/fileValidators';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiBookOpen, 
  FiBookmark, 
  FiLock, 
  FiCamera,
  FiLoader
} from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function Profile() {
  const { user, updateProfileDetails, changeUserPassword } = useAuth();
  const [profileTab, setProfileTab] = useState('details'); // 'details', 'security'
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [fileError, setFileError] = useState(null);

  const {
    register: detailsRegister,
    handleSubmit: handleDetailsSubmit,
    formState: { errors: detailsErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      department: user?.department || 'CSE',
      semester: user?.semester || '1',
    }
  });

  const {
    register: securityRegister,
    handleSubmit: handleSecuritySubmit,
    reset: resetSecurityForm,
    formState: { errors: securityErrors },
  } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  // Avatar Upload Handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setFileError(validation.error);
      return;
    }

    setFileError(null);
    setLoadingLocal(true);
    try {
      // Compress avatar with canvas (max 300x300, 80% JPEG)
      const base64Avatar = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 300;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_DIM) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              }
            } else {
              if (height > MAX_DIM) {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = () => resolve(event.target.result);
        };
        reader.onerror = () => resolve('');
      });

      await updateProfileDetails(user.uid, { profilePicUrl: base64Avatar });
      
      Swal.fire({
        icon: 'success',
        title: 'Avatar Updated',
        text: 'Your profile picture has been modified.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to update avatar.', 'error');
    } finally {
      setLoadingLocal(false);
    }
  };

  // Submit Profile Details Handler
  const onDetailsSubmit = async (data) => {
    setLoadingLocal(true);
    try {
      await updateProfileDetails(user.uid, data);
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your details have been saved successfully.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to update details.', 'error');
    } finally {
      setLoadingLocal(false);
    }
  };

  // Submit Password Change Handler
  const onSecuritySubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      Swal.fire('Mismatch', 'New password and confirm password fields must match.', 'warning');
      return;
    }

    setLoadingLocal(true);
    try {
      await changeUserPassword(data.oldPassword, data.newPassword);
      Swal.fire({
        icon: 'success',
        title: 'Password Changed',
        text: 'Your password has been updated. (Simulated in mock mode)',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
      resetSecurityForm();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Change Failed',
        text: err.message || 'Incorrect old password.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black font-display text-slate-800 dark:text-white tracking-tight">
          My Account Settings
        </h2>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">
          Manage profile configurations and security options
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-dark-border gap-2">
        <button
          onClick={() => setProfileTab('details')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 tracking-wide cursor-pointer transition-all ${
            profileTab === 'details'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-slate-405 hover:text-slate-600'
          }`}
        >
          General Settings
        </button>
        <button
          onClick={() => setProfileTab('security')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 tracking-wide cursor-pointer transition-all ${
            profileTab === 'security'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-slate-405 hover:text-slate-600'
          }`}
        >
          Account Security
        </button>
      </div>

      {profileTab === 'details' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar box column (1 span) */}
          <div className="md:col-span-1">
            <Card title="Avatar Setup" bodyClassName="flex flex-col items-center py-6">
              <div className="relative w-28 h-28 rounded-full border border-slate-200 dark:border-dark-border overflow-hidden">
                {loadingLocal ? (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white">
                    <FiLoader className="animate-spin text-2xl" />
                  </div>
                ) : (
                  <img
                    src={user?.profilePicUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&fit=crop'}
                    alt="avatar profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Upload trigger */}
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={loadingLocal}
              />
              <label
                htmlFor="avatarInput"
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 text-xs font-bold rounded-lg border border-slate-200 dark:border-dark-border cursor-pointer transition-all"
              >
                <FiCamera /> Change Photo
              </label>
              {fileError && <p className="text-red-500 text-[10px] mt-2 font-semibold text-center">{fileError}</p>}
            </Card>
          </div>

          {/* Details edit column (2 span) */}
          <div className="md:col-span-2">
            <Card title="General Profile Details" subtitle="Make sure phone numbers are 10 digits">
              <form onSubmit={handleDetailsSubmit(onDetailsSubmit)} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FiUser />
                    </div>
                    <input
                      type="text"
                      {...detailsRegister('name', { required: 'Name is required' })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  {detailsErrors.name && <p className="text-red-500 text-xs mt-1">{detailsErrors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Email Address (Immutable)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FiMail />
                    </div>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-100 dark:bg-slate-900 text-slate-405 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Department
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <FiBookOpen />
                      </div>
                      <select
                        disabled={user?.role === 'admin'}
                        {...detailsRegister('department')}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm disabled:cursor-not-allowed"
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
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Semester
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <FiBookmark />
                      </div>
                      <select
                        disabled={user?.role === 'admin'}
                        {...detailsRegister('semester')}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm disabled:cursor-not-allowed"
                      >
                        {user?.role === 'admin' ? (
                          <option value="N/A">N/A</option>
                        ) : (
                          [1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={s.toString()}>Sem {s}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FiPhone />
                    </div>
                    <input
                      type="text"
                      {...detailsRegister('phoneNumber', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[+]?[0-9\s-]{10,15}$/,
                          message: 'Invalid phone number (must be 10-15 digits)'
                        }
                      })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  {detailsErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{detailsErrors.phoneNumber.message}</p>}
                </div>

                <div className="flex justify-end pt-3">
                  <Button variant="primary" size="md" type="submit" loading={loadingLocal}>
                    Save Configurations
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      ) : (
        <Card title="Update Password Security" subtitle="Provide your existing password to verify edits">
          <form onSubmit={handleSecuritySubmit(onSecuritySubmit)} className="space-y-4 text-left max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiLock />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...securityRegister('oldPassword', { required: 'Current password is required' })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>
              {securityErrors.oldPassword && <p className="text-red-500 text-xs mt-1">{securityErrors.oldPassword.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiLock />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...securityRegister('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>
              {securityErrors.newPassword && <p className="text-red-500 text-xs mt-1">{securityErrors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiLock />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...securityRegister('confirmPassword', { required: 'Please confirm password' })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>
              {securityErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{securityErrors.confirmPassword.message}</p>}
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="primary" size="md" type="submit" loading={loadingLocal}>
                Update Security Credentials
              </Button>
            </div>
          </form>
        </Card>
      )}

    </div>
  );
}

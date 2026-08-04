import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { Award, Phone, Mail, MapPin, Calendar, Heart, Shield, Camera, Edit2, Save, LogOut } from 'lucide-react';
import { ImageCropperModal } from '../components/ImageCropperModal';

export const Profile: React.FC = () => {
  const { currentUser, updateCurrentUser, logout } = useAuth();
  const { students, teachers, classes, sections, subjects } = useAppData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  const isTeacher = currentUser.role === 'teacher';
  const isStudent = currentUser.role === 'student';
  const isAdmin = currentUser.role === 'admin';

  // Admin edit states
  const [isEditingAdmin, setIsEditingAdmin] = useState<boolean>(false);
  const [adminName, setAdminName] = useState<string>(currentUser?.name || '');
  const [adminEmail, setAdminEmail] = useState<string>(currentUser?.email || '');
  const [adminPhone, setAdminPhone] = useState<string>(currentUser?.phone || '');
  const [adminAvatar, setAdminAvatar] = useState<string>(currentUser?.avatar || '');
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);

  // Find respective profile info
  const studentProf = students.find(s => 
    s.id === currentUser.id || 
    (currentUser.phone && (s.phone === currentUser.phone || s.parentPhone === currentUser.phone)) ||
    (currentUser.name && s.name.toLowerCase() === currentUser.name.toLowerCase())
  ) || students[0];

  const teacherProf = teachers.find(t => 
    t.id === currentUser.id || 
    (currentUser.phone && (t.phone === currentUser.phone || t.email === currentUser.email)) ||
    (currentUser.name && t.name.toLowerCase() === currentUser.name.toLowerCase())
  ) || teachers[0];

  const renderStudentProfile = () => {
    if (!studentProf) return <p className="text-sm text-slate-500">Student profile details not seeded.</p>;
    
    const classObj = classes.find(c => c.id === studentProf.classId);
    const sectionObj = sections.find(s => s.id === studentProf.sectionId);

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-premium">
        
        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-primary to-primary-dark h-32 relative mb-14">
          <div className="absolute -bottom-10 left-6 sm:left-8">
            <img 
              src={currentUser.avatar || studentProf.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&h=150&fit=crop'} 
              alt={studentProf.name} 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-md bg-white"
            />
          </div>
        </div>

        {/* Profile Body */}
        <div className="p-6 md:p-8 pt-2 space-y-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{studentProf.name}</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Student / {classObj?.name || 'Class 8'}-{sectionObj?.name || 'A'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs md:text-sm font-semibold">
            {/* Box 1: Academic details */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Academic Details</h4>
              <div className="space-y-2 text-slate-700 dark:text-slate-350">
                <div className="flex justify-between">
                  <span>Admission Number:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{studentProf.admissionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Roll Number:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{studentProf.rollNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Section Stream:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">CBSE Affiliation</span>
                </div>
              </div>
            </div>

            {/* Box 2: Personal details */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Personal Information</h4>
              <div className="space-y-2 text-slate-700 dark:text-slate-350">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><Calendar size={12} /> DOB:</span>
                  <span className="font-bold">{studentProf.dob}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Gender:</span>
                  <span className="font-bold">{studentProf.gender}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><Heart size={12} className="text-rose-500" /> Blood Group:</span>
                  <span className="font-bold text-rose-500">{studentProf.bloodGroup}</span>
                </div>
              </div>
            </div>

            {/* Box 3: Parent details */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Guardians details</h4>
              <div className="space-y-2 text-slate-700 dark:text-slate-350">
                <div className="flex justify-between">
                  <span>Father's Name:</span>
                  <span className="font-bold">{studentProf.fatherName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mother's Name:</span>
                  <span className="font-bold">{studentProf.motherName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><Phone size={12} /> Parent Phone:</span>
                  <span className="font-bold font-mono">{studentProf.parentPhone}</span>
                </div>
              </div>
            </div>

            {/* Box 4: Address Contact */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Contact Info & Address</h4>
              <div className="space-y-2 text-slate-700 dark:text-slate-350">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{studentProf.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span>{studentProf.email || 'not-defined@savitrividyavihar.com'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderTeacherProfile = () => {
    if (!teacherProf) return <p className="text-sm text-slate-500">Teacher profile details not seeded.</p>;

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-premium">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-secondary to-secondary-dark h-32 relative mb-14">
          <div className="absolute -bottom-10 left-6 sm:left-8">
            <img 
              src={currentUser.avatar || teacherProf.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'} 
              alt={teacherProf.name} 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-md bg-white"
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 pt-2 space-y-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{teacherProf.name}</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Teacher / Staff member
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm font-semibold">
            {/* Box 1: Employee Card */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Employment Details</h4>
              <div className="space-y-2 text-slate-700 dark:text-slate-350">
                <div className="flex justify-between">
                  <span>Employee ID:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{teacherProf.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Department:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{teacherProf.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Award size={12} /> Qualification:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{teacherProf.qualification}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Contacts */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Contact Info</h4>
              <div className="space-y-2 text-slate-700 dark:text-slate-350">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><Phone size={12} /> Contact Number:</span>
                  <span className="font-bold font-mono">{teacherProf.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><Mail size={12} /> Work Email:</span>
                  <span className="font-bold truncate max-w-[150px]">{teacherProf.email}</span>
                </div>
              </div>
            </div>

            {/* Box 3: Assigned Syllabus subjects */}
            <div className="col-span-1 md:col-span-2 space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Teaching Subjects & Assigned Class Matrices</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-300 text-xs mb-2">Subject Syllabus</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {teacherProf.subjects.map(subId => {
                      const sub = subjects.find(s => s.id === subId);
                      return (
                        <span key={subId} className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-lg dark:bg-primary/20 dark:text-blue-400">
                          {sub?.name || subId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-300 text-xs mb-2">Rosters Assigned</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {teacherProf.assignedClasses.map((ac, idx) => {
                      const cls = classes.find(c => c.id === ac.classId);
                      const sec = sections.find(s => s.id === ac.sectionId);
                      return (
                        <span key={idx} className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg dark:bg-slate-805 dark:text-slate-300">
                          {cls?.name || ac.classId}-{sec?.name || ac.sectionId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderAdminProfile = () => {
    const handleSaveProfile = () => {
      updateCurrentUser({
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        avatar: adminAvatar
      });
      setIsEditingAdmin(false);
      alert('Admin Profile updated successfully!');
    };

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-premium space-y-6 max-w-lg">
        <div className="flex flex-col items-center sm:flex-row gap-5">
          <div className="relative group cursor-pointer" onClick={() => setIsCropperOpen(true)}>
            <img 
              src={adminAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
              alt={currentUser.name} 
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-850 shadow-md group-hover:opacity-85 transition-opacity" 
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} />
            </div>
            <span className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900">
              <Camera size={12} />
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{currentUser.name}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              School Administrator / Principal
            </p>
            <button
              onClick={() => setIsEditingAdmin(!isEditingAdmin)}
              className="mt-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 font-bold text-xs rounded-xl flex items-center justify-center gap-1 mx-auto sm:mx-0 transition-all btn-tap-effect"
            >
              <Edit2 size={12} /> {isEditingAdmin ? "Cancel Editing" : "Edit Profile Info"}
            </button>
          </div>
        </div>

        {isEditingAdmin ? (
          /* Editable Form */
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-5 text-xs">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Mobile Number</label>
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 transition-all btn-tap-effect"
            >
              <Save size={14} /> Save Profile Changes
            </button>
          </div>
        ) : (
          /* View Only Details */
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-400"><Phone size={13} /> Primary Phone:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">{currentUser.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-400"><Mail size={13} /> Official Email:</span>
              <span className="text-slate-900 dark:text-slate-200">{currentUser.email || 'admin@savitrividyavihar.com'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-400"><Shield size={13} /> Security Privilege:</span>
              <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2.5 py-0.5 rounded-full uppercase font-bold text-[9px] flex items-center gap-0.5">
                <Shield size={10} /> Full Administrative Root
              </span>
            </div>
          </div>
        )}

        <ImageCropperModal
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={(croppedBase64) => {
            setAdminAvatar(croppedBase64);
            setIsCropperOpen(false);
            // Auto update avatar in context
            updateCurrentUser({ avatar: croppedBase64 });
          }}
          title="Upload & Crop Administrator Avatar"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Institutional Profile</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Review your enrolled records, contacts, and classes.
        </p>
      </div>

      {isStudent && renderStudentProfile()}
      {isTeacher && renderTeacherProfile()}
      {isAdmin && renderAdminProfile()}

      {/* Log Out Action Card */}
      <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-lg shadow-sm">
        <div>
          <h4 className="font-bold text-rose-800 dark:text-rose-300 text-sm flex items-center gap-2">
            <LogOut size={18} className="text-rose-600 dark:text-rose-400" />
            Session Control
          </h4>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
            Sign out of your active SVV ERP session on this device.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all shrink-0 w-full sm:w-auto justify-center btn-tap-effect"
        >
          <LogOut size={16} />
          Sign Out / Log Out
        </button>
      </div>
    </div>
  );
};
export default Profile;

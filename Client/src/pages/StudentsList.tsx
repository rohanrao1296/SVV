import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import type { StudentProfile } from '../types';
import { 
  Users, 
  Search, 
  Edit3, 
  UserPlus, 
  X, 
  Save, 
  AlertTriangle,
  Camera,
  Trash2
} from 'lucide-react';
import { ImageCropperModal } from '../components/ImageCropperModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const StudentsList: React.FC = () => {
  const { students, classes, sections, addStudent, updateStudent, deleteStudent } = useAppData();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const isAdmin = currentUser?.role === 'admin';

  // Search & Filter States
  const [classId, setClassId] = useState<string>('c_8');
  const [sectionId, setSectionId] = useState<string>('s_a');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Check if current user is Admin OR Teacher
  const canEditStudent = isAdmin || currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  // Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    rollNumber: '',
    admissionNumber: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: 'Male',
    classId: 'c_8',
    sectionId: 's_a',
    bloodGroup: 'O+',
    password: 'student123',
    address: '',
    phone: '',
    parentPhone: '',
    email: '',
    photo: '',
  });

  const [createdCredentials, setCreatedCredentials] = useState<{ name: string; phone: string; pass: string } | null>(null);

  const generateNextAdmissionNumber = () => {
    const existingAdmissions = new Set(
      (students || []).map(s => (s.admissionNumber || '').trim().toUpperCase())
    );

    let maxNum = 2600;
    (students || []).forEach(s => {
      if (s.admissionNumber) {
        const match = s.admissionNumber.match(/SVV(\d+)/i);
        if (match && match[1]) {
          const parsed = parseInt(match[1], 10);
          if (!isNaN(parsed) && parsed > maxNum) {
            maxNum = parsed;
          }
        }
      }
    });

    let nextCandidate = maxNum + 1;
    if (nextCandidate < 2601) nextCandidate = 2601;

    while (existingAdmissions.has(`SVV${nextCandidate}`)) {
      nextCandidate++;
    }

    return `SVV${nextCandidate}`;
  };

  const resetForm = () => {
    setForm({
      name: '',
      rollNumber: '',
      admissionNumber: generateNextAdmissionNumber(),
      fatherName: '',
      motherName: '',
      dob: '',
      gender: 'Male',
      classId: classId,
      sectionId: sectionId,
      bloodGroup: 'O+',
      password: 'student123',
      address: '',
      phone: '',
      parentPhone: '',
      email: '',
      photo: '',
    });
    setFormError(null);
  };

  const handleOpenAdd = () => {
    if (!canEditStudent) {
      showError('Only Teachers and Administrators can add new students.');
      return;
    }
    setEditingStudent(null);
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (student: StudentProfile) => {
    if (!canEditStudent) {
      showError('Only Teachers and Administrators are authorized to edit student profiles.');
      return;
    }
    setEditingStudent(student);
    setForm({
      name: student.name || '',
      rollNumber: student.rollNumber || '',
      admissionNumber: student.admissionNumber || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      dob: student.dob || '',
      gender: student.gender || 'Male',
      classId: student.classId || classId,
      sectionId: student.sectionId || sectionId,
      bloodGroup: student.bloodGroup || 'O+',
      password: 'student123',
      address: student.address || '',
      phone: student.phone || student.parentPhone || '',
      parentPhone: student.parentPhone || '',
      email: student.email || '',
      photo: student.photo || '',
    });
    setFormError(null);
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showError('File size exceeds 1MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!canEditStudent) {
      const msg = 'Only Teachers and Administrators are authorized to save changes to student profiles.';
      setFormError(msg);
      showError(msg);
      return;
    }

    // Validation checks
    if (!form.name || !form.rollNumber || !form.admissionNumber || !form.parentPhone) {
      const msg = 'Please fill out Name, Roll Number, Admission Number, and Parent Phone.';
      setFormError(msg);
      showError(msg);
      return;
    }

    const payload = {
      ...form,
      fatherName: form.fatherName || 'N/A',
      motherName: form.motherName || 'N/A',
      phone: form.phone || form.parentPhone || '9876543210'
    };

    if (editingStudent) {
      // Update
      const success = await updateStudent({
        ...payload,
        id: editingStudent.id,
        photo: form.photo || editingStudent.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&h=150&fit=crop&crop=face'
      });
      if (success) {
        showSuccess('Student profile updated successfully.');
        setIsOpen(false);
        setEditingStudent(null);
      }
    } else {
      // Add new
      const targetAdm = (form.admissionNumber || '').trim().toUpperCase();
      const exists = (students || []).some(s => (s.admissionNumber || '').trim().toUpperCase() === targetAdm);
      if (exists) {
        const msg = `Student with Admission Number '${form.admissionNumber}' already exists.`;
        setFormError(msg);
        showError(msg);
        return;
      }

      const success = await addStudent({
        ...payload,
        photo: form.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&h=150&fit=crop&crop=face'
      });
      if (success) {
        showSuccess('Student profile registered in database.');
        setCreatedCredentials({
          name: form.name,
          phone: payload.phone,
          pass: form.password || 'student123'
        });
        setIsOpen(false);
        setEditingStudent(null);
      }
    }
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!isAdmin) {
      showError('Only Administrator can delete student profiles.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete '${name}' and their login credentials from database?`)) {
      const success = await deleteStudent(studentId);
      if (success) {
        showSuccess(`Student profile for '${name}' deleted.`);
      } else {
        showError('Failed to delete student.');
      }
    }
  };

  // Filter list defensively
  const filteredStudents = (students || []).filter(
    s => (s.classId || 'c_8') === classId && (s.sectionId || 's_a') === sectionId
  );

  const visibleStudents = filteredStudents.filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.rollNumber || '').includes(searchQuery) ||
    (s.admissionNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Student Directory</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Manage student rosters, insert new admission profiles, or edit contact details.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:bg-primary-hover transition-all btn-tap-effect w-fit"
        >
          <UserPlus size={14} /> Add New Student
        </button>
      </div>

      {/* Selector & Search Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filter Class</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full p-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filter Section</label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full p-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary"
            >
              {sections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
            </select>
          </div>

          <div className="relative">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Student</label>
            <span className="absolute bottom-3 left-3 text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by name, roll, or admission number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-premium">
        {visibleStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6 w-20">Roll No</th>
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Admission Number</th>
                  <th className="py-3 px-4">Father Name</th>
                  <th className="py-3 px-4">Parent Phone</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-center">Modify</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-350">
                {visibleStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="py-4 px-6 font-bold text-slate-450">{student.rollNumber}</td>
                    <td className="py-4 px-4 font-semibold flex items-center gap-3">
                      <img src={student.photo} alt={student.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                      <div>
                        <span className="text-slate-800 dark:text-slate-200">{student.name}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">DOB: {student.dob}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">{student.admissionNumber}</td>
                    <td className="py-4 px-4">{student.fatherName}</td>
                    <td className="py-4 px-4 font-mono">{student.parentPhone}</td>
                    <td className="py-4 px-4 max-w-xs truncate" title={student.address}>{student.address}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleOpenEdit(student)}
                          className={`p-1.5 rounded-lg transition-colors btn-tap-effect ${
                            canEditStudent 
                              ? 'bg-slate-100 hover:bg-primary/10 hover:text-primary dark:bg-slate-800' 
                              : 'bg-slate-50 text-slate-300 dark:bg-slate-850 dark:text-slate-600 cursor-not-allowed'
                          }`}
                          title={canEditStudent ? "Edit Student Profile" : "Only Class Teachers & Admin can edit students"}
                        >
                          <Edit3 size={14} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 dark:bg-rose-950/30 rounded-lg transition-colors btn-tap-effect"
                            title="Delete Student Profile"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            <Users className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={36} />
            No student profiles found. Click "Add New Student" to seed.
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-fluent-depth space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base flex items-center gap-1.5">
                <Users size={18} className="text-primary" />
                {editingStudent ? `Modify Profile: ${editingStudent.name}` : 'Register New Student'}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs border border-rose-100 dark:border-rose-900/30 flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-650 dark:text-slate-350">
              
              {/* Photo Upload and Preview */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 mb-2">
                <div className="relative">
                  {form.photo ? (
                    <img src={form.photo} alt="Student Preview" className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-250 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <Users size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student Photograph</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Upload JPEG or PNG file (Max size: 1MB)</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">Student Full Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Aarav Kumar"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Admission No */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-455">Admission Number *</label>
                    <span className="text-[9px] font-bold text-primary">Editable</span>
                  </div>
                  <input 
                    type="text" 
                    name="admissionNumber"
                    required
                    value={form.admissionNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. SVV2601"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary font-mono font-bold"
                  />
                  <span className="block text-[9px] text-slate-400 mt-1">Default auto-starts at SVV2601. You can modify it.</span>
                </div>

                {/* Roll No */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1">Roll Number *</label>
                  <input 
                    type="text" 
                    name="rollNumber"
                    required
                    value={form.rollNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 15"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Class */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Assigned Class</label>
                  <select
                    name="classId"
                    value={form.classId}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                  >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Section</label>
                  <select
                    name="sectionId"
                    value={form.sectionId}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                  >
                    {sections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    name="dob"
                    value={form.dob}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="e.g. parent@email.com"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Student Phone</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder="10-digit number"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Parent Phone (for Alert SMS/WA) *</label>
                  <input 
                    type="tel" 
                    name="parentPhone"
                    required
                    value={form.parentPhone}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder="Primary contact phone"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>

                {/* Father Name */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Father's Full Name *</label>
                  <input 
                    type="text" 
                    name="fatherName"
                    required
                    value={form.fatherName}
                    onChange={handleInputChange}
                    placeholder="Father Name"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Mother Name */}
                <div className="md:col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Mother\'s Full Name *</label>
                  <input 
                    type="text" 
                    name="motherName"
                    required
                    value={form.motherName}
                    onChange={handleInputChange}
                    placeholder="Mother Name"
                    className="w-full p-2.5 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Photo Upload and Crop */}
                <div className="md:col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Student Photo</label>
                  <div className="flex items-center gap-3">
                    {form.photo ? (
                      <img 
                        src={form.photo} 
                        alt="Student preview" 
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0" 
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 font-bold text-[10px] shrink-0">
                        No Pic
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsCropperOpen(true)}
                      className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all btn-tap-effect"
                    >
                      <Camera size={14} />
                      {form.photo ? 'Change Photo' : 'Upload & Crop'}
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1">Residential Address *</label>
                  <textarea 
                    name="address"
                    required
                    value={form.address}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Enter street, colony and pin details..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>

                {/* Login Password */}
                <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40">
                  <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Set Login Password (Username = Mobile Number)</label>
                  <input 
                    type="text" 
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="Default: student123"
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary text-xs font-mono font-bold text-slate-800 dark:text-slate-100"
                  />
                  <p className="text-[10px] text-blue-500 mt-1">This password will be used by the student/parent to log in on the portal.</p>
                </div>

              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-250 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-550 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-primary-hover flex items-center gap-1 btn-tap-effect"
                >
                  <Save size={14} /> {editingStudent ? 'Save Changes' : 'Register Student'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Generated Credentials Popup Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-premium text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                Student Registered & Credentials Created!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Provide these login details to {createdCredentials.name}:
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5 font-mono">
              <div><span className="text-slate-400">Username (Phone):</span> <strong className="text-slate-800 dark:text-slate-100">{createdCredentials.phone}</strong></div>
              <div><span className="text-slate-400">Password:</span> <strong className="text-primary">{createdCredentials.pass}</strong></div>
            </div>

            <button
              onClick={() => setCreatedCredentials(null)}
              className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {isCropperOpen && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={(croppedBase64) => {
            setForm(prev => ({ ...prev, photo: croppedBase64 }));
            setIsCropperOpen(false);
          }}
          title="Upload & Crop Student Photo"
          circularMask={false}
        />
      )}


    </div>
  );
};
export default StudentsList;

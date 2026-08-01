import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import type { TeacherProfile } from '../types';
import { 
  UserPlus, 
  Search, 
  Trash2, 
  Edit2, 
  Mail, 
  Phone, 
  Briefcase, 
  BookOpen, 
  Users, 
  GraduationCap, 
  X,
  Plus,
  Camera
} from 'lucide-react';
import { ImageCropperModal } from '../components/ImageCropperModal';

import { useToast } from '../context/ToastContext';

export const StaffList: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { 
    teachers, 
    classes, 
    sections, 
    subjects, 
    addTeacher, 
    updateTeacher, 
    deleteTeacher 
  } = useAppData();


  const [searchQuery, setSearchQuery] = useState('');
  const [designationFilter, setDesignationFilter] = useState<'all' | 'teacher' | 'class_teacher' | 'driver' | 'peon' | 'other'>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<TeacherProfile | null>(null);
  
  // Form fields state
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [qualification, setQualification] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState<'teacher' | 'class_teacher' | 'driver' | 'peon' | 'other'>('teacher');
  const [photo, setPhoto] = useState('');
  const [password, setPassword] = useState('teacher123');
  const [createdCredentials, setCreatedCredentials] = useState<{ name: string; phone: string; pass: string } | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  
  // Subject check state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  // Assigned classes state: { classId, sectionId }[]
  const [assignedClasses, setAssignedClasses] = useState<{ classId: string; sectionId: string }[]>([]);
  const [newClassId, setNewClassId] = useState(classes[0]?.id || '');
  const [newSectionId, setNewSectionId] = useState(sections[0]?.id || '');

  const openAddModal = () => {
    setEditingStaff(null);
    setName('');
    setEmployeeId(`EMP-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`);
    setPhone('');
    setPassword('teacher123');
    setEmail('');
    setQualification('');
    setDepartment('Academics');
    setDesignation('teacher');
    setPhoto('');
    setSelectedSubjects([]);
    setAssignedClasses([]);
    setIsModalOpen(true);
  };


  const openEditModal = (staff: TeacherProfile) => {
    setEditingStaff(staff);
    setName(staff.name);
    setEmployeeId(staff.employeeId);
    setPhone(staff.phone);
    setEmail(staff.email);
    setQualification(staff.qualification);
    setDepartment(staff.department);
    setDesignation(staff.designation);
    setPhoto(staff.photo || '');
    setSelectedSubjects(staff.subjects || []);
    setAssignedClasses(staff.assignedClasses || []);
    setIsModalOpen(true);
  };

  const handleAddClass = () => {
    if (!newClassId || !newSectionId) return;
    // Prevent duplicates
    const alreadyAssigned = assignedClasses.some(
      c => c.classId === newClassId && c.sectionId === newSectionId
    );
    if (!alreadyAssigned) {
      setAssignedClasses([...assignedClasses, { classId: newClassId, sectionId: newSectionId }]);
    }
  };

  const handleRemoveClass = (index: number) => {
    setAssignedClasses(assignedClasses.filter((_, i) => i !== index));
  };

  const handleToggleSubject = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !employeeId || !phone || !email) {
      showError('Please fill in all required fields.');
      return;
    }

    const payload = {
      name,
      employeeId,
      phone,
      password: password || 'teacher123',
      email,
      qualification,
      department,
      designation,
      photo: photo || undefined,
      subjects: ['teacher', 'class_teacher'].includes(designation) ? selectedSubjects : [],
      assignedClasses: ['teacher', 'class_teacher'].includes(designation) ? assignedClasses : []
    };

    let success = false;
    if (editingStaff) {
      success = await updateTeacher({ ...payload, id: editingStaff.id });
      if (success) {
        showSuccess('Staff profile updated successfully!');
        setIsModalOpen(false);
      }
    } else {
      success = await addTeacher(payload as any);
      if (success) {
        showSuccess('Teacher registered in database!');
        setCreatedCredentials({
          name,
          phone,
          pass: password || 'teacher123'
        });
        setIsModalOpen(false);
      }
    }

    if (!success) {
      showError('An error occurred while saving staff details.');
    }
  };

  const handleDelete = async (staffId: string, staffName: string) => {
    if (window.confirm(`Are you sure you want to remove ${staffName} from the school directory?`)) {
      const success = await deleteTeacher(staffId);
      if (success) {
        showSuccess('Staff record removed successfully.');
      }
    }
  };


  // Filter staff list
  const filteredStaff = teachers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          staff.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDesignation = designationFilter === 'all' || staff.designation === designationFilter;
    return matchesSearch && matchesDesignation;
  });

  const getDesignationBadgeColor = (des: string) => {
    switch (des) {
      case 'class_teacher':
        return 'bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/30';
      case 'teacher':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case 'driver':
        return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
      case 'peon':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getDesignationLabel = (des: string) => {
    switch (des) {
      case 'class_teacher': return 'Class Teacher';
      case 'teacher': return 'Subject Teacher';
      case 'driver': return 'Transport (Driver)';
      case 'peon': return 'Staff (Peon)';
      default: return 'Other Staff';
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Staff & Teachers Directory</h2>
          <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
            Add, update, or remove school faculty and utility staff, and configure classroom assignments.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary-hover flex items-center justify-center gap-1.5 shrink-0 btn-tap-effect"
        >
          <UserPlus size={14} /> Add New Staff
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Designation Toggles */}
        <div className="flex gap-2 text-[10px] sm:text-xs font-bold w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          {(['all', 'teacher', 'class_teacher', 'driver', 'peon', 'other'] as const).map(des => (
            <button
              key={des}
              onClick={() => setDesignationFilter(des)}
              className={`px-3 py-1.5 rounded-xl border capitalize whitespace-nowrap transition-all ${
                designationFilter === des 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-750 hover:bg-slate-50'
              }`}
            >
              {des === 'all' ? 'All' : getDesignationLabel(des)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80 text-xs font-semibold">
          <span className="absolute bottom-2.5 left-3 text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by name or Employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-xs"
          />
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.length > 0 ? (
          filteredStaff.map(staff => {
            return (
              <div 
                key={staff.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium relative flex flex-col justify-between overflow-hidden"
              >
                {/* Visual Accent Badge */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  staff.designation === 'class_teacher' ? 'bg-violet-500' :
                  staff.designation === 'teacher' ? 'bg-emerald-500' :
                  staff.designation === 'driver' ? 'bg-blue-500' : 'bg-amber-400'
                }`} />

                <div className="space-y-4 pt-1">
                  {/* Top section - avatar and basic info */}
                  <div className="flex items-center gap-3">
                    {staff.photo ? (
                      <img 
                        src={staff.photo} 
                        alt={staff.name} 
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-200 dark:border-slate-700 shadow-sm text-sm">
                        {staff.name.charAt(0)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm truncate">{staff.name}</h4>
                      <p className="text-[10px] text-slate-450 font-bold tracking-wider uppercase mt-0.5">{staff.employeeId}</p>
                    </div>
                  </div>

                  {/* Badge */}
                  <div>
                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${getDesignationBadgeColor(staff.designation)}`}>
                      {getDesignationLabel(staff.designation)}
                    </span>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-2 text-xs font-semibold text-slate-650 dark:text-slate-450 pt-2 border-t border-slate-100 dark:border-slate-850">
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      <span>{staff.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                    {staff.qualification && (
                      <div className="flex items-center gap-2">
                        <GraduationCap size={13} className="text-slate-400" />
                        <span className="truncate">{staff.qualification}</span>
                      </div>
                    )}
                    {staff.department && (
                      <div className="flex items-center gap-2">
                        <Briefcase size={13} className="text-slate-400" />
                        <span>{staff.department}</span>
                      </div>
                    )}
                  </div>

                  {/* Class and Subject details (Only if Teacher/Class Teacher) */}
                  {['teacher', 'class_teacher'].includes(staff.designation) && (
                    <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                      {/* Subjects */}
                      <div className="flex flex-wrap gap-1 items-center">
                        <BookOpen size={13} className="text-slate-400 mr-1" />
                        {(staff.subjects || []).length > 0 ? (
                          (staff.subjects || []).map(subId => {
                            const subName = subjects.find(s => s.id === subId)?.name || subId;
                            return (
                              <span key={subId} className="bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500 font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                {subName}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No subjects assigned</span>
                        )}
                      </div>

                      {/* Assigned classes */}
                      <div className="flex flex-wrap gap-1 items-center">
                        <Users size={13} className="text-slate-400 mr-1" />
                        {(staff.assignedClasses || []).length > 0 ? (
                          (staff.assignedClasses || []).map((cls, idx) => {
                            const className = classes.find(c => c.id === cls.classId)?.name || cls.classId;
                            const secName = sections.find(s => s.id === cls.sectionId)?.name || cls.sectionId;
                            return (
                              <span key={idx} className="bg-primary/5 dark:bg-primary/10 text-primary dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-primary/10">
                                {className} - {secName}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No classes assigned</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex gap-2.5 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openEditModal(staff)}
                    className="flex-1 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all btn-tap-effect"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(staff.id, staff.name)}
                    className="flex-1 py-1.5 border border-rose-200 dark:border-rose-950/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-455 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all btn-tap-effect"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 text-slate-450 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium">
            <Users className="mx-auto text-slate-300 dark:text-slate-700 mb-2 animate-bounce" size={40} />
            No staff records found matching filter rules.
          </div>
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 shrink-0">
              <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-base flex items-center gap-1.5">
                <Briefcase size={18} className="text-primary" />
                {editingStaff ? 'Edit Staff Profile' : 'Register New Staff Member'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs font-semibold text-slate-700 dark:text-slate-350">
              
              {/* Row 1: Name and Employee ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mrs. Sunita Verma"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. EMP-2026-08"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Designation and Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Designation / Role *</label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="teacher">Subject Teacher</option>
                    <option value="class_teacher">Class Teacher</option>
                    <option value="driver">Transport (Driver)</option>
                    <option value="peon">Staff (Peon)</option>
                    <option value="other">Other staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Science, Transport, Admin Support"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Number (For Login) *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@savitrividyavihar.com"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Photo URL and Qualification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Profile Photo</label>
                  <div className="flex items-center gap-3">
                    {photo ? (
                      <img 
                        src={photo} 
                        alt="Staff Preview" 
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0" 
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 flex items-center justify-center text-slate-400 font-bold text-[10px] shrink-0">
                        No Pic
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsCropperOpen(true)}
                      className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-350 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all btn-tap-effect"
                    >
                      <Camera size={14} />
                      {photo ? 'Change Photo' : 'Upload & Crop'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. M.Sc. B.Ed, Graduate, Intermediate"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Academic Details - Conditional display if role is Teacher or Class Teacher */}
              {['teacher', 'class_teacher'].includes(designation) && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">Academic Assignments</h4>

                  {/* Subjects Selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Assign Teaching Subjects</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {subjects.map(sub => (
                        <label 
                          key={sub.id} 
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                            selectedSubjects.includes(sub.id)
                              ? 'bg-primary/5 text-primary border-primary/30 dark:bg-primary/10 dark:text-blue-400'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubjects.includes(sub.id)}
                            onChange={() => handleToggleSubject(sub.id)}
                            className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span>{sub.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Classes Assignments */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Assign Classes & Sections</label>
                    
                    {/* Add pair row */}
                    <div className="flex gap-2 items-center bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-3">
                      <div className="flex-1">
                        <select
                          value={newClassId}
                          onChange={(e) => setNewClassId(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        >
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <select
                          value={newSectionId}
                          onChange={(e) => setNewSectionId(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        >
                          {sections.map(s => (
                            <option key={s.id} value={s.id}>Section {s.name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddClass}
                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover shadow-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Assigned class lists */}
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {assignedClasses.length > 0 ? (
                        assignedClasses.map((cls, idx) => {
                          const cName = classes.find(c => c.id === cls.classId)?.name || cls.classId;
                          const sName = sections.find(s => s.id === cls.sectionId)?.name || cls.sectionId;
                          return (
                            <div 
                              key={idx} 
                              className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2 px-3 rounded-lg border border-slate-100 dark:border-slate-800"
                            >
                              <span className="font-bold text-slate-800 dark:text-slate-250">
                                {cName} - Section {sName}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveClass(idx)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-rose-500 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[10px] text-slate-400 italic py-1 pl-1">No classrooms assigned yet. Assign at least one to allow the teacher to take attendance.</p>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* Login Password Setting */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <label className="block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Set Login Password (Username = Mobile Number)</label>
                <input 
                  type="text" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Default: teacher123"
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary text-xs font-mono font-bold text-slate-800 dark:text-slate-100"
                />
                <p className="text-[10px] text-blue-500 mt-1">This password will be used by the teacher to log in on the portal.</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 dark:border-slate-750 text-slate-550 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary-hover btn-tap-effect"
                >
                  {editingStaff ? 'Save Changes' : 'Register Staff'}
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
                Teacher Registered & Credentials Created!
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
            setPhoto(croppedBase64);
            setIsCropperOpen(false);
          }}
          title="Upload & Crop Teacher/Staff Photo"
          circularMask={true} // Circle mask for teacher avatars
        />
      )}

    </div>
  );
};

export default StaffList;

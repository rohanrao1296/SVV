import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import type { LeaveRequest } from '../types';
import { 
  FileCheck, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  Award
} from 'lucide-react';
import LeaveCertificateModal from '../components/LeaveCertificateModal';

type StatusFilterType = 'pending' | 'approved' | 'rejected' | 'all';
type ReviewActionType = 'approved' | 'rejected';

export const LeaveRequestsManager: React.FC = () => {
  const { leaveRequests, updateLeaveStatus, classes, sections, students } = useAppData();
  
  // Filtering states (using database lowercase conventions)
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Remarks Modal State
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<ReviewActionType | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Certificate Modal State
  const [activeCertLeave, setActiveCertLeave] = useState<LeaveRequest | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const handleViewCertificate = (leave: LeaveRequest) => {
    setActiveCertLeave(leave);
    setIsCertModalOpen(true);
  };

  const handleOpenActionModal = (leave: LeaveRequest, action: ReviewActionType) => {
    setSelectedLeave(leave);
    setActionType(action);
    setRemarks('');
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedLeave || !actionType) return;
    
    const success = await updateLeaveStatus(selectedLeave.id, actionType, remarks);
    if (success) {
      alert(`Leave request has been successfully ${actionType}.`);
      setIsModalOpen(false);
      setSelectedLeave(null);
      setActionType(null);
    }
  };

  // Helper to calculate total days
  const calculateDays = (start: string, end: string) => {
    const sDate = new Date(start);
    const eDate = new Date(end);
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Filtered requests
  const filteredRequests = leaveRequests.filter(req => {
    const normReqStatus = (req.status || 'pending').toLowerCase();
    const matchesStatus = statusFilter === 'all' || normReqStatus === statusFilter;
    const nameToSearch = req.studentName || (req as any).applicantName || '';
    const matchesSearch = nameToSearch.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (req.reason || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Helper to capitalize status labels for UI
  const getStatusLabel = (status: StatusFilterType) => {
    if (status === 'all') return 'All';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Leave Requests</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Review, approve, or reject student leave applications submitted by parents.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          {(['pending', 'approved', 'rejected', 'all'] as StatusFilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab
                  ? 'bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {getStatusLabel(tab)} Leaves
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-xs"
          />
        </div>
      </div>

      {/* Leave Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map(req => {
            const cls = classes.find(c => c.id === req.classId);
            const sec = sections.find(s => s.id === req.sectionId);
            const days = calculateDays(req.startDate, req.endDate);
            const normStatus = (req.status || 'pending').toLowerCase();
            const studentDisplayName = req.studentName || (req as any).applicantName || 'Student';

            return (
              <div 
                key={req.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium space-y-4 relative overflow-hidden"
              >
                {/* Status Indicator Stripe */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  normStatus === 'approved' ? 'bg-emerald-500' :
                  normStatus === 'rejected' ? 'bg-rose-500' : 'bg-amber-400'
                }`} />

                <div className="flex justify-between items-start pt-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-850 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                      {studentDisplayName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{studentDisplayName}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {cls?.name || req.classId} - Section {sec?.name || req.sectionId}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border capitalize ${
                    normStatus === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/35' :
                    normStatus === 'rejected' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/35' :
                    'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/35'
                  }`}>
                    {normStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-semibold py-3 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/10 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar size={14} className="text-primary" />
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-bold">Duration</span>
                      <span>{new Date(req.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {new Date(req.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-850 pl-3">
                    <Clock size={14} className="text-primary" />
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-bold">Total Days</span>
                      <span>{days} {days === 1 ? 'Day' : 'Days'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Reason for Leave</span>
                  <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-semibold italic">
                    "{req.reason}"
                  </p>
                </div>

                {req.remarks && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/40 text-[11px] text-slate-500 border border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
                    <MessageSquare size={13} className="shrink-0 mt-0.5 text-primary" />
                    <p><strong>Remarks:</strong> {req.remarks}</p>
                  </div>
                )}

                {normStatus === 'pending' && (
                  <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenActionModal(req, 'rejected')}
                      className="flex-1 py-2 border border-rose-200 dark:border-rose-900/55 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-650 dark:text-rose-455 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X size={14} /> Reject
                    </button>
                    <button
                      onClick={() => handleOpenActionModal(req, 'approved')}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <Check size={14} /> Approve
                    </button>
                  </div>
                )}

                {normStatus === 'approved' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleViewCertificate(req)}
                      className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm btn-tap-effect"
                    >
                      <Award size={14} /> View Leave Certificate
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 text-slate-450 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium">
            <FileCheck className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={36} />
            No leave requests matching filter rules.
          </div>
        )}
      </div>

      {/* Review Dialog/Modal */}
      {isModalOpen && selectedLeave && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-fluent-depth space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm flex items-center gap-1.5">
                {actionType === 'approved' ? (
                  <CheckCircle size={18} className="text-emerald-500" />
                ) : (
                  <XCircle size={18} className="text-rose-500" />
                )}
                Confirm Leave {actionType === 'approved' ? 'Approval' : 'Rejection'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              You are {actionType === 'approved' ? 'approving' : 'rejecting'} the leave request of <strong>{selectedLeave.studentName}</strong>. Add reviewer comments or school guidelines below.
            </p>

            <div className="space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-350">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Review Remarks / Reason *</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Approved. Medical doc reviewed. / Rejected. Insufficient documentation."
                rows={3}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary text-xs"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-250 dark:border-slate-750 text-slate-500 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-white rounded-lg text-xs font-bold shadow-sm capitalize ${
                  actionType === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-650'
                }`}
              >
                {actionType}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Certificate Modal */}
      {isCertModalOpen && activeCertLeave && (
        (() => {
          const studentProfile = students.find(s => s.id === activeCertLeave.studentId || (s as any).studentId === activeCertLeave.studentId) || {
            id: activeCertLeave.studentId || 'st_1',
            admissionNumber: '2026/001',
            rollNumber: '01',
            name: activeCertLeave.studentName || 'Student',
            fatherName: 'Parent',
            motherName: 'Parent',
            dob: '2010-01-01',
            gender: 'Male',
            classId: activeCertLeave.classId || 'c_8',
            sectionId: activeCertLeave.sectionId || 's_a',
            bloodGroup: 'O+',
            address: 'Campus',
            phone: '9876543210',
            parentPhone: '9876543210'
          };
          return (
            <LeaveCertificateModal
              isOpen={isCertModalOpen}
              onClose={() => { setIsCertModalOpen(false); setActiveCertLeave(null); }}
              leave={activeCertLeave}
              student={studentProfile}
              classNameStr={classes.find(c => c.id === studentProfile.classId)?.name || studentProfile.classId}
              sectionNameStr={sections.find(s => s.id === studentProfile.sectionId)?.name || studentProfile.sectionId}
            />
          );
        })()
      )}
    </div>
  );
};

export default LeaveRequestsManager;



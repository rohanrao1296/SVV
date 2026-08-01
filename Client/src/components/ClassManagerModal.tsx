import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Plus, Trash2, Edit3, ShieldAlert, Check, BookOpen } from 'lucide-react';

interface ClassManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassManagerModal: React.FC<ClassManagerModalProps> = ({ isOpen, onClose }) => {
  const { classes, addClass, updateClass, deleteClass } = useAppData();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const isAdmin = currentUser?.role === 'admin';

  // Form states
  const [newClassName, setNewClassName] = useState('');
  const [newClassSections, setNewClassSections] = useState('A, B, C');

  // Editing state
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingSectionsStr, setEditingSectionsStr] = useState('');

  if (!isOpen) return null;

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showError('Only Administrator can create new classes.');
      return;
    }

    if (!newClassName.trim()) {
      showError('Class name is required.');
      return;
    }

    const sectionsArray = newClassSections
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const success = await addClass(newClassName.trim(), sectionsArray.length > 0 ? sectionsArray : ['A', 'B', 'C']);
    if (success) {
      showSuccess(`Class '${newClassName.trim()}' added to database!`);
      setNewClassName('');
      setNewClassSections('A, B, C');
    } else {
      showError('Failed to create class.');
    }
  };

  const handleStartEdit = (cls: any) => {
    setEditingClassId(cls.id);
    setEditingName(cls.name);
    const secStr = cls.sections && cls.sections.length > 0
      ? cls.sections.map((s: any) => typeof s === 'object' ? s.name : s).join(', ')
      : 'A, B, C';
    setEditingSectionsStr(secStr);
  };

  const handleSaveEdit = async (clsId: string) => {
    if (!isAdmin) {
      showError('Only Administrator can edit classes.');
      return;
    }

    if (!editingName.trim()) {
      showError('Class name cannot be empty.');
      return;
    }

    const updatedSections = editingSectionsStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map((sName, idx) => ({ id: `s_${idx + 1}`, name: sName }));

    const success = await updateClass(clsId, editingName.trim(), updatedSections);
    if (success) {
      showSuccess('Class updated successfully!');
      setEditingClassId(null);
    } else {
      showError('Failed to update class.');
    }
  };

  const handleDeleteClass = async (clsId: string, name: string) => {
    if (!isAdmin) {
      showError('Only Administrator can delete classes.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete '${name}'? This action is permanent.`)) {
      const success = await deleteClass(clsId);
      if (success) {
        showSuccess(`Class '${name}' removed.`);
      } else {
        showError('Failed to delete class.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-premium overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                Manage Classes & Sections
              </h3>
              <p className="text-xs text-slate-400">
                {isAdmin ? 'Admin Portal • Create, Edit, or Remove school classes' : 'Read-only view for non-admin accounts'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Admin Access Notice if non-admin */}
        {!isAdmin && (
          <div className="m-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <ShieldAlert size={18} className="shrink-0 text-amber-600" />
            <span>Only Administrators have permission to modify school classes and sections.</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          
          {/* Add New Class Form (Admin Only) */}
          {isAdmin && (
            <form onSubmit={handleAddClass} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                + Create New Class
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Class Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Class 13, Nursery, LKG"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sections (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. A, B, C, D"
                    value={newClassSections}
                    onChange={(e) => setNewClassSections(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary-hover flex items-center gap-1.5 btn-tap-effect"
                >
                  <Plus size={14} /> Add Class
                </button>
              </div>
            </form>
          )}

          {/* Active Classes List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active School Classes ({classes.length})
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {classes.map((cls) => {
                const isEditing = editingClassId === cls.id;
                const sectionsList = cls.sections && cls.sections.length > 0
                  ? cls.sections.map((s: any) => typeof s === 'object' ? s.name : s).join(', ')
                  : 'A, B, C';

                return (
                  <div
                    key={cls.id}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-primary/40 transition-colors"
                  >
                    {isEditing ? (
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100"
                        />
                        <input
                          type="text"
                          value={editingSectionsStr}
                          onChange={(e) => setEditingSectionsStr(e.target.value)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    ) : (
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{cls.name}</h5>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Sections: <span className="text-primary font-bold">{sectionsList}</span>
                        </p>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(cls.id)}
                              className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-lg hover:bg-emerald-200"
                              title="Save Changes"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingClassId(null)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-lg hover:bg-slate-200"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(cls)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-500 rounded-lg transition-colors"
                              title="Edit Class"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls.id, cls.name)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 rounded-lg transition-colors"
                              title="Delete Class"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

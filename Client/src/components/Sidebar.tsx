import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserCheck, 
  FileSpreadsheet, 
  Bell, 
  Settings as SettingsIcon, 
  LogOut, 
  FileText,
  User,
  Users
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation tabs depending on roles
  const getNavItems = () => {
    switch (currentUser.role) {
      case 'admin':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { to: '/attendance', label: 'Attendance Management', icon: <UserCheck size={20} /> },
          { to: '/students', label: 'Manage Students', icon: <Users size={20} /> },
          { to: '/teachers', label: 'Manage Teachers & Staff', icon: <Users size={20} /> },
          { to: '/leaves', label: 'Leave Requests', icon: <FileText size={20} /> },
          { to: '/announcements', label: 'Announcements', icon: <Bell size={20} /> },
          { to: '/reports', label: 'Attendance Reports', icon: <FileSpreadsheet size={20} /> },
          { to: '/profile', label: 'Admin Profile', icon: <User size={20} /> },
          { to: '/settings', label: 'School Settings', icon: <SettingsIcon size={20} /> },
        ];
      case 'teacher':
        return [
          { to: '/dashboard', label: 'Teacher Dashboard', icon: <LayoutDashboard size={20} /> },
          { to: '/attendance', label: 'Mark Attendance', icon: <UserCheck size={20} /> },
          { to: '/students', label: 'Student Directory', icon: <Users size={20} /> },
          { to: '/leaves', label: 'Leave Applications', icon: <FileText size={20} /> },
          { to: '/reports', label: 'Monthly Report', icon: <FileSpreadsheet size={20} /> },
          { to: '/announcements', label: 'School Notices', icon: <Bell size={20} /> },
          { to: '/profile', label: 'Teacher Profile', icon: <User size={20} /> },
        ];
      case 'student':
        return [
          { to: '/dashboard', label: 'Student Dashboard', icon: <LayoutDashboard size={20} /> },
          { to: '/leaves', label: 'Apply Leave', icon: <FileText size={20} /> },
          { to: '/announcements', label: 'School Notices', icon: <Bell size={20} /> },
          { to: '/profile', label: 'Student Profile', icon: <User size={20} /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className={`hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 shadow-fluent ${className}`}>
      <div className="p-4 px-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
        {/* Extra Large Logo on the left */}
        <img src="/logo.png" alt="SVV Logo" className="w-16 h-16 object-contain shrink-0" />
        
        {/* Large Text stack on the right */}
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-sm font-black text-primary tracking-tight leading-none">
            SAVITRI VIDYA VIHAR
          </h1>
          <p className="text-[9px] text-slate-500 dark:text-slate-450 font-black uppercase tracking-tight mt-1 whitespace-nowrap">
            Enterprise Resource Planning
          </p>
          <p className="text-[9px] text-slate-550 dark:text-slate-450 font-black tracking-widest mt-0.5 text-center">
            (ERP)
          </p>
        </div>
      </div>

      {/* User Session Profile Card */}
      <div className="p-4 mx-4 my-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
        <img 
          src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'} 
          alt={currentUser.name} 
          className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
        />
        <div className="overflow-hidden">
          <h4 className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{currentUser.name}</h4>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 group
              ${isActive 
                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/75 dark:hover:text-slate-100'}
            `}
          >
            <span className="text-slate-400 group-hover:text-primary transition-colors duration-150">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors duration-150 btn-tap-effect"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;

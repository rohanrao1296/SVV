import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserCheck, 
  FileText, 
  Bell, 
  User, 
  Settings,
  Users
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const getNavItems = () => {
    switch (currentUser.role) {
      case 'admin':
        return [
          { to: '/dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
          { to: '/attendance', label: 'Attendance', icon: <UserCheck size={20} /> },
          { to: '/students', label: 'Students', icon: <Users size={20} /> },
          { to: '/leaves', label: 'Leaves', icon: <FileText size={20} /> },
          { to: '/settings', label: 'Setup', icon: <Settings size={20} /> },
        ];
      case 'teacher':
        return [
          { to: '/dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
          { to: '/attendance', label: 'Mark', icon: <UserCheck size={20} /> },
          { to: '/students', label: 'Students', icon: <Users size={20} /> },
          { to: '/announcements', label: 'Notices', icon: <Bell size={20} /> },
          { to: '/profile', label: 'Profile', icon: <User size={20} /> },
        ];
      case 'student':
        return [
          { to: '/dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
          { to: '/leaves', label: 'Leave', icon: <FileText size={20} /> },
          { to: '/announcements', label: 'Notices', icon: <Bell size={20} /> },
          { to: '/profile', label: 'Profile', icon: <User size={20} /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex justify-around items-center py-2 px-1 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `
            flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium tracking-tight transition-all duration-150 btn-tap-effect
            ${isActive 
              ? 'text-primary dark:text-blue-400 font-semibold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}
          `}
        >
          {({ isActive }) => (
            <>
              <span className={`
                p-1.5 rounded-xl transition-all duration-200 mb-0.5
                ${isActive ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 scale-105' : 'text-slate-400 dark:text-slate-500'}
              `}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
export default BottomNav;

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import { ToastProvider } from './context/ToastContext';

import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import StudentsList from './pages/StudentsList';
import LeaveRequestsManager from './pages/LeaveRequestsManager';
import StaffList from './pages/StaffList';

// Loader Screen
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-4">Loading Portal...</p>
  </div>
);

// Private Route Guard Wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'student')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!currentUser) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Role not authorized, redirect to their home
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main Unified Layout Frame
const DashboardLayout: React.FC = () => {
  const { currentUser, isLoading, logout } = useAuth();
  const { teachers, students } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';

  const teacherProf = teachers.find(t => 
    t.id === currentUser?.id || 
    (currentUser?.phone && (t.phone === currentUser.phone || t.email === currentUser.email)) ||
    (currentUser?.name && t.name.toLowerCase() === currentUser.name.toLowerCase())
  );

  const studentProf = students.find(s => 
    s.id === currentUser?.id || 
    (currentUser?.phone && (s.phone === currentUser.phone || s.parentPhone === currentUser.phone)) ||
    (currentUser?.name && s.name.toLowerCase() === currentUser.name.toLowerCase())
  );

  const headerAvatar = (currentUser?.role === 'teacher' ? teacherProf?.photo : currentUser?.role === 'student' ? studentProf?.photo : undefined) || 
    currentUser?.avatar || 
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // If running in standalone mode (already installed), hide banner
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User installed the PWA');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (isLoginPage || !currentUser) {
    return (
      <main className="w-full">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        
        {/* Watermark Background Logo */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] dark:opacity-[0.025] z-0 select-none">
          <img src="/logo.png" alt="School Watermark" className="w-[280px] h-[280px] sm:w-[480px] sm:h-[480px] object-contain" />
        </div>
        
        {/* Top Header Panel */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3 px-6 flex items-center justify-between shadow-sm md:shadow-none z-10">
          <div className="flex items-center gap-2 z-10">
            <img src="/logo.png" alt="SVV Logo" className="w-9 h-9 object-contain" />
            <span className="text-sm font-black text-slate-800 dark:text-slate-200 md:hidden">SVV ERP</span>
            <span className="hidden md:inline text-xs font-bold text-slate-500 dark:text-slate-400">
              Savitri Vidya Vihar | CBSE Affiliated School
            </span>
          </div>

          <div className="flex items-center gap-2.5 z-10">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-full capitalize">
              Role: {currentUser.role}
            </span>
            <NavLink 
              to="/profile" 
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center btn-tap-effect hover:ring-2 hover:ring-primary/20 transition-all shrink-0"
              title="View Profile"
            >
              <img 
                src={headerAvatar} 
                alt={currentUser.name} 
                className="w-full h-full object-cover bg-white" 
              />
            </NavLink>
            <button
              onClick={handleLogout}
              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 rounded-lg transition-all btn-tap-effect flex items-center gap-1 text-xs font-bold"
              title="Sign Out / Log Out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10 relative">
          <Routes>
            <Route path="/dashboard" element={<DashboardSwitcher />} />
            
            {/* Admin only */}
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Admin and Teacher */}
            <Route path="/attendance" element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <Reports />
              </ProtectedRoute>
            } />

            <Route path="/students" element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <StudentsList />
              </ProtectedRoute>
            } />

            <Route path="/teachers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StaffList />
              </ProtectedRoute>
            } />

            {/* Student/Parent and Admin/Teacher Leave Manager */}
            <Route path="/leaves" element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                {currentUser.role === 'admin' || currentUser.role === 'teacher' ? <LeaveRequestsManager /> : <StudentDashboard />}
              </ProtectedRoute>
            } />

            {/* General Profile & Notices */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/announcements" element={
              <ProtectedRoute>
                {currentUser.role === 'student' ? <StudentDashboard /> : <AdminDashboard />}
              </ProtectedRoute>
            } />

            {/* Fallbacks */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Bottom Nav for Mobile */}
        <BottomNav />
        
        {/* PWA Install Promotion Banner */}
        {showInstallBanner && (
          <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-80 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-premium z-50 flex gap-3 items-start animate-fade-in">
            <img src="/logo.png" alt="School Logo" className="w-12 h-12 object-contain shrink-0 rounded-lg" />
            <div className="space-y-2 flex-1">
              <div>
                <h4 className="text-xs font-bold text-slate-850 dark:text-slate-105">Install SVV ERP</h4>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">Access registers offline and launch instantly from your home screen.</p>
              </div>
              <div className="flex gap-2 justify-end text-[10px] font-bold">
                <button 
                  onClick={() => setShowInstallBanner(false)}
                  className="px-2.5 py-1 text-slate-450 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                >
                  Later
                </button>
                <button 
                  onClick={handleInstallClick}
                  className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-hover shadow-sm"
                >
                  Install
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Switch dashboard view dynamically depending on auth roles
const DashboardSwitcher: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return <Navigate to="/login" replace />;

  switch (currentUser.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App: React.FC = () => {

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppDataProvider>
            <DashboardLayout />
          </AppDataProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};


export default App;

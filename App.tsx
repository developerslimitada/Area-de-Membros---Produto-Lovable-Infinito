

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getLoggedUser, initializeStore } from './supabaseStore';

// Components (mantém imports diretos para componentes pequenos)
import SidebarFooter from './components/SidebarFooter';
import PreviewModeHeader from './components/PreviewModeHeader';
import ProtectedRoute from './components/ProtectedRoute';
import StudentNavbar from './components/StudentNavbar';

// Lazy Loading de Páginas para Performance
const Login = lazy(() => import('./pages/Login'));
const StudentCourses = lazy(() => import('./pages/StudentCourses'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const StudentFeed = lazy(() => import('./pages/StudentFeed'));
const StudentCommunity = lazy(() => import('./pages/StudentCommunity'));
const AdminCourses = lazy(() => import('./pages/AdminCourses'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminModules = lazy(() => import('./pages/AdminModules'));
const AdminLessons = lazy(() => import('./pages/AdminLessons'));
const AdminOffers = lazy(() => import('./pages/AdminOffers'));
const AdminCourseSidebarOffers = lazy(() => import('./pages/AdminCourseSidebarOffers'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminFeed = lazy(() => import('./pages/AdminFeed'));
const AdminSupport = lazy(() => import('./pages/AdminSupport'));
const AdminVSL = lazy(() => import('./pages/AdminVSL'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminChangelog = lazy(() => import('./pages/AdminChangelog'));
const ThankYou = lazy(() => import('./pages/ThankYou'));

// Layouts (mantém imports diretos)
import AdminLayout from './components/layouts/AdminLayout';
import StudentLayout from './components/layouts/StudentLayout';

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#050507]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="text-xs font-black text-slate-600 uppercase tracking-widest animate-pulse">Carregando...</p>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const [user, setUser] = useState(getLoggedUser());
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const init = async () => {
      await initializeStore();
      setUser(getLoggedUser());
    };
    init();
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // CRITICAL: Detect if we're in student area OR admin preview mode
  const isStudentRoute =
    location.pathname.includes('/student') ||
    location.pathname.includes('/dashboard') ||
    location.pathname.includes('/courses') ||
    location.pathname.includes('/cursos') ||
    location.pathname.includes('/progresso') ||
    location.pathname.includes('/progress') ||
    location.pathname.includes('/certificados') ||
    location.pathname.includes('/certificates') ||
    location.pathname.includes('/perfil') ||
    location.pathname.includes('/profile') ||
    location.pathname.includes('/feed') ||
    location.pathname.includes('/community');

  const isAdminPreview = location.pathname.includes('/admin/preview/student');
  const isRealAdminPage = location.pathname.startsWith('/admin') && !isAdminPreview;
  // Only show sidebar if it's a student route OR preview mode, AND not a real admin page (unless preview)
  const shouldShowSidebar = (isStudentRoute || isAdminPreview) && !location.pathname.includes('/login') && !isRealAdminPage;

  const mainStyle: React.CSSProperties = {
    paddingTop: isAdminPreview ? '50px' : '0',
    paddingBottom: shouldShowSidebar ? '80px' : '0', // Space for bottom navbar
    paddingLeft: '0', // Removed sidebar padding
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: 'padding 0.3s ease',
    backgroundColor: '#050507',
  };

  return (
    <>
      <PreviewModeHeader />
      {shouldShowSidebar && <StudentNavbar />}

      <div style={mainStyle}>
        <div style={{ flex: 1 }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login onLogin={() => setUser(getLoggedUser())} />} />
              <Route path="/obrigado" element={<ThankYou />} />

              {/* Compatibility redirects */}
              <Route path="/dashboard" element={<Navigate to="/student/courses" replace />} />
              <Route path="/cursos" element={<Navigate to="/student/courses" replace />} />
              <Route path="/progresso" element={<Navigate to="/student/progress" replace />} />
              <Route path="/certificados" element={<Navigate to="/student/certificates" replace />} />
              <Route path="/perfil" element={<Navigate to="/student/profile" replace />} />

              {/* Student Routes */}
              <Route path="/student" element={
                <ProtectedRoute>
                  <StudentLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="courses" replace />} />
                <Route path="courses" element={<StudentCourses />} />
                <Route path="feed" element={<StudentFeed />} />
                <Route path="community" element={<StudentCommunity />} />
                <Route path="profile" element={<StudentProfile />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="modules" element={<AdminModules />} />
                <Route path="lessons" element={<AdminLessons />} />
                <Route path="offers" element={<AdminOffers />} />
                <Route path="course-offers" element={<AdminCourseSidebarOffers />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="feed" element={<AdminFeed />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="vsl" element={<AdminVSL />} />
                <Route path="changelog" element={<AdminChangelog />} />

                {/* Admin Preview Routes */}
                <Route path="preview/student/courses" element={<StudentCourses />} />
                <Route path="preview/student/feed" element={<StudentFeed />} />
                <Route path="preview/student/community" element={<StudentCommunity />} />
                <Route path="preview/student/profile" element={<StudentProfile />} />
              </Route>

              <Route path="/" element={<Navigate to="/student/courses" replace />} />
              <Route path="*" element={<Navigate to="/student/courses" replace />} />
            </Routes>
          </Suspense>
        </div>

      </div>


    </>
  );
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;

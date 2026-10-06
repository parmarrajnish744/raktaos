import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Sidebar from './components/dashboard/Sidebar';
import Topbar from './components/dashboard/Topbar';

// Pages
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardOverview from './pages/DashboardOverview';
import MyCardsPage from './pages/MyCardsPage';
import CardBuilderPage from './pages/CardBuilderPage';
import QRStudioPage from './pages/QRStudioPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import PublicCardPage from './pages/PublicCardPage';
import LeadsPage from './pages/LeadsPage';

function AppContent() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync with browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg)',
        color: 'var(--primary)',
        fontWeight: 700
      }}>
        Loading Rakta Business OS...
      </div>
    );
  }

  // 1. PUBLIC CARD ROUTES: /c/:slug and /card/:username
  if (currentPath.startsWith('/c/')) {
    const slug = currentPath.replace('/c/', '').split('?')[0].split('/')[0];
    return <PublicCardPage slug={slug} onNavigate={navigate} />;
  }

  if (currentPath.startsWith('/card/')) {
    const username = currentPath.replace('/card/', '').split('?')[0].split('/')[0];
    return <PublicCardPage slug={username} username={username} onNavigate={navigate} />;
  }

  // 2. DASHBOARD ROUTES: /dashboard/* and /admin
  const isDashboardRoute = currentPath.startsWith('/dashboard') || currentPath === '/admin';

  if (isDashboardRoute) {
    if (!isAuthenticated) {
      // Redirect to login if unauthenticated
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar currentPath="/login" onNavigate={navigate} />
          <LoginPage onNavigate={navigate} />
          <Footer onNavigate={navigate} />
        </div>
      );
    }

    // Determine dashboard sub-view
    let dashboardContent = null;
    let pageTitle = 'Dashboard Overview';

    if (currentPath === '/dashboard') {
      dashboardContent = <DashboardOverview onNavigate={navigate} />;
      pageTitle = 'Dashboard Overview';
    } else if (currentPath === '/dashboard/cards') {
      dashboardContent = <MyCardsPage onNavigate={navigate} />;
      pageTitle = 'My Business Cards';
    } else if (currentPath === '/dashboard/cards/create') {
      dashboardContent = <CardBuilderPage onNavigate={navigate} />;
      pageTitle = 'Create Business Card';
    } else if (currentPath.startsWith('/dashboard/cards/') && currentPath.endsWith('/edit')) {
      const cardId = currentPath.replace('/dashboard/cards/', '').replace('/edit', '');
      dashboardContent = <CardBuilderPage editCardId={cardId} onNavigate={navigate} />;
      pageTitle = 'Edit Business Card';
    } else if (currentPath === '/dashboard/qr') {
      dashboardContent = <QRStudioPage onNavigate={navigate} />;
      pageTitle = 'QR Code Studio';
    } else if (currentPath === '/dashboard/leads') {
      dashboardContent = <LeadsPage onNavigate={navigate} />;
      pageTitle = 'Customer Leads & Enquiries';
    } else if (currentPath.startsWith('/dashboard/analytics')) {
      dashboardContent = <AnalyticsPage onNavigate={navigate} />;
      pageTitle = 'Engagement Analytics';
    } else if (currentPath === '/dashboard/profile') {
      dashboardContent = <ProfilePage onNavigate={navigate} />;
      pageTitle = 'User Profile';
    } else if (currentPath === '/dashboard/settings') {
      dashboardContent = <SettingsPage onNavigate={navigate} />;
      pageTitle = 'Settings & Mobile API';
    } else if (currentPath === '/admin') {
      if (!isAdmin) {
        dashboardContent = (
          <div className="card-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', maxWidth: '540px', margin: '2rem auto' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              Access Denied
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              The Administrative Control Panel is restricted strictly to platform administrators.
            </p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Return to Dashboard
            </button>
          </div>
        );
      } else {
        dashboardContent = <AdminPage onNavigate={navigate} />;
      }
      pageTitle = 'System Admin Panel';
    } else {
      dashboardContent = <DashboardOverview onNavigate={navigate} />;
      pageTitle = 'Dashboard';
    }

    return (
      <div className="dashboard-container">
        <Sidebar
          currentPath={currentPath}
          onNavigate={navigate}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <div className="dashboard-main">
          <Topbar
            title={pageTitle}
            onOpenMobile={() => setMobileSidebarOpen(true)}
            onNavigate={navigate}
          />
          <main className="dashboard-content">
            {dashboardContent}
          </main>
        </div>
      </div>
    );
  }

  // 3. PUBLIC MARKETING PAGES
  let publicPage = <HomePage onNavigate={navigate} />;
  if (currentPath === '/features') publicPage = <FeaturesPage onNavigate={navigate} />;
  else if (currentPath === '/pricing') publicPage = <PricingPage onNavigate={navigate} />;
  else if (currentPath === '/about') publicPage = <AboutPage onNavigate={navigate} />;
  else if (currentPath === '/contact') publicPage = <ContactPage onNavigate={navigate} />;
  else if (currentPath === '/login') publicPage = <LoginPage onNavigate={navigate} />;
  else if (currentPath === '/register') publicPage = <RegisterPage onNavigate={navigate} />;
  else if (currentPath === '/forgot-password') publicPage = <ForgotPasswordPage onNavigate={navigate} />;
  else if (currentPath === '/reset-password') publicPage = <ResetPasswordPage onNavigate={navigate} />;
  else if (currentPath.startsWith('/auth/callback')) publicPage = <AuthCallbackPage onNavigate={navigate} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {publicPage}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

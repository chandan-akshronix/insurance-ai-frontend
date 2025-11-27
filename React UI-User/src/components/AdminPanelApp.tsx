import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Import admin_panel CSS to ensure all styles and design match exactly
import '@admin-panel/index.css';
// Import all components directly from admin_panel folder using path alias
import { Sidebar } from '@admin-panel/components/Sidebar';
import { DashboardOverview } from '@admin-panel/components/DashboardOverview';
import { ClaimsPipeline } from '@admin-panel/components/ClaimsPipeline';
import { AIProcessFlow } from '@admin-panel/components/AIProcessFlow';
import { CaseDetails } from '@admin-panel/components/CaseDetails';
import { AgentPerformance } from '@admin-panel/components/AgentPerformance';
import { HumanReviewQueue } from '@admin-panel/components/HumanReviewQueue';
import { AuditLog } from '@admin-panel/components/AuditLog';
import { Toaster } from '@admin-panel/components/ui/sonner';

/**
 * AdminPanelApp Component
 * 
 * This component wraps the admin panel interface from the admin_panel folder.
 * It imports all components directly from the separate admin_panel folder,
 * maintaining the exact design and functionality of the original admin panel.
 * 
 * The component is designed to render in full-screen mode without the
 * main app's Navigation and Footer (handled in App.tsx).
 */
export default function AdminPanelApp() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeView, setActiveView] = useState('overview');
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigation = (view: string) => {
    setActiveView(view);
    setSelectedClaim(null); // Clear selected claim when navigating
  };

  // Navigation handlers for user dropdown menu
  const handleNavigateToProfile = () => {
    navigate('/profile');
  };

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  const handleNavigateToMyClaims = () => {
    navigate('/claims/track');
  };

  const handleNavigateToAdminPanel = () => {
    navigate('/admin');
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    if (selectedClaim) {
      return <CaseDetails claimId={selectedClaim} onBack={() => setSelectedClaim(null)} />;
    }

    switch (activeView) {
      case 'overview':
        return <DashboardOverview onViewClaim={setSelectedClaim} />;
      case 'pipeline':
        return <ClaimsPipeline onSelectClaim={setSelectedClaim} />;
      case 'aiprocess':
        return <AIProcessFlow onSelectClaim={setSelectedClaim} />;
      case 'agents':
        return <AgentPerformance />;
      case 'review':
        return <HumanReviewQueue onViewClaim={setSelectedClaim} />;
      case 'audit':
        return <AuditLog />;
      default:
        return <DashboardOverview onViewClaim={setSelectedClaim} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeView={activeView} 
        onNavigate={handleNavigation}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToDashboard={handleNavigateToDashboard}
        onNavigateToMyClaims={handleNavigateToMyClaims}
        onNavigateToAdminPanel={handleNavigateToAdminPanel}
        onLogout={handleLogout}
        userName={user?.name || "Admin"}
        userEmail={user?.email || "admin@insurance.com"}
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}


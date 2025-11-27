import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { ClaimsPipeline } from './components/ClaimsPipeline';
import { AIProcessFlow } from './components/AIProcessFlow';
import { CaseDetails } from './components/CaseDetails';
import { AgentPerformance } from './components/AgentPerformance';
import { HumanReviewQueue } from './components/HumanReviewQueue';
import { AuditLog } from './components/AuditLog';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeView, setActiveView] = useState('overview');
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigation = (view: string) => {
    setActiveView(view);
    setSelectedClaim(null); // Clear selected claim when navigating
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
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
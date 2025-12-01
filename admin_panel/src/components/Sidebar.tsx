import { LayoutDashboard, Workflow, Activity, UserCheck, ScrollText, Settings, GitBranch, Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  // Navigation and logout handlers (optional - will use window.location if not provided)
  onNavigateToProfile?: () => void;
  onNavigateToAdminPanel?: () => void;
  onLogout?: () => void;
  // User data (optional - will use defaults if not provided)
  userName?: string;
  userEmail?: string;
}

const menuItems = [
  { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Claims', icon: Workflow },
  { id: 'aiprocess', label: 'Application', icon: GitBranch },
  { id: 'agents', label: 'Agent Performance Monitor', icon: Activity },
  { id: 'review', label: 'Human Review Queue', icon: UserCheck },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
  { id: 'settings', label: 'Settings & Access Control', icon: Settings },
];

export function Sidebar({ 
  activeView, 
  onNavigate, 
  collapsed, 
  onToggleCollapse,
  onNavigateToProfile,
  onNavigateToAdminPanel,
  onLogout,
  userName = "Admin",
  userEmail = "admin@insurance.com"
}: SidebarProps) {
  // Get user initials for avatar - handles edge cases
  const getUserInitials = (name: string) => {
    if (!name || name.trim().length === 0) {
      return 'AD'; // Default fallback
    }
    const parts = name.trim().split(' ').filter(part => part.length > 0);
    if (parts.length === 0) {
      return 'AD';
    }
    if (parts.length === 1) {
      // Single name - use first two characters
      return parts[0].substring(0, 2).toUpperCase();
    }
    // Multiple names - use first letter of first and last name
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const userInitials = getUserInitials(userName);
  
  // Navigation handlers - use provided handlers or fallback to window.location
  const handleProfile = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    } else {
      window.location.href = '/profile';
    }
  };

  const handleAdminPanel = () => {
    if (onNavigateToAdminPanel) {
      onNavigateToAdminPanel();
    } else {
      // Already on admin panel, just refresh or do nothing
      window.location.href = '/admin';
    }
  };

  // Logout handler - use provided handler or fallback
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback: clear localStorage and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
  };

  return (
    <aside className={cn(
      "bg-white border-r border-gray-100 flex flex-col shadow-sm transition-all duration-300 h-full",
      collapsed ? "w-20" : "w-72"
    )}>
      <div className={cn(
        "border-b border-gray-100 flex items-center",
        collapsed ? "p-4 justify-center" : "p-8"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className={cn(
            "h-10 w-10 p-0 hover:bg-gray-100 flex-shrink-0",
            collapsed && "mx-auto"
          )}
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </Button>
        {!collapsed && (
          <div className="flex items-center gap-3 ml-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
              AI
            </div>
            <div>
              <h1 className="text-gray-900">Claims Monitor</h1>
              <p className="text-gray-500 text-xs">Insurance AI Platform</p>
            </div>
          </div>
        )}
      </div>
      
      <nav className={cn("flex-1", collapsed ? "p-2" : "p-6")}>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center rounded-xl transition-all duration-200 group relative",
                    collapsed ? "justify-center px-3 py-3.5" : "gap-4 px-4 py-3.5",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-200 flex-shrink-0", 
                    isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"
                  )} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {collapsed && (
                    <span className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cn(
        "border-t border-gray-100",
        collapsed ? "p-2" : "p-6"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {collapsed ? (
              <button className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 mx-auto cursor-pointer hover:bg-blue-200 hover:ring-2 hover:ring-blue-300/50 transition-all outline-none" title={userName}>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all w-full outline-none group">
                <Avatar className="h-10 w-10 ring-2 ring-blue-200/50 group-hover:ring-blue-300/70 transition-all">
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
              </button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfile} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAdminPanel} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
              <Settings className="w-4 h-4 mr-2" />
              Admin Panel
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              variant="destructive" 
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

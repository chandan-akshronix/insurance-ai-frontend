import { Search, ChevronDown, User, LogOut, Settings } from 'lucide-react';
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
import { cn } from './ui/utils';
import logoImage from 'figma:asset/1df38bb3e2aa90271d87fe3d531275500d1f2a94.png';

interface AdminHeaderProps {
  userName?: string;
  userEmail?: string;
  onNavigateToProfile?: () => void;
  onNavigateToAdminPanel?: () => void;
  onLogout?: () => void;
}

export function AdminHeader({
  userName = "Admin",
  userEmail = "admin@insurance.com",
  onNavigateToProfile,
  onNavigateToAdminPanel,
  onLogout,
}: AdminHeaderProps) {
  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userInitials = getInitials(userName);

  // Navigation handlers
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
      window.location.href = '/admin';
    }
  };

  // Logout handler
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
  };

  // Navigation link handlers
  const handleHome = () => window.location.href = '/';
  const handleAbout = () => window.location.href = '/about';
  const handleContact = () => window.location.href = '/contact';
  const handleLifeInsurance = () => window.location.href = '/life-insurance';
  const handleCarInsurance = () => window.location.href = '/car-insurance';
  const handleHealthInsurance = () => window.location.href = '/health-insurance';
  const handleSubmitClaim = () => window.location.href = '/claims/submit';
  const handleTrackClaim = () => window.location.href = '/claims/track';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-border shadow-sm z-50" style={{ height: '70px' }}>
      <div className="max-w-[1400px] mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center min-w-[180px] cursor-pointer" onClick={handleHome}>
          <img 
            src={logoImage}
            alt="Akshronix Technology" 
            className="h-12 w-auto object-contain logo-no-bg"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          <button onClick={handleHome} className="text-foreground hover:text-primary transition-colors font-medium">
            Home
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium outline-none">
              Products <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleLifeInsurance} className="cursor-pointer">
                Life Insurance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCarInsurance} className="cursor-pointer">
                Car Insurance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleHealthInsurance} className="cursor-pointer">
                Health Insurance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium outline-none">
              Claims <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleSubmitClaim} className="cursor-pointer">
                Submit Claim
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTrackClaim} className="cursor-pointer">
                Track Claim
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button onClick={handleAbout} className="text-foreground hover:text-primary transition-colors font-medium">
            About
          </button>
          <button onClick={handleContact} className="text-foreground hover:text-primary transition-colors font-medium">
            Contact
          </button>
        </div>

        {/* Right Side */}
        <div className="hidden lg:flex items-center gap-3">
          <button className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-foreground hover:text-primary">
            <Search className="w-5 h-5" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-600 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden xl:block">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAdminPanel} className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

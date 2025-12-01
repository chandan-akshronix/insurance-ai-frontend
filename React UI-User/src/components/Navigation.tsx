import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, User, LogOut, Settings, LayoutDashboard, FileText } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import logoImage from 'figma:asset/1df38bb3e2aa90271d87fe3d531275500d1f2a94.png';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-border shadow-sm z-50" style={{ height: '70px' }}>
      <div className="max-w-[1400px] mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center min-w-[180px]">
          <img 
            src={logoImage} 
            alt="Akshronix Technology" 
            className="h-12 w-auto object-contain logo-no-bg"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
            Home
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium">
              Products <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to="/life-insurance" className="w-full">Life Insurance</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/car-insurance" className="w-full">Car Insurance</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/health-insurance" className="w-full">Health Insurance</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium">
              Claims <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to="/claims/submit" className="w-full">Submit Claim</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/claims/track" className="w-full">Track Claim</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
            About
          </Link>
          <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
            Contact
          </Link>
        </div>

        {/* Right Side */}
        <div className="hidden lg:flex items-center gap-3">
          <button className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-foreground hover:text-primary">
            <Search className="w-5 h-5" />
          </button>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-600 text-white">
                    {user && getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden xl:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="w-full cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/claims/track" className="w-full cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" />
                    My Claims
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="w-full cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Login
              </Button>
            </Link>
          )}
          {!isAuthenticated && (
            <Link to="/dashboard">
              <Button className="bg-gradient-to-r from-primary to-cyan-500 text-white hover:opacity-90">
                Get Started
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-border p-4 max-h-[calc(100vh-70px)] overflow-y-auto">
          <div className="flex flex-col gap-4">
            <Link to="/" className="text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground mb-2">Products</p>
              <div className="flex flex-col gap-2 pl-4">
                <Link to="/life-insurance" className="text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                  Life Insurance
                </Link>
                <Link to="/car-insurance" className="text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                  Car Insurance
                </Link>
                <Link to="/health-insurance" className="text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                  Health Insurance
                </Link>
              </div>
            </div>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground mb-2">Claims</p>
              <div className="flex flex-col gap-2 pl-4">
                <Link to="/claims/submit" className="text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                  Submit Claim
                </Link>
                <Link to="/claims/track" className="text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                  Track Claim
                </Link>
              </div>
            </div>
            <Link to="/about" className="text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
            <div className="border-t pt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="bg-slate-50 p-3 rounded-lg mb-2">
                    <p className="font-medium text-sm">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/claims/track" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      My Claims
                    </Button>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-destructive border-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-primary text-primary">
                      Login
                    </Button>
                  </Link>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-primary to-cyan-500 text-white">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

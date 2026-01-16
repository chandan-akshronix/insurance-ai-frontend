import { useState } from 'react';
import { Eye, EyeOff, Shield, User, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from 'figma:asset/1df38bb3e2aa90271d87fe3d531275500d1f2a94.png';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  // Get the page user was trying to access
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(loginEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!validatePassword(loginPassword)) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      // Remove role parameter - role comes from database
      await login(loginEmail, loginPassword);
      navigate(from, { replace: true });
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(adminEmail)) {
      toast.error('Please enter a valid admin email address');
      return;
    }
    if (!validatePassword(adminPassword)) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      // Remove role parameter - role comes from database
      await login(adminEmail, adminPassword);
      navigate('/admin');
    } catch (error) {
      toast.error('Admin login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName) {
      toast.error('Please enter your name');
      return;
    }
    if (!validateEmail(registerEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!validatePassword(registerPassword)) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await register(registerName, registerEmail, registerPassword);
      navigate(from, { replace: true });
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="pt-[70px] min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center mb-6">
              <img 
                src={logoImage} 
                alt="Akshronix Technology" 
                className="h-16 w-auto object-contain logo-no-bg"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
                Secure Authentication
              </span>
            </div>
            <h1 className="text-4xl mb-3">Welcome Back</h1>
            <p className="text-muted-foreground">Manage your insurance policies and claims</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-none">
                <TabsTrigger value="login" className="rounded-lg">
                  <User className="w-4 h-4 mr-2" />
                  User Login
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg">
                  Register
                </TabsTrigger>
                <TabsTrigger value="admin" className="rounded-lg">
                  <Lock className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <div className="p-8 md:p-12">
                {/* User Login Tab */}
                <TabsContent value="login" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-2xl mb-2">Sign in to your account</h2>
                      <p className="text-muted-foreground">Enter your credentials to access your dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                        <Label htmlFor="login-email">Email Address</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="mt-2 h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative mt-2">
                          <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="h-11 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="remember" />
                          <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                            Remember me
                          </label>
                        </div>
                        <button type="button" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </button>
                      </div>
                      <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90">
                        Sign In
                      </Button>
                    </form>

                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-muted-foreground">Or continue with</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11"
                          onClick={() => toast.info('Google OAuth integration')}
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11"
                          onClick={() => toast.info('Facebook OAuth integration')}
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-2xl mb-2">Create your account</h2>
                      <p className="text-muted-foreground">Start protecting what matters most</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                      <div>
                        <Label htmlFor="register-name">Full Name</Label>
                        <Input
                          id="register-name"
                          placeholder="John Doe"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="mt-2 h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-email">Email Address</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="you@example.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="mt-2 h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-password">Password</Label>
                        <div className="relative mt-2">
                          <Input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Minimum 6 characters"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="h-11 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="terms" required />
                        <label htmlFor="terms" className="text-sm text-muted-foreground">
                          I agree to the{' '}
                          <a href="/terms" className="text-primary hover:underline">
                            Terms & Privacy Policy
                          </a>
                        </label>
                      </div>
                      <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90">
                        Create Account
                      </Button>
                    </form>

                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-muted-foreground">Or register with</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11"
                          onClick={() => toast.info('Google OAuth integration')}
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                          </svg>
                          Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11"
                          onClick={() => toast.info('Facebook OAuth integration')}
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Admin Login Tab */}
                <TabsContent value="admin" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg mb-4">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium">Restricted Access</span>
                      </div>
                      <h2 className="text-2xl mb-2">Administrator Login</h2>
                      <p className="text-muted-foreground">Access the admin dashboard and management tools</p>
                    </div>

                    <form onSubmit={handleAdminLogin} className="space-y-5">
                      <div>
                        <Label htmlFor="admin-email">Admin Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@secureinsure.com"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="mt-2 h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-password">Admin Password</Label>
                        <div className="relative mt-2">
                          <Input
                            id="admin-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter admin password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="h-11 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-800">
                          <strong>Security Notice:</strong> This login is for authorized administrators only. 
                          All access attempts are logged and monitored.
                        </p>
                      </div>
                      <Button type="submit" className="w-full h-11 bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 text-white">
                        Admin Sign In
                      </Button>
                    </form>
                  </motion.div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

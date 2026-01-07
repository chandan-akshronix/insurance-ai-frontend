/**
 * AdminDashboard Component
 * 
 * NOTE: This is the OLD simple admin dashboard component.
 * 
 * The main admin panel is now handled by AdminPanelApp component which
 * integrates the full admin_panel folder interface.
 * 
 * This component is kept as a backup/alternative simple dashboard view.
 * It can be used for a simpler admin interface if needed, or removed
 * if not required.
 * 
 * Current active admin panel: AdminPanelApp (imports from admin_panel folder)
 * Route: /admin → AdminPanelApp
 */
import { useState, useEffect } from 'react';
import { Users, FileText, TrendingUp, DollarSign, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { getAdminStats, getAdminClaims, getAdminUsers } from '../../services/api';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsData, claimsData, usersData] = await Promise.all([
          getAdminStats(),
          getAdminClaims(),
          getAdminUsers()
        ]);

        setStats(statsData || {});
        // Handle both wrapped and direct array responses
        setClaims(Array.isArray(claimsData) ? claimsData : (claimsData?.claims || []));
        setUsers(Array.isArray(usersData) ? usersData : (usersData?.users || []));
      } catch (error: any) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load admin dashboard data. Please try again.');
        toast.error('Failed to load admin dashboard data');
        // Set default empty values to prevent crashes
        setStats({});
        setClaims([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'review':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="pt-[70px] min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Safe stats array with fallback values
  const statsArray = stats ? [
    { 
      icon: Users, 
      label: 'Total Users', 
      value: (stats.totalUsers || 0).toLocaleString(), 
      change: stats.userGrowth !== undefined ? `+${stats.userGrowth}%` : 'N/A', 
      trend: 'up' 
    },
    { 
      icon: FileText, 
      label: 'Active Policies', 
      value: (stats.activePolicies || stats.totalPolicies || 0).toLocaleString(), 
      change: stats.policyGrowth !== undefined ? `+${stats.policyGrowth}%` : 'N/A', 
      trend: 'up' 
    },
    { 
      icon: TrendingUp, 
      label: 'Claims Processed', 
      value: (stats.claimsProcessed || stats.totalClaims || stats.claimsResolved || 0).toLocaleString(), 
      change: stats.claimsGrowth !== undefined ? `+${stats.claimsGrowth}%` : 'N/A', 
      trend: 'up' 
    },
    { 
      icon: DollarSign, 
      label: 'Revenue', 
      value: stats.revenue || '₹0', 
      change: stats.revenueGrowth !== undefined ? `+${stats.revenueGrowth}%` : 'N/A', 
      trend: 'up' 
    }
  ] : [];

  return (
    <div className="pt-[70px] min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your insurance platform</p>
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsArray.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="text-3xl mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="claims">Claims Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Claims */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Claims</CardTitle>
                </CardHeader>
                <CardContent>
                  {claims.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No recent claims</p>
                  ) : (
                    <div className="space-y-4">
                      {claims.slice(0, 4).map((claim) => (
                        <div key={claim.id || claim.claimId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(claim.status)}
                            <div>
                              <p className="font-medium">{claim.claimNumber || claim.claim_id || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{claim.userName || claim.user_name || 'Unknown User'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{claim.amount || claim.claimAmount || 'N/A'}</p>
                            <Badge className={getStatusColor(claim.status || 'pending')}>
                              {claim.status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle>New Users</CardTitle>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No users found</p>
                  ) : (
                    <div className="space-y-4">
                      {users.slice(0, 3).map((user) => (
                        <div key={user.id || user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-cyan-500 rounded-full flex items-center justify-center text-white">
                              {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{user.name || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{user.policies || 0} policies</p>
                            <p className="text-xs text-muted-foreground">{user.joinedDate || user.joined_date || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle>All Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Claim Number</th>
                        <th className="text-left p-4">User</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            No claims found
                          </td>
                        </tr>
                      ) : (
                        claims.map((claim) => (
                          <tr key={claim.id || claim.claimId} className="border-b hover:bg-slate-50">
                            <td className="p-4">{claim.claimNumber || claim.claim_id || 'N/A'}</td>
                            <td className="p-4">
                              <div>
                                <p>{claim.userName || claim.user_name || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">{claim.userEmail || claim.user_email || 'N/A'}</p>
                              </div>
                            </td>
                            <td className="p-4">{claim.type || claim.claimType || 'N/A'}</td>
                            <td className="p-4">{claim.amount || claim.claimAmount || 'N/A'}</td>
                            <td className="p-4">
                              <Badge className={getStatusColor(claim.status || 'pending')}>
                                {claim.status || 'pending'}
                              </Badge>
                            </td>
                            <td className="p-4">{claim.submittedDate || claim.submitted_date || claim.createdAt || 'N/A'}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">View</Button>
                                {(claim.status || 'pending') === 'pending' && (
                                  <>
                                    <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                                      Approve
                                    </Button>
                                    <Button size="sm" variant="destructive">
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Phone</th>
                        <th className="text-left p-4">Policies</th>
                        <th className="text-left p-4">Premium</th>
                        <th className="text-left p-4">KYC Status</th>
                        <th className="text-left p-4">Joined</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-muted-foreground">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id || user.userId} className="border-b hover:bg-slate-50">
                            <td className="p-4">{user.name || 'Unknown'}</td>
                            <td className="p-4">{user.email || 'N/A'}</td>
                            <td className="p-4">{user.phone || 'N/A'}</td>
                            <td className="p-4">{user.policies || 0}</td>
                            <td className="p-4">{user.totalPremium || user.total_premium || '₹0'}</td>
                            <td className="p-4">
                              <Badge className={(user.kycStatus || user.kyc_status || 'pending') === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {user.kycStatus || user.kyc_status || 'pending'}
                              </Badge>
                            </td>
                            <td className="p-4">{user.joinedDate || user.joined_date || 'N/A'}</td>
                            <td className="p-4">
                              <Button size="sm" variant="outline">View</Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle>All Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Policy management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

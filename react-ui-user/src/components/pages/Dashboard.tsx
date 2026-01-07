import { useState, useEffect } from 'react';
import { FileText, TrendingUp, Bell, ChevronRight, Heart, Car, Activity, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { getUserPolicies, getUserActivities, getNotifications } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Icon mapping for policy types (using backend enum values)
const typeIconMap: { [key: string]: any } = {
  'life_insurance': Heart,
  'vehicle_insurance': Car,
  'health_insurance': Activity
};

// Icon mapping for activity types
const activityIconMap: { [key: string]: any } = {
  'payment': DollarSign,
  'policy': FileText,
  'claim': TrendingUp,
  'health': Activity
};

// Color mapping for policy types (using backend enum values)
const typeColorMap: { [key: string]: string } = {
  'life_insurance': 'bg-blue-500',
  'vehicle_insurance': 'bg-green-500',
  'health_insurance': 'bg-red-500'
};

// Helper function to convert backend enum to display name
const getPolicyTypeDisplayName = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'life_insurance': 'Life Insurance',
    'vehicle_insurance': 'Car Insurance',
    'health_insurance': 'Health Insurance'
  };
  return typeMap[type] || type;
};

// Helper function to format coverage (handles both number and string)
const formatCoverage = (value: number | string): string => {
  if (typeof value === 'number') {
    return `₹${value.toLocaleString('en-IN')}`;
  }
  // If already a string, return as is
  return value;
};

// Helper function to parse coverage to number (handles both number and string)
const parseCoverage = (value: number | string): number => {
  if (typeof value === 'number') return value;
  // Parse string value, remove currency symbols and commas
  const parsed = parseFloat(value.toString().replace(/[₹,]/g, '')) || 0;
  return parsed;
};

// Helper function to format premium (handles both number and string)
const formatPremium = (value: number | string): string => {
  if (typeof value === 'number') {
    return `₹${value.toLocaleString('en-IN')}/month`;
  }
  // If already a string, return as is
  return value;
};

// Helper function to parse premium to number (handles both number and string)
const parsePremium = (value: number | string): number => {
  if (typeof value === 'number') return value;
  // Parse string value, remove currency symbols, commas, and /month
  const parsed = parseFloat(value.toString().replace(/[₹,/month]/g, '')) || 0;
  return parsed;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [expandedPolicy, setExpandedPolicy] = useState<number | null>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get userId from AuthContext (more reliable than localStorage)
        const userId = user?.id || localStorage.getItem('userId') || '1';
        
        console.log('🔍 [DASHBOARD] Starting to fetch data');
        console.log('🔍 [DASHBOARD] AuthContext user:', user);
        console.log('🔍 [DASHBOARD] User ID from AuthContext:', user?.id);
        console.log('🔍 [DASHBOARD] localStorage userId:', localStorage.getItem('userId'));
        console.log('🔍 [DASHBOARD] localStorage user:', localStorage.getItem('user'));
        console.log('🔍 [DASHBOARD] Using userId:', userId);
        
        // Verify userId exists
        if (!userId || userId === '1') {
          console.warn('⚠️ [DASHBOARD] WARNING: Using default userId "1" - this may not match logged-in user');
          console.warn('⚠️ [DASHBOARD] User object:', user);
          console.warn('⚠️ [DASHBOARD] localStorage userId:', localStorage.getItem('userId'));
        }
        
        setLoading(true);
        const [policiesData, activitiesData, notificationsData] = await Promise.all([
          getUserPolicies(userId),
          getUserActivities(userId),
          getNotifications(userId)
        ]);

        console.log('✅ [DASHBOARD] All API calls completed');
        console.log('✅ [DASHBOARD] Policies data:', policiesData);
        console.log('✅ [DASHBOARD] Policies data type:', typeof policiesData);
        console.log('✅ [DASHBOARD] Is policies array:', Array.isArray(policiesData));

        // Handle array response directly (backend returns array, not object with policies property)
        const policiesArray = Array.isArray(policiesData) ? policiesData : [];
        console.log('✅ [DASHBOARD] Policies array length:', policiesArray.length);
        console.log('✅ [DASHBOARD] Setting policies:', policiesArray);
        
        if (policiesArray.length > 0) {
          console.log('✅ [DASHBOARD] First policy sample:', policiesArray[0]);
        } else {
          console.warn('⚠️ [DASHBOARD] No policies found - array is empty');
        }
        
        setPolicies(policiesArray);
        setActivities(Array.isArray(activitiesData) ? activitiesData : (activitiesData?.activities || []));
        setNotifications(Array.isArray(notificationsData) ? notificationsData : (notificationsData?.notifications || []));
      } catch (error) {
        console.error('❌ [DASHBOARD] Error fetching dashboard data:', error);
        console.error('❌ [DASHBOARD] Error details:', JSON.stringify(error, null, 2));
        if (error instanceof Error) {
          console.error('❌ [DASHBOARD] Error message:', error.message);
          console.error('❌ [DASHBOARD] Error stack:', error.stack);
        }
      } finally {
        setLoading(false);
        console.log('✅ [DASHBOARD] Loading completed');
      }
    };

    fetchData();
  }, []);

  const totalCoverage = policies.reduce((sum, policy) => {
    return sum + parseCoverage(policy.coverage);
  }, 0);

  const monthlyPremium = policies.reduce((sum, policy) => {
    return sum + parsePremium(policy.premium);
  }, 0);

  if (loading) {
    return (
      <div className="pt-[70px] min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="pt-[70px] min-h-screen bg-[#F8F9FA]">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">My Dashboard</h1>
          <p className="text-gray-600">Welcome back, John Doe</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Total Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl text-[#001F3F]">
                    ₹{(totalCoverage / 10000000).toFixed(1)}Cr
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Across {policies.length} policies</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Monthly Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl text-[#001F3F]">₹{monthlyPremium}</p>
                  <p className="text-sm text-gray-500 mt-1">Auto-debit enabled</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Active Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl text-[#001F3F]">{policies.length}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {policies.filter(p => p.status === 'Renewal Due').length} renewal due soon
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* My Policies */}
            <Card>
              <CardHeader>
                <CardTitle>My Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {policies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg mb-2">No policies found</p>
                    <p className="text-sm">Start by purchasing a new policy.</p>
                  </div>
                ) : (
                  policies.map((policy, index) => {
                  const PolicyIcon = typeIconMap[policy.type] || FileText;
                  const policyColor = typeColorMap[policy.type] || 'bg-blue-500';
                  
                  return (
                    <div
                      key={policy.policyId || policy.id}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() =>
                          setExpandedPolicy(expandedPolicy === index ? null : index)
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            <div className={`w-12 h-12 ${policyColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <PolicyIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4>{getPolicyTypeDisplayName(policy.type)}</h4>
                                <Badge
                                  variant={policy.status === 'Active' ? 'default' : 'destructive'}
                                  className={
                                    policy.status === 'Active'
                                      ? 'bg-[#28A745]'
                                      : 'bg-yellow-500'
                                  }
                                >
                                  {policy.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{policy.planName}</p>
                              <p className="text-sm text-gray-500">Policy No: {policy.policyNumber}</p>
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedPolicy === index ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </div>

                      {expandedPolicy === index && (
                        <div className="border-t bg-gray-50 p-4">
                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Coverage</p>
                              <p>{formatCoverage(policy.coverage)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Premium</p>
                              <p>{formatPremium(policy.premium)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
                              <p>{policy.expiryDate ? new Date(policy.expiryDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              }) : 'Not set'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">View Details</Button>
                            <Button size="sm" variant="outline">Download Policy</Button>
                            {policy.status === 'Renewal Due' && (
                              <Button size="sm" className="bg-[#28A745] hover:bg-[#28A745]/90">
                                Renew Now
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const ActivityIcon = activityIconMap[activity.type] || FileText;
                    
                    return (
                      <div key={activity.id} className="flex gap-4">
                        <div className="w-10 h-10 bg-[#001F3F] rounded-full flex items-center justify-center flex-shrink-0">
                          <ActivityIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p>{activity.description}</p>
                          <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/quotes">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Buy New Policy
                  </Button>
                </Link>
                <Link to="/claims/submit">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    File a Claim
                  </Button>
                </Link>
                <Link to="/claims/track">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Track Claims
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : notification.type === 'success'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <p className="text-sm mb-1">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Premium Payment Progress */}
            <Card>
              <CardHeader>
                <CardTitle>This Year's Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Paid</span>
                    <span>₹24,500 / ₹33,000</span>
                  </div>
                  <Progress value={74} />
                  <p className="text-xs text-gray-600">8 of 12 months completed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

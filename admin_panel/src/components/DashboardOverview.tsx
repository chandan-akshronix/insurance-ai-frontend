import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity, Zap, Users, Link, Eye, EyeOff } from 'lucide-react';
import { ActivityFeed } from './ActivityFeed';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useState } from 'react';

interface DashboardOverviewProps {
  onViewClaim: (claimId: string) => void;
}



// AI Operations Dashboard Data
const systemStatus = [
  { label: 'AI Agents Online', value: '8/8', status: 'optimal' },
  { label: 'System Uptime', value: '99.8%', status: 'optimal' },
  { label: 'Response Time', value: '< 450ms', status: 'optimal' }
];

const realtimeMetrics = [
  { label: 'Active Claims', value: '1,247', change: '+12%' },
  { label: 'Auto-Approved Today', value: '892', change: '+8%' },
  { label: 'High-Risk Cases', value: '42', change: '-5%' }
];

const agentPerformanceData = [
  { name: 'Intake Agent', performance: 95, status: 'optimal' },
  { name: 'Document Validator', performance: 92, status: 'optimal' },
  { name: 'Fraud Detector', performance: 88, status: 'good' },
  { name: 'Risk Assessor', performance: 90, status: 'optimal' }
];

const processingQueue = [
  { type: 'Auto Claims', count: 12, avgTime: '2.3 hrs', priority: 'normal' },
  { type: 'Health Insurance', count: 5, avgTime: '1.8 hrs', priority: 'normal' },
  { type: 'Life Underwriting', count: 18, avgTime: '6.5 hrs', priority: 'high' }
];



const integrations = [
  { name: 'Policy Database', status: 'connected' },
  { name: 'Medical Records', status: 'connected' },
  { name: 'Payment Gateway', status: 'connected' },
  { name: 'Credit Bureau API', status: 'connected' }
];

export function DashboardOverview({ onViewClaim }: DashboardOverviewProps) {
  const [visibleSections, setVisibleSections] = useState({
    systemStatus: true,
    realtimeMetrics: true,
    agentPerformance: true,
    processingQueue: true,
    integrationStatus: true,
    activityFeed: true,
  });

  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="p-10 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl mb-2">Dashboard Overview</h1>
        <p className="text-gray-600 text-lg">Real-time monitoring of AI agent performance and system metrics</p>
      </div>

      {/* AI Operations Dashboard Overview */}
      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* System Status */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <CardTitle className="text-lg">System Status</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('systemStatus')}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  {visibleSections.systemStatus ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {visibleSections.systemStatus && (
            <CardContent className="space-y-4">
              {systemStatus.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-blue-600">{item.value}</span>
                </div>
              ))}
            </CardContent>
            )}
          </Card>

          {/* Real-Time Metrics */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Real-Time Metrics</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('realtimeMetrics')}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  {visibleSections.realtimeMetrics ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {visibleSections.realtimeMetrics && (
            <CardContent className="space-y-4">
              {realtimeMetrics.map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{metric.value}</span>
                    <span className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
            )}
          </Card>

          {/* Agent Performance */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Agent Performance</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('agentPerformance')}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  {visibleSections.agentPerformance ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {visibleSections.agentPerformance && (
            <CardContent className="space-y-4">
              {agentPerformanceData.map((agent) => (
                <div key={agent.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{agent.name}</span>
                    <span className="text-blue-600">{agent.performance}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${agent.performance >= 90 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${agent.performance}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
            )}
          </Card>

          {/* Processing Queue */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Processing Queue</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('processingQueue')}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  {visibleSections.processingQueue ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {visibleSections.processingQueue && (
            <CardContent className="space-y-3">
              {processingQueue.map((item) => (
                <div key={item.type} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm">{item.type}</p>
                    <p className="text-xs text-gray-500">Avg: {item.avgTime}</p>
                  </div>
                  <Badge 
                    className={`${
                      item.priority === 'high' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-blue-100 text-blue-700'
                    } border-0`}
                  >
                    {item.count} pending
                  </Badge>
                </div>
              ))}
            </CardContent>
            )}
          </Card>

        </div>

        {/* Integration Status - Full Width */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">Integration Status</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('integrationStatus')}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                {visibleSections.integrationStatus ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </div>
          </CardHeader>
          {visibleSections.integrationStatus && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {integrations.map((integration) => (
                <div key={integration.name} className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-sm text-gray-600 mb-2 text-center">{integration.name}</span>
                  <Badge className="bg-green-100 text-green-700 border-0">
                    Connected
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
          )}
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live System Events</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Real-time claim activity stream</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('activityFeed')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              {visibleSections.activityFeed ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </div>
        </CardHeader>
        {visibleSections.activityFeed && (
        <CardContent className="pt-0">
          <ActivityFeed onViewClaim={onViewClaim} />
        </CardContent>
        )}
      </Card>
    </div>
  );
}

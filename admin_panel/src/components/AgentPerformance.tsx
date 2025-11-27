import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const agents = [
  {
    name: 'Customer Interaction Agent',
    avgTime: '2.3 min',
    accuracy: 98,
    escalationRate: 2,
    status: 'stable',
    trend: 'up',
  },
  {
    name: 'Claim Intake Agent',
    avgTime: '3.1 min',
    accuracy: 96,
    escalationRate: 4,
    status: 'stable',
    trend: 'up',
  },
  {
    name: 'Validation Agent',
    avgTime: '8.7 min',
    accuracy: 89,
    escalationRate: 12,
    status: 'stable',
    trend: 'neutral',
  },
  {
    name: 'Fraud Detection Agent',
    avgTime: '12.4 min',
    accuracy: 94,
    escalationRate: 18,
    status: 'stable',
    trend: 'up',
  },
  {
    name: 'Risk Assessment Agent',
    avgTime: '15.2 min',
    accuracy: 87,
    escalationRate: 22,
    status: 'needs_tuning',
    trend: 'down',
  },
  {
    name: 'Claim Approval Agent',
    avgTime: '4.8 min',
    accuracy: 92,
    escalationRate: 8,
    status: 'stable',
    trend: 'up',
  },
];

const performanceData = [
  { week: 'Week 1', accuracy: 85, escalation: 25 },
  { week: 'Week 2', accuracy: 87, escalation: 23 },
  { week: 'Week 3', accuracy: 89, escalation: 20 },
  { week: 'Week 4', accuracy: 91, escalation: 18 },
  { week: 'Week 5', accuracy: 90, escalation: 19 },
  { week: 'Week 6', accuracy: 92, escalation: 16 },
];

const fraudDetectionData = [
  { week: 'Week 1', detected: 12, falsePositive: 3 },
  { week: 'Week 2', detected: 15, falsePositive: 2 },
  { week: 'Week 3', detected: 18, falsePositive: 4 },
  { week: 'Week 4', detected: 14, falsePositive: 1 },
  { week: 'Week 5', detected: 19, falsePositive: 3 },
  { week: 'Week 6', detected: 21, falsePositive: 2 },
];

export function AgentPerformance() {
  const getStatusBadge = (status: string) => {
    return status === 'stable' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-orange-100 text-orange-700';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4" />;
  };

  return (
    <div className="p-10 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl mb-2">Agent Performance</h1>
        <p className="text-gray-600 text-lg">AI efficiency, accuracy, and optimization insights</p>
      </div>

      {/* Performance Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Agent Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent Name</TableHead>
                <TableHead>Avg Processing Time</TableHead>
                <TableHead>Accuracy Score</TableHead>
                <TableHead>Escalation Rate</TableHead>
                <TableHead>Status Indicator</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.name}>
                  <TableCell>{agent.name}</TableCell>
                  <TableCell>{agent.avgTime}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[120px] h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${agent.accuracy >= 90 ? 'bg-green-500' : agent.accuracy >= 80 ? 'bg-orange-500' : 'bg-red-500'}`}
                          style={{ width: `${agent.accuracy}%` }}
                        />
                      </div>
                      <span className="text-sm">{agent.accuracy}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{agent.escalationRate}%</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(agent.status)}>
                      {agent.status === 'stable' ? 'Stable' : 'Needs Tuning'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getTrendIcon(agent.trend)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Accuracy (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="escalation" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  name="Escalation Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fraud Detection Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fraudDetectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="detected" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Cases Detected"
                />
                <Line 
                  type="monotone" 
                  dataKey="falsePositive" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="False Positives"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Agent Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3>Best Performer</h3>
              </div>
              <p className="text-sm text-gray-600">Customer Interaction Agent with 98% accuracy and 2% escalation rate</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                <h3>Needs Attention</h3>
              </div>
              <p className="text-sm text-gray-600">Risk Assessment Agent showing increased escalation rate (22%)</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3>Overall Trend</h3>
              </div>
              <p className="text-sm text-gray-600">Average accuracy improved by 8% over the last 6 weeks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

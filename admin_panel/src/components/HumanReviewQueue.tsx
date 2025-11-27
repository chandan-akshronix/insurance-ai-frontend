import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Eye, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface HumanReviewQueueProps {
  onViewClaim: (claimId: string) => void;
}

const reviewQueue = [
  {
    claimId: 'CLM-1042',
    reason: 'High fraud score detected (81%)',
    assignedTo: 'Sarah Johnson',
    waitingTime: '2h 15m',
    priority: 'high',
    amount: 52000,
  },
  {
    claimId: 'CLM-1039',
    reason: 'Unusual claim frequency pattern',
    assignedTo: 'Unassigned',
    waitingTime: '4h 32m',
    priority: 'medium',
    amount: 67800,
  },
  {
    claimId: 'CLM-1025',
    reason: 'Document verification failed',
    assignedTo: 'Michael Chen',
    waitingTime: '1h 05m',
    priority: 'high',
    amount: 45600,
  },
  {
    claimId: 'CLM-1019',
    reason: 'Missing police report',
    assignedTo: 'Priya Sharma',
    waitingTime: '6h 18m',
    priority: 'low',
    amount: 28900,
  },
  {
    claimId: 'CLM-1008',
    reason: 'Duplicate invoice hash match',
    assignedTo: 'Sarah Johnson',
    waitingTime: '12h 45m',
    priority: 'high',
    amount: 73200,
  },
  {
    claimId: 'CLM-0995',
    reason: 'Ambiguous damage assessment',
    assignedTo: 'Unassigned',
    waitingTime: '3h 22m',
    priority: 'medium',
    amount: 34100,
  },
  {
    claimId: 'CLM-0987',
    reason: 'Policy coverage clarification needed',
    assignedTo: 'Michael Chen',
    waitingTime: '8h 10m',
    priority: 'low',
    amount: 19500,
  },
];

export function HumanReviewQueue({ onViewClaim }: HumanReviewQueueProps) {
  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-orange-100 text-orange-700',
      low: 'bg-blue-100 text-blue-700',
    };
    return variants[priority] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-10 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl mb-2">Review Queue</h1>
        <p className="text-gray-600 text-lg">Claims requiring human intervention</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total in Queue</p>
            <h2 className="mt-2">{reviewQueue.length}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">High Priority</p>
            <h2 className="mt-2 text-red-600">
              {reviewQueue.filter(r => r.priority === 'high').length}
            </h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Wait Time</p>
            <h2 className="mt-2">5h 32m</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Unassigned</p>
            <h2 className="mt-2 text-orange-600">
              {reviewQueue.filter(r => r.assignedTo === 'Unassigned').length}
            </h2>
          </CardContent>
        </Card>
      </div>

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Reason for Escalation</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Assigned Reviewer</TableHead>
                <TableHead>Waiting Time</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewQueue.map((item) => (
                <TableRow key={item.claimId}>
                  <TableCell>
                    <span className="text-blue-600">{item.claimId}</span>
                  </TableCell>
                  <TableCell className="text-sm">{item.reason}</TableCell>
                  <TableCell>₹{item.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    {item.assignedTo === 'Unassigned' ? (
                      <Badge variant="outline" className="text-orange-600">Unassigned</Badge>
                    ) : (
                      <span className="text-sm">{item.assignedTo}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{item.waitingTime}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadge(item.priority)}>
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewClaim(item.claimId)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <XCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline">Assign All High Priority</Button>
            <Button variant="outline">Export Queue Report</Button>
            <Button variant="outline">Set Auto-Assignment Rules</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

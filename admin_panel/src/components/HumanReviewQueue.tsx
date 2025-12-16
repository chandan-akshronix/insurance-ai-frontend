import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Eye, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ApplicationProcess } from '../types';

interface ReviewItem {
  claimId: string;
  reason: string;
  assignedTo: string;
  waitingTime: string;
  priority: string;
  amount: number;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

interface HumanReviewQueueProps {
  onViewClaim: (claimId: string) => void;
}



export function HumanReviewQueue({ onViewClaim }: HumanReviewQueueProps) {
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/agent/applications`);
        if (!response.ok) throw new Error('Failed to fetch applications');
        const data: ApplicationProcess[] = await response.json();

        // Filter for items needing review
        const reviewableStatuses = ['escalate_to_senior', 'manual_review', 'pending_review', 'ask_for_document'];
        const filtered = data.filter(app => reviewableStatuses.includes(app.status));

        const mappedData = filtered.map(app => ({
          claimId: app.applicationId,
          reason: app.reviewReason || app.status.replace(/_/g, ' '),
          assignedTo: app.assignedTo || 'Unassigned',
          waitingTime: getTimeDifference(app.lastUpdated),
          priority: 'high', // Could derive from agentData.risk_score
          amount: parseFloat(String(app.agentData?.ingest_llm?.normalized_application?.coverage_selection?.coverageAmount || 0)),
        }));

        setReviewQueue(mappedData);
      } catch (error) {
        console.error("Error fetching review queue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTimeDifference = (dateString: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60)); // minutes
    if (diff < 60) return `${diff}m`;
    const hours = Math.floor(diff / 60);
    return `${hours}h ${diff % 60}m`;
  };

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

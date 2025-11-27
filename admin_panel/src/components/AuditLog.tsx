import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, Search, Filter } from 'lucide-react';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

const auditEntries = [
  {
    id: '1',
    timestamp: '2025-10-26 14:05:23',
    claimId: 'CLM-1042',
    agent: 'Risk Agent',
    action: 'Updated cost estimate from ₹28,900 → ₹34,500 (+₹5,600)',
    category: 'update',
  },
  {
    id: '2',
    timestamp: '2025-10-26 14:02:15',
    claimId: 'CLM-1042',
    agent: 'Fraud Agent',
    action: 'Detected document hash match with prior fraudulent case #892',
    category: 'fraud',
  },
  {
    id: '3',
    timestamp: '2025-10-26 13:57:42',
    claimId: 'CLM-1042',
    agent: 'Validation Agent',
    action: 'Confirmed police report authenticity',
    category: 'validation',
  },
  {
    id: '4',
    timestamp: '2025-10-26 13:52:18',
    claimId: 'CLM-1041',
    agent: 'Approval Agent',
    action: 'Auto-approved claim with confidence score 0.96',
    category: 'approval',
  },
  {
    id: '5',
    timestamp: '2025-10-26 13:48:35',
    claimId: 'CLM-1040',
    agent: 'Risk Agent',
    action: 'Escalated to human review due to high settlement amount (₹91,200)',
    category: 'escalation',
  },
  {
    id: '6',
    timestamp: '2025-10-26 13:45:12',
    claimId: 'CLM-1039',
    agent: 'Fraud Agent',
    action: 'Flagged for unusual claim frequency (3 claims in 30 days)',
    category: 'fraud',
  },
  {
    id: '7',
    timestamp: '2025-10-26 13:40:28',
    claimId: 'CLM-1038',
    agent: 'Validation Agent',
    action: 'OCR extraction completed with 94% confidence',
    category: 'validation',
  },
  {
    id: '8',
    timestamp: '2025-10-26 13:35:45',
    claimId: 'CLM-1037',
    agent: 'Intake Agent',
    action: 'Claim registered successfully. Policy status: Active',
    category: 'intake',
  },
  {
    id: '9',
    timestamp: '2025-10-26 13:30:19',
    claimId: 'CLM-1036',
    agent: 'Approval Agent',
    action: 'Claim rejected due to policy exclusion (flood damage)',
    category: 'rejection',
  },
  {
    id: '10',
    timestamp: '2025-10-26 13:25:52',
    claimId: 'CLM-1035',
    agent: 'Risk Agent',
    action: 'Updated estimated settlement for Claim to ₹45,200',
    category: 'update',
  },
  {
    id: '11',
    timestamp: '2025-10-26 13:20:33',
    claimId: 'CLM-1034',
    agent: 'Fraud Agent',
    action: 'No fraud indicators detected. Proceeding to risk assessment.',
    category: 'validation',
  },
  {
    id: '12',
    timestamp: '2025-10-26 13:15:07',
    claimId: 'CLM-1033',
    agent: 'Validation Agent',
    action: 'Requested additional documentation (medical certificate)',
    category: 'escalation',
  },
];

export function AuditLog() {
  const getCategoryBadge = (category: string) => {
    const variants: Record<string, string> = {
      update: 'bg-blue-100 text-blue-700',
      fraud: 'bg-red-100 text-red-700',
      validation: 'bg-green-100 text-green-700',
      approval: 'bg-green-100 text-green-700',
      rejection: 'bg-gray-100 text-gray-700',
      escalation: 'bg-orange-100 text-orange-700',
      intake: 'bg-purple-100 text-purple-700',
    };
    return variants[category] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      update: 'Update',
      fraud: 'Fraud Alert',
      validation: 'Validation',
      approval: 'Approved',
      rejection: 'Rejected',
      escalation: 'Escalation',
      intake: 'Intake',
    };
    return labels[category] || category;
  };

  return (
    <div className="p-10 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl mb-2">Audit Trail</h1>
        <p className="text-gray-600 text-lg">Complete decision history and compliance log</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search by Claim ID..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="fraud">Fraud Agent</SelectItem>
                <SelectItem value="risk">Risk Agent</SelectItem>
                <SelectItem value="validation">Validation Agent</SelectItem>
                <SelectItem value="approval">Approval Agent</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="fraud">Fraud Alerts</SelectItem>
                <SelectItem value="approval">Approvals</SelectItem>
                <SelectItem value="escalation">Escalations</SelectItem>
                <SelectItem value="update">Updates</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chronological Audit Trail</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export as PDF
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-1">
              {auditEntries.map((entry, index) => (
                <div key={entry.id}>
                  <div className="flex gap-4 py-4 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                    <div className="flex-shrink-0 w-40">
                      <span className="text-sm text-gray-500">{entry.timestamp}</span>
                    </div>
                    <div className="flex-shrink-0 w-32">
                      <Badge variant="outline" className="text-xs">
                        {entry.claimId}
                      </Badge>
                    </div>
                    <div className="flex-shrink-0 w-40">
                      <span className="text-sm text-blue-600">{entry.agent}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm">{entry.action}</span>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge className={getCategoryBadge(entry.category)}>
                        {getCategoryLabel(entry.category)}
                      </Badge>
                    </div>
                  </div>
                  {index < auditEntries.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Events Today</p>
            <h2 className="mt-2">{auditEntries.length}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Fraud Alerts</p>
            <h2 className="mt-2 text-red-600">
              {auditEntries.filter(e => e.category === 'fraud').length}
            </h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Auto-Approvals</p>
            <h2 className="mt-2 text-green-600">
              {auditEntries.filter(e => e.category === 'approval').length}
            </h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Escalations</p>
            <h2 className="mt-2 text-orange-600">
              {auditEntries.filter(e => e.category === 'escalation').length}
            </h2>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, Send, XCircle, FileQuestion, ArrowUpCircle, RefreshCw, RotateCcw, Search, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { useState } from 'react';

interface ClaimsPipelineProps {
  onSelectClaim: (claimId: string) => void;
}

// Active Claims Table Data
const activeClaimsData = [
  // New Claims
  {
    id: 'CLM-2045',
    customer: 'Arjun Kapoor',
    amount: 125000,
    type: 'Health Insurance',
    status: 'new_claim',
    assignedTo: 'AI Agent 1',
    time: '5 mins ago'
  },
  {
    id: 'CLM-2038',
    customer: 'Meera Reddy',
    amount: 42000,
    type: 'Life Insurance',
    status: 'new_claim',
    assignedTo: 'AI Agent 3',
    time: '1 hour ago'
  },
  {
    id: 'CLM-2032',
    customer: 'Aditya Verma',
    amount: 95000,
    type: 'Auto Claims',
    status: 'new_claim',
    assignedTo: 'AI Agent 2',
    time: '2 hours ago'
  },
  {
    id: 'CLM-2028',
    customer: 'Pooja Nair',
    amount: 156000,
    type: 'Health Insurance',
    status: 'new_claim',
    assignedTo: 'AI Agent 1',
    time: '3 hours ago'
  },
  
  // Sent for Approval
  {
    id: 'CLM-2044',
    customer: 'Neha Gupta',
    amount: 89000,
    type: 'Auto Claims',
    status: 'sent_for_approval',
    assignedTo: 'Senior Manager',
    time: '12 mins ago'
  },
  {
    id: 'CLM-2037',
    customer: 'Sanjay Iyer',
    amount: 215000,
    type: 'Property Insurance',
    status: 'sent_for_approval',
    assignedTo: 'Senior Manager',
    time: '30 mins ago'
  },
  {
    id: 'CLM-2031',
    customer: 'Riya Chatterjee',
    amount: 78000,
    type: 'Health Insurance',
    status: 'sent_for_approval',
    assignedTo: 'Approval Team',
    time: '2 hours ago'
  },
  
  // Rejected
  {
    id: 'CLM-2043',
    customer: 'Karthik Menon',
    amount: 45000,
    type: 'Life Insurance',
    status: 'rejected',
    assignedTo: 'AI Agent 2',
    time: '18 mins ago'
  },
  {
    id: 'CLM-2036',
    customer: 'Pradeep Kumar',
    amount: 62000,
    type: 'Auto Claims',
    status: 'rejected',
    assignedTo: 'Senior Underwriter',
    time: '1 hour ago'
  },
  {
    id: 'CLM-2029',
    customer: 'Lakshmi Patel',
    amount: 38000,
    type: 'Health Insurance',
    status: 'rejected',
    assignedTo: 'AI Agent 1',
    time: '4 hours ago'
  },
  
  // Ask for Document
  {
    id: 'CLM-2042',
    customer: 'Simran Kaur',
    amount: 67500,
    type: 'Health Insurance',
    status: 'ask_for_document',
    assignedTo: 'AI Agent 3',
    time: '25 mins ago'
  },
  {
    id: 'CLM-2035',
    customer: 'Manish Jain',
    amount: 112000,
    type: 'Life Insurance',
    status: 'ask_for_document',
    assignedTo: 'Document Validator',
    time: '1 hour ago'
  },
  {
    id: 'CLM-2030',
    customer: 'Divya Rao',
    amount: 85000,
    type: 'Property Insurance',
    status: 'ask_for_document',
    assignedTo: 'AI Agent 2',
    time: '3 hours ago'
  },
  {
    id: 'CLM-2026',
    customer: 'Harish Shetty',
    amount: 48000,
    type: 'Auto Claims',
    status: 'ask_for_document',
    assignedTo: 'AI Agent 3',
    time: '5 hours ago'
  },
  
  // Escalate to Senior
  {
    id: 'CLM-2041',
    customer: 'Rohit Sharma',
    amount: 195000,
    type: 'Property Insurance',
    status: 'escalate_to_senior',
    assignedTo: 'Senior Underwriter',
    time: '32 mins ago'
  },
  {
    id: 'CLM-2034',
    customer: 'Tanvi Desai',
    amount: 285000,
    type: 'Health Insurance',
    status: 'escalate_to_senior',
    assignedTo: 'Senior Manager',
    time: '1 hour ago'
  },
  {
    id: 'CLM-2027',
    customer: 'Vishal Mehta',
    amount: 320000,
    type: 'Life Insurance',
    status: 'escalate_to_senior',
    assignedTo: 'Chief Underwriter',
    time: '4 hours ago'
  },
  
  // Updated Application
  {
    id: 'CLM-2040',
    customer: 'Anjali Deshmukh',
    amount: 53000,
    type: 'Auto Claims',
    status: 'updated_application',
    assignedTo: 'AI Agent 1',
    time: '45 mins ago'
  },
  {
    id: 'CLM-2033',
    customer: 'Suresh Bhat',
    amount: 72000,
    type: 'Health Insurance',
    status: 'updated_application',
    assignedTo: 'AI Agent 2',
    time: '2 hours ago'
  },
  {
    id: 'CLM-2025',
    customer: 'Kavya Krishnan',
    amount: 96000,
    type: 'Property Insurance',
    status: 'updated_application',
    assignedTo: 'AI Agent 3',
    time: '6 hours ago'
  },
  
  // Reapplication
  {
    id: 'CLM-2039',
    customer: 'Vikrant Singh',
    amount: 78000,
    type: 'Health Insurance',
    status: 'reapplication',
    assignedTo: 'AI Agent 2',
    time: '1 hour ago'
  },
  {
    id: 'CLM-2024',
    customer: 'Shalini Tripathi',
    amount: 105000,
    type: 'Life Insurance',
    status: 'reapplication',
    assignedTo: 'AI Agent 1',
    time: '3 hours ago'
  },
  {
    id: 'CLM-2023',
    customer: 'Ramesh Choudhary',
    amount: 64000,
    type: 'Auto Claims',
    status: 'reapplication',
    assignedTo: 'AI Agent 3',
    time: '7 hours ago'
  },
];

// Reusable Claims Table Component
function ClaimsTable({ 
  claims, 
  onSelectClaim, 
  getStatusBadge,
  searchTerm
}: { 
  claims: typeof activeClaimsData; 
  onSelectClaim: (claimId: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  searchTerm: string;
}) {
  // Filter claims based on search term
  const filteredClaims = claims.filter(claim => {
    const searchLower = searchTerm.toLowerCase();
    return (
      claim.id.toLowerCase().includes(searchLower) ||
      claim.customer.toLowerCase().includes(searchLower) ||
      claim.type.toLowerCase().includes(searchLower) ||
      claim.assignedTo.toLowerCase().includes(searchLower)
    );
  });

  if (filteredClaims.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>{searchTerm ? 'No claims found matching your search' : 'No claims found in this category'}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[120px]">Claim ID</TableHead>
              <TableHead className="w-[180px]">Customer Name</TableHead>
              <TableHead className="w-[180px]">Type</TableHead>
              <TableHead className="w-[140px]">Amount</TableHead>
              <TableHead className="w-[220px]">Status</TableHead>
              <TableHead className="w-[180px]">Assigned To</TableHead>
              <TableHead className="w-[130px] text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClaims.map((claim) => (
              <TableRow 
                key={claim.id} 
                className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                onClick={() => onSelectClaim(claim.id)}
              >
                <TableCell className="w-[120px]">
                  <span className="text-blue-600">{claim.id}</span>
                </TableCell>
                <TableCell className="w-[180px]">{claim.customer}</TableCell>
                <TableCell className="w-[180px]">
                  <span className="text-sm text-gray-600">{claim.type}</span>
                </TableCell>
                <TableCell className="w-[140px]">
                  <span>₹{claim.amount.toLocaleString('en-IN')}</span>
                </TableCell>
                <TableCell className="w-[220px]">
                  {getStatusBadge(claim.status)}
                </TableCell>
                <TableCell className="w-[180px]">
                  <span className="text-sm text-gray-600">{claim.assignedTo}</span>
                </TableCell>
                <TableCell className="w-[130px] text-right">
                  <span className="text-xs text-gray-500">{claim.time}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function ClaimsPipeline({ onSelectClaim }: ClaimsPipelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
      new_claim: { 
        label: 'New Claim', 
        icon: FileText, 
        className: 'bg-blue-100 text-blue-700 border-blue-200' 
      },
      sent_for_approval: { 
        label: 'Sent for Approval', 
        icon: Send, 
        className: 'bg-purple-100 text-purple-700 border-purple-200' 
      },
      rejected: { 
        label: 'Rejected', 
        icon: XCircle, 
        className: 'bg-red-100 text-red-700 border-red-200' 
      },
      ask_for_document: { 
        label: 'Ask for Document', 
        icon: FileQuestion, 
        className: 'bg-orange-100 text-orange-700 border-orange-200' 
      },
      escalate_to_senior: { 
        label: 'Escalate to Senior', 
        icon: ArrowUpCircle, 
        className: 'bg-amber-100 text-amber-700 border-amber-200' 
      },
      updated_application: { 
        label: 'Updated Application', 
        icon: RefreshCw, 
        className: 'bg-cyan-100 text-cyan-700 border-cyan-200' 
      },
      reapplication: { 
        label: 'Reapplication', 
        icon: RotateCcw, 
        className: 'bg-indigo-100 text-indigo-700 border-indigo-200' 
      },
    };

    const config = statusConfig[status] || statusConfig.new_claim;
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} border flex items-center gap-1.5 px-3 py-1`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-10 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Active Claims Table with Tabs */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by claim ID, customer name, type, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>
            <Button
              onClick={() => setIsVisible(!isVisible)}
              variant="outline"
              className="h-11 px-4 border-gray-300 hover:bg-gray-100 flex items-center gap-2"
            >
              {isVisible ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Show</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {isVisible && (
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-auto gap-2 bg-transparent p-0 mb-6">
              <TabsTrigger value="all" className="px-3 py-3 data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-gray-700 flex items-center justify-center gap-2">
                <span>All Claims</span>
                <Badge className="bg-gray-600 text-white border-0 text-xs px-2 py-0.5">{activeClaimsData.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="new_claim" className="px-3 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-blue-600 flex items-center justify-center gap-2">
                <span>New Claim</span>
                <Badge className="bg-blue-500 text-white border-0 text-xs px-2 py-0.5">
                  {activeClaimsData.filter(c => c.status === 'new_claim').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="sent_for_approval" className="px-3 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-purple-600 flex items-center justify-center gap-2">
                <span>Sent for Approval</span>
                <Badge className="bg-purple-500 text-white border-0 text-xs px-2 py-0.5">
                  {activeClaimsData.filter(c => c.status === 'sent_for_approval').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="px-3 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-red-600 flex items-center justify-center gap-2">
                <span>Rejected</span>
                <Badge className="bg-red-500 text-white border-0 text-xs px-2 py-0.5">
                  {activeClaimsData.filter(c => c.status === 'rejected').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ask_for_document" className="px-3 py-3 data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-orange-600 flex items-center justify-center gap-2">
                <span>Ask for Document</span>
                <Badge className="bg-orange-500 text-white border-0 text-xs px-2 py-0.5">
                  {activeClaimsData.filter(c => c.status === 'ask_for_document').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="escalate_to_senior" className="px-3 py-3 data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-amber-600 flex items-center justify-center gap-2">
                <span>Escalate to Senior</span>
                <Badge className="bg-amber-500 text-white border-0 text-xs px-2 py-0.5">
                  {activeClaimsData.filter(c => c.status === 'escalate_to_senior').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="updated_application" className="px-3 py-3 data-[state=active]:bg-cyan-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-cyan-600 flex items-center justify-center gap-2">
                <span>Updated Application</span>
                <Badge className="bg-cyan-500 text-white border-0 text-xs px-2 py-0.5">
                  {activeClaimsData.filter(c => c.status === 'updated_application').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="reapplication" className="px-3 py-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-indigo-600 flex items-center justify-center gap-2">
                <span>Reapplication</span>
                <Badge className="bg-indigo-500 text-white border-0 text-xs px-2 py-0.5">
                  {activeClaimsData.filter(c => c.status === 'reapplication').length}
                </Badge>
              </TabsTrigger>
            </TabsList>

              <TabsContent value="all" className="mt-0">
                <ClaimsTable 
                  claims={activeClaimsData} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="new_claim" className="mt-0">
                <ClaimsTable 
                  claims={activeClaimsData.filter(c => c.status === 'new_claim')} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="sent_for_approval" className="mt-0">
                <ClaimsTable 
                  claims={activeClaimsData.filter(c => c.status === 'sent_for_approval')} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="rejected" className="mt-0">
                <ClaimsTable 
                  claims={activeClaimsData.filter(c => c.status === 'rejected')} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="ask_for_document" className="mt-0">
                <ClaimsTable 
                  claims={activeClaimsData.filter(c => c.status === 'ask_for_document')} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="escalate_to_senior" className="mt-0">
                <ClaimsTable 
                  claims={activeClaimsData.filter(c => c.status === 'escalate_to_senior')} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="updated_application" className="mt-0">
                <ClaimsTable 
                  claims={activeClaimsData.filter(c => c.status === 'updated_application')} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="reapplication" className="mt-0">
                <ClaimsTable 
                  claims={activeClaimsData.filter(c => c.status === 'reapplication')} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>
          </Tabs>
        </CardContent>
        )}
      </Card>
    </div>
  );
}

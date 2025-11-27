import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  FileText, 
  Send, 
  XCircle, 
  FileQuestion, 
  ArrowUpCircle, 
  RefreshCw, 
  RotateCcw,
  Search,
  CheckCircle
} from 'lucide-react';
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

interface AIProcessFlowProps {
  onSelectClaim?: (claimId: string) => void;
}

// Active Applications Table Data
const activeApplicationsData = [
  // New Application
  {
    id: 'APP-3045',
    customer: 'Arjun Kapoor',
    amount: 500000,
    type: 'Health Insurance',
    status: 'new_application',
    assignedTo: 'Intake Agent',
    time: '5 mins ago'
  },
  {
    id: 'APP-3038',
    customer: 'Meera Reddy',
    amount: 1200000,
    type: 'Life Insurance',
    status: 'new_application',
    assignedTo: 'Intake Agent',
    time: '1 hour ago'
  },
  {
    id: 'APP-3032',
    customer: 'Aditya Verma',
    amount: 300000,
    type: 'Auto Insurance',
    status: 'new_application',
    assignedTo: 'Intake Agent',
    time: '2 hours ago'
  },
  {
    id: 'APP-3028',
    customer: 'Pooja Nair',
    amount: 800000,
    type: 'Health Insurance',
    status: 'new_application',
    assignedTo: 'Intake Agent',
    time: '3 hours ago'
  },
  
  // Sent for Approval
  {
    id: 'APP-3044',
    customer: 'Neha Gupta',
    amount: 650000,
    type: 'Auto Insurance',
    status: 'sent_for_approval',
    assignedTo: 'Senior Underwriter',
    time: '12 mins ago'
  },
  {
    id: 'APP-3037',
    customer: 'Sanjay Iyer',
    amount: 2500000,
    type: 'Property Insurance',
    status: 'sent_for_approval',
    assignedTo: 'Senior Manager',
    time: '30 mins ago'
  },
  {
    id: 'APP-3031',
    customer: 'Riya Chatterjee',
    amount: 950000,
    type: 'Health Insurance',
    status: 'sent_for_approval',
    assignedTo: 'Approval Team',
    time: '2 hours ago'
  },
  
  // Rejected
  {
    id: 'APP-3043',
    customer: 'Karthik Menon',
    amount: 450000,
    type: 'Life Insurance',
    status: 'rejected',
    assignedTo: 'Decision Agent',
    time: '18 mins ago'
  },
  {
    id: 'APP-3036',
    customer: 'Pradeep Kumar',
    amount: 320000,
    type: 'Auto Insurance',
    status: 'rejected',
    assignedTo: 'Senior Underwriter',
    time: '1 hour ago'
  },
  {
    id: 'APP-3029',
    customer: 'Lakshmi Patel',
    amount: 550000,
    type: 'Health Insurance',
    status: 'rejected',
    assignedTo: 'Medical Agent',
    time: '4 hours ago'
  },
  
  // Ask for Document
  {
    id: 'APP-3042',
    customer: 'Simran Kaur',
    amount: 720000,
    type: 'Health Insurance',
    status: 'ask_for_document',
    assignedTo: 'Verification Agent',
    time: '25 mins ago'
  },
  {
    id: 'APP-3035',
    customer: 'Manish Jain',
    amount: 1500000,
    type: 'Life Insurance',
    status: 'ask_for_document',
    assignedTo: 'Document Validator',
    time: '1 hour ago'
  },
  {
    id: 'APP-3030',
    customer: 'Divya Rao',
    amount: 980000,
    type: 'Property Insurance',
    status: 'ask_for_document',
    assignedTo: 'Verification Agent',
    time: '3 hours ago'
  },
  {
    id: 'APP-3026',
    customer: 'Harish Shetty',
    amount: 430000,
    type: 'Auto Insurance',
    status: 'ask_for_document',
    assignedTo: 'Verification Agent',
    time: '5 hours ago'
  },
  
  // Escalate to Senior
  {
    id: 'APP-3041',
    customer: 'Rohit Sharma',
    amount: 3200000,
    type: 'Property Insurance',
    status: 'escalate_to_senior',
    assignedTo: 'Senior Underwriter',
    time: '32 mins ago'
  },
  {
    id: 'APP-3034',
    customer: 'Tanvi Desai',
    amount: 1800000,
    type: 'Health Insurance',
    status: 'escalate_to_senior',
    assignedTo: 'Senior Manager',
    time: '1 hour ago'
  },
  {
    id: 'APP-3027',
    customer: 'Vishal Mehta',
    amount: 2100000,
    type: 'Life Insurance',
    status: 'escalate_to_senior',
    assignedTo: 'Chief Underwriter',
    time: '4 hours ago'
  },
  
  // Updated Application
  {
    id: 'APP-3040',
    customer: 'Anjali Deshmukh',
    amount: 680000,
    type: 'Auto Insurance',
    status: 'updated_application',
    assignedTo: 'Intake Agent',
    time: '45 mins ago'
  },
  {
    id: 'APP-3033',
    customer: 'Suresh Bhat',
    amount: 890000,
    type: 'Health Insurance',
    status: 'updated_application',
    assignedTo: 'Medical Agent',
    time: '2 hours ago'
  },
  {
    id: 'APP-3025',
    customer: 'Kavya Krishnan',
    amount: 1350000,
    type: 'Property Insurance',
    status: 'updated_application',
    assignedTo: 'Financial Agent',
    time: '6 hours ago'
  },
  
  // Approved Applications
  {
    id: 'APP-3022',
    customer: 'Deepak Shah',
    amount: 750000,
    type: 'Health Insurance',
    status: 'approved',
    assignedTo: 'Approval Team',
    time: '2 hours ago'
  },
  {
    id: 'APP-3021',
    customer: 'Ananya Reddy',
    amount: 1100000,
    type: 'Life Insurance',
    status: 'approved',
    assignedTo: 'Senior Underwriter',
    time: '3 hours ago'
  },
  {
    id: 'APP-3020',
    customer: 'Rahul Bhatt',
    amount: 420000,
    type: 'Auto Insurance',
    status: 'approved',
    assignedTo: 'Approval Team',
    time: '5 hours ago'
  },
  {
    id: 'APP-3019',
    customer: 'Priyanka Joshi',
    amount: 2200000,
    type: 'Property Insurance',
    status: 'approved',
    assignedTo: 'Chief Underwriter',
    time: '8 hours ago'
  },
  
  // Reapplication
  {
    id: 'APP-3039',
    customer: 'Vikrant Singh',
    amount: 750000,
    type: 'Health Insurance',
    status: 'reapplication',
    assignedTo: 'Medical Agent',
    time: '1 hour ago'
  },
  {
    id: 'APP-3024',
    customer: 'Shalini Tripathi',
    amount: 1650000,
    type: 'Life Insurance',
    status: 'reapplication',
    assignedTo: 'Intake Agent',
    time: '3 hours ago'
  },
  {
    id: 'APP-3023',
    customer: 'Ramesh Choudhary',
    amount: 540000,
    type: 'Auto Insurance',
    status: 'reapplication',
    assignedTo: 'Financial Agent',
    time: '7 hours ago'
  },
];

// Reusable Applications Table Component
function ApplicationsTable({ 
  applications, 
  onSelectClaim, 
  getStatusBadge,
  searchTerm
}: { 
  applications: typeof activeApplicationsData; 
  onSelectClaim?: (claimId: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  searchTerm: string;
}) {
  // Filter applications based on search term
  const filteredApplications = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.id.toLowerCase().includes(searchLower) ||
      app.customer.toLowerCase().includes(searchLower) ||
      app.type.toLowerCase().includes(searchLower) ||
      app.assignedTo.toLowerCase().includes(searchLower)
    );
  });

  if (filteredApplications.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>{searchTerm ? 'No applications found matching your search' : 'No applications found in this category'}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[120px]">Application ID</TableHead>
              <TableHead className="w-[180px]">Customer Name</TableHead>
              <TableHead className="w-[180px]">Type</TableHead>
              <TableHead className="w-[140px]">Sum Insured</TableHead>
              <TableHead className="w-[220px]">Status</TableHead>
              <TableHead className="w-[180px]">Assigned To</TableHead>
              <TableHead className="w-[130px] text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((app) => (
              <TableRow 
                key={app.id} 
                className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                onClick={() => onSelectClaim?.(app.id)}
              >
                <TableCell className="w-[120px]">
                  <span className="text-blue-600">{app.id}</span>
                </TableCell>
                <TableCell className="w-[180px]">{app.customer}</TableCell>
                <TableCell className="w-[180px]">
                  <span className="text-sm text-gray-600">{app.type}</span>
                </TableCell>
                <TableCell className="w-[140px]">
                  <span>₹{app.amount.toLocaleString('en-IN')}</span>
                </TableCell>
                <TableCell className="w-[220px]">
                  {getStatusBadge(app.status)}
                </TableCell>
                <TableCell className="w-[180px]">
                  <span className="text-sm text-gray-600">{app.assignedTo}</span>
                </TableCell>
                <TableCell className="w-[130px] text-right">
                  <span className="text-xs text-gray-500">{app.time}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function AIProcessFlow({ onSelectClaim }: AIProcessFlowProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
      new_application: { 
        label: 'New Application', 
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
      approved: { 
        label: 'Approved', 
        icon: CheckCircle, 
        className: 'bg-green-100 text-green-700 border-green-200' 
      },
      reapplication: { 
        label: 'Reapplication', 
        icon: RotateCcw, 
        className: 'bg-indigo-100 text-indigo-700 border-indigo-200' 
      },
    };

    const config = statusConfig[status] || statusConfig.new_application;
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
      {/* Active Applications Table with Tabs */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by application ID, customer name, type, or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="new_application" className="w-full">
            <TabsList className="grid grid-cols-5 w-full h-auto gap-2 bg-transparent p-0 mb-6">
              <TabsTrigger value="new_application" className="px-3 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-blue-600 flex items-center justify-center gap-2">
                <span>New Application</span>
                <Badge className="bg-blue-500 text-white border-0 text-xs px-2 py-0.5">
                  {activeApplicationsData.filter(a => a.status === 'new_application' || a.status === 'updated_application').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ask_for_document" className="px-3 py-3 data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-orange-600 flex items-center justify-center gap-2">
                <span>Ask for Document</span>
                <Badge className="bg-orange-500 text-white border-0 text-xs px-2 py-0.5">
                  {activeApplicationsData.filter(a => a.status === 'ask_for_document').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="escalate_to_senior" className="px-3 py-3 data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-amber-600 flex items-center justify-center gap-2">
                <span>Escalate to Senior</span>
                <Badge className="bg-amber-500 text-white border-0 text-xs px-2 py-0.5">
                  {activeApplicationsData.filter(a => a.status === 'escalate_to_senior').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="px-3 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-red-600 flex items-center justify-center gap-2">
                <span>Rejected</span>
                <Badge className="bg-red-500 text-white border-0 text-xs px-2 py-0.5">
                  {activeApplicationsData.filter(a => a.status === 'rejected').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" className="px-3 py-3 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-green-600 flex items-center justify-center gap-2">
                <span>Approved</span>
                <Badge className="bg-green-500 text-white border-0 text-xs px-2 py-0.5">
                  {activeApplicationsData.filter(a => a.status === 'approved').length}
                </Badge>
              </TabsTrigger>
            </TabsList>

              <TabsContent value="new_application" className="mt-0">
                <ApplicationsTable 
                  applications={activeApplicationsData.filter(a => a.status === 'new_application' || a.status === 'updated_application')} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="ask_for_document" className="mt-0">
                <ApplicationsTable 
                  applications={activeApplicationsData.filter(a => a.status === 'ask_for_document')} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="escalate_to_senior" className="mt-0">
                <ApplicationsTable 
                  applications={activeApplicationsData.filter(a => a.status === 'escalate_to_senior')} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="rejected" className="mt-0">
                <ApplicationsTable 
                  applications={activeApplicationsData.filter(a => a.status === 'rejected')} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="approved" className="mt-0">
                <ApplicationsTable 
                  applications={activeApplicationsData.filter(a => a.status === 'approved')} 
                  onSelectClaim={onSelectClaim} 
                  getStatusBadge={getStatusBadge}
                  searchTerm={searchTerm}
                />
              </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

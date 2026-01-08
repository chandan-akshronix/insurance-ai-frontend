import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, Send, XCircle, FileQuestion, ArrowUpCircle, RefreshCw, RotateCcw, Search, Eye, EyeOff, CheckCircle } from 'lucide-react';
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
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface ClaimData {
  id: string;
  customer: string;
  amount: number;
  type: string;
  status: string;
  assignedTo: string;
  time: string;
}

// Reusable Claims Table Component
function ClaimsTable({
  claims,
  onSelectClaim,
  getStatusBadge,
  searchTerm
}: {
  claims: ClaimData[];
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

export function ClaimsPipeline({ onSelectClaim }: { onSelectClaim: (claimId: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [activeClaimsData, setActiveClaimsData] = useState<ClaimData[]>([]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/claims/all-applications`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        const mapped: ClaimData[] = data.map((doc: any) => {
          // Extract amount
          let amount = 0;
          if (doc.hospitalization_details?.estimated_amount) {
            amount = parseFloat(doc.hospitalization_details.estimated_amount);
          } else if (doc.accident_details?.estimated_repair_cost) {
            amount = parseFloat(doc.accident_details.estimated_repair_cost);
          } else if (doc.claim_type === 'life') {
            // Fallback for life - maybe use coverage if we can get it, but 0 for now as dummy
            amount = 0;
          }

          return {
            id: doc._id,
            customer: doc.claimant_info?.name || doc.userId || 'Unknown',
            amount: isNaN(amount) ? 0 : amount,
            type: doc.claim_type ? doc.claim_type.charAt(0).toUpperCase() + doc.claim_type.slice(1) + ' Insurance' : 'General Insurance',
            status: doc.status || 'new_claim',
            assignedTo: 'AI Agent',
            time: doc.created_at ? new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'
          };
        });

        setActiveClaimsData(mapped);
      } catch (e) {
        console.error("Error fetching claims:", e);
      }
    };

    fetchClaims();
    const interval = setInterval(fetchClaims, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
      new_claim: {
        label: 'New Claim',
        icon: FileText,
        className: 'bg-blue-100 text-blue-700 border-blue-200'
      },
      submitted: {
        label: 'Submitted',
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
      approved: {
        label: 'Approved',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700 border-green-200'
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
            <Tabs defaultValue="new_claim" className="w-full">
              <TabsList className="grid grid-cols-5 w-full h-auto gap-2 bg-transparent p-0 mb-6">
                <TabsTrigger value="new_claim" className="px-3 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-blue-600 flex items-center justify-center gap-2">
                  <span>New Claim</span>
                  <Badge className="bg-blue-500 text-white border-0 text-xs px-2 py-0.5">
                    {activeClaimsData.filter(c => c.status === 'new_claim' || c.status === 'submitted').length}
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
                <TabsTrigger value="approved" className="px-3 py-3 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-green-600 flex items-center justify-center gap-2">
                  <span>Approved</span>
                  <Badge className="bg-green-500 text-white border-0 text-xs px-2 py-0.5">
                    {activeClaimsData.filter(c => c.status === 'approved').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="px-3 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg border border-gray-200 data-[state=active]:border-red-600 flex items-center justify-center gap-2">
                  <span>Rejected</span>
                  <Badge className="bg-red-500 text-white border-0 text-xs px-2 py-0.5">
                    {activeClaimsData.filter(c => c.status === 'rejected').length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new_claim" className="mt-0">
                <ClaimsTable
                  claims={activeClaimsData.filter(c => c.status === 'new_claim' || c.status === 'submitted')}
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

              <TabsContent value="approved" className="mt-0">
                <ClaimsTable
                  claims={activeClaimsData.filter(c => c.status === 'approved')}
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
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

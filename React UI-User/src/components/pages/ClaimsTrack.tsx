import { useState } from 'react';
import { Search, Eye, Download, FileText, Clock, CheckCircle, XCircle, AlertCircle, Phone, Mail, MapPin, Calendar, User, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface ClaimDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

interface ClaimTimeline {
  id: string;
  status: string;
  description: string;
  date: string;
  time: string;
  completed: boolean;
}

interface Claim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  type: 'health' | 'life' | 'car';
  status: 'submitted' | 'under-review' | 'approved' | 'rejected' | 'settled';
  claimAmount: number;
  approvedAmount?: number;
  submittedDate: string;
  lastUpdate: string;
  description: string;
  documents: ClaimDocument[];
  timeline: ClaimTimeline[];
  claimantName: string;
  claimantPhone: string;
  claimantEmail: string;
  assignedTo?: string;
}

// Mock Claims Data
const mockClaims: Claim[] = [
  {
    id: '1',
    claimNumber: 'CLM2024001',
    policyNumber: 'HLT/2024/001',
    type: 'health',
    status: 'under-review',
    claimAmount: 125000,
    submittedDate: '2024-10-01',
    lastUpdate: '2024-10-12',
    description: 'Hospitalization for appendectomy surgery',
    claimantName: 'Rajesh Kumar',
    claimantPhone: '+91 98765 43210',
    claimantEmail: 'rajesh.k@email.com',
    assignedTo: 'Dr. Priya Sharma',
    documents: [
      { id: 'd1', name: 'Hospital Bills.pdf', type: 'pdf', uploadDate: '2024-10-01', size: '2.4 MB' },
      { id: 'd2', name: 'Discharge Summary.pdf', type: 'pdf', uploadDate: '2024-10-01', size: '1.1 MB' },
      { id: 'd3', name: 'Medical Reports.pdf', type: 'pdf', uploadDate: '2024-10-01', size: '3.2 MB' }
    ],
    timeline: [
      { id: 't1', status: 'Submitted', description: 'Claim submitted successfully', date: '2024-10-01', time: '10:30 AM', completed: true },
      { id: 't2', status: 'Documents Verified', description: 'All documents verified and accepted', date: '2024-10-03', time: '02:15 PM', completed: true },
      { id: 't3', status: 'Under Review', description: 'Medical team reviewing the claim', date: '2024-10-05', time: '11:00 AM', completed: true },
      { id: 't4', status: 'Approval Pending', description: 'Awaiting final approval', date: '', time: '', completed: false },
      { id: 't5', status: 'Payment Processing', description: 'Claim payment will be processed', date: '', time: '', completed: false }
    ]
  },
  {
    id: '2',
    claimNumber: 'CLM2024002',
    policyNumber: 'CAR/2024/001',
    type: 'car',
    status: 'approved',
    claimAmount: 45000,
    approvedAmount: 42000,
    submittedDate: '2024-09-15',
    lastUpdate: '2024-10-10',
    description: 'Vehicle damage due to accident',
    claimantName: 'Anjali Mehta',
    claimantPhone: '+91 87654 32109',
    claimantEmail: 'anjali.mehta@email.com',
    assignedTo: 'Vikram Singh',
    documents: [
      { id: 'd4', name: 'Accident Photos.zip', type: 'zip', uploadDate: '2024-09-15', size: '8.7 MB' },
      { id: 'd5', name: 'FIR Copy.pdf', type: 'pdf', uploadDate: '2024-09-15', size: '0.8 MB' },
      { id: 'd6', name: 'Repair Estimate.pdf', type: 'pdf', uploadDate: '2024-09-16', size: '1.5 MB' }
    ],
    timeline: [
      { id: 't6', status: 'Submitted', description: 'Claim submitted successfully', date: '2024-09-15', time: '03:45 PM', completed: true },
      { id: 't7', status: 'Documents Verified', description: 'All documents verified', date: '2024-09-17', time: '10:20 AM', completed: true },
      { id: 't8', status: 'Survey Completed', description: 'Vehicle inspection completed', date: '2024-09-20', time: '04:30 PM', completed: true },
      { id: 't9', status: 'Approved', description: 'Claim approved for ₹42,000', date: '2024-10-10', time: '11:15 AM', completed: true },
      { id: 't10', status: 'Payment Processing', description: 'Payment will be processed in 3-5 days', date: '', time: '', completed: false }
    ]
  },
  {
    id: '3',
    claimNumber: 'CLM2024003',
    policyNumber: 'HLT/2024/002',
    type: 'health',
    status: 'settled',
    claimAmount: 85000,
    approvedAmount: 85000,
    submittedDate: '2024-08-20',
    lastUpdate: '2024-09-05',
    description: 'Dental treatment and surgery',
    claimantName: 'Suresh Patel',
    claimantPhone: '+91 76543 21098',
    claimantEmail: 'suresh.p@email.com',
    documents: [
      { id: 'd7', name: 'Dental Bills.pdf', type: 'pdf', uploadDate: '2024-08-20', size: '1.9 MB' },
      { id: 'd8', name: 'Treatment Records.pdf', type: 'pdf', uploadDate: '2024-08-20', size: '2.1 MB' }
    ],
    timeline: [
      { id: 't11', status: 'Submitted', description: 'Claim submitted successfully', date: '2024-08-20', time: '09:00 AM', completed: true },
      { id: 't12', status: 'Documents Verified', description: 'All documents verified', date: '2024-08-22', time: '01:30 PM', completed: true },
      { id: 't13', status: 'Approved', description: 'Claim approved for full amount', date: '2024-08-28', time: '10:00 AM', completed: true },
      { id: 't14', status: 'Payment Processed', description: 'Payment transferred to account', date: '2024-09-02', time: '03:00 PM', completed: true },
      { id: 't15', status: 'Settled', description: 'Claim settled successfully', date: '2024-09-05', time: '12:00 PM', completed: true }
    ]
  }
];

export default function ClaimsTrack() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'settled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="w-5 h-5" />;
      case 'under-review': return <AlertCircle className="w-5 h-5" />;
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      case 'settled': return <CheckCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'health': return 'bg-blue-500';
      case 'life': return 'bg-purple-500';
      case 'car': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSearch = () => {
    if (!searchQuery) {
      toast.error('Please enter a claim number');
      return;
    }
    const claim = mockClaims.find(c => c.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    if (claim) {
      setSelectedClaim(claim);
      setShowDetails(true);
      toast.success('Claim found!');
    } else {
      toast.error('Claim not found. Please check the claim number.');
    }
  };

  const handleViewDetails = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowDetails(true);
  };

  const filteredClaims = searchQuery
    ? mockClaims.filter(claim => 
        claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.policyNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockClaims;

  return (
    <div className="pt-[70px] min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-cyan-600 text-white py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl mb-3">Track Your Claims</h1>
            <p className="text-xl text-blue-100">Monitor the status of your insurance claims in real-time</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter Claim Number or Policy Number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-12"
                />
              </div>
              <Button onClick={handleSearch} className="h-12 bg-gradient-to-r from-primary to-cyan-600">
                <Search className="w-5 h-5 mr-2" />
                Search Claim
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Claims List */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Claims</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="settled">Settled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredClaims.map((claim) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(claim)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 ${getTypeColor(claim.type)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                          {claim.type === 'health' && <FileText className="w-6 h-6" />}
                          {claim.type === 'life' && <User className="w-6 h-6" />}
                          {claim.type === 'car' && <FileText className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="truncate">{claim.claimNumber}</h3>
                            <Badge variant="secondary" className={getStatusColor(claim.status)}>
                              {claim.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Policy: {claim.policyNumber}</p>
                          <p className="text-sm text-gray-600 mb-2">{claim.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Submitted: {new Date(claim.submittedDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Updated: {new Date(claim.lastUpdate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-muted-foreground mb-1">Claim Amount</p>
                        <p className="text-2xl font-bold text-primary">₹{claim.claimAmount.toLocaleString()}</p>
                        {claim.approvedAmount && (
                          <p className="text-sm text-green-600 mt-1">
                            Approved: ₹{claim.approvedAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getStatusIcon(claim.status)}
                        <span>
                          {claim.status === 'under-review' && 'Being reviewed by our team'}
                          {claim.status === 'approved' && 'Approved - Payment processing'}
                          {claim.status === 'settled' && 'Claim settled successfully'}
                          {claim.status === 'submitted' && 'Documents under verification'}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredClaims.filter(c => c.status === 'submitted' || c.status === 'under-review').map((claim) => (
              <Card key={claim.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(claim)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="mb-2">{claim.claimNumber}</h3>
                      <Badge className={getStatusColor(claim.status)}>
                        {claim.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-primary">₹{claim.claimAmount.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {filteredClaims.filter(c => c.status === 'approved').map((claim) => (
              <Card key={claim.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(claim)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="mb-2">{claim.claimNumber}</h3>
                      <Badge className={getStatusColor(claim.status)}>APPROVED</Badge>
                    </div>
                    <p className="text-2xl font-bold text-green-600">₹{claim.approvedAmount?.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settled" className="space-y-4">
            {filteredClaims.filter(c => c.status === 'settled').map((claim) => (
              <Card key={claim.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(claim)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="mb-2">{claim.claimNumber}</h3>
                      <Badge className={getStatusColor(claim.status)}>SETTLED</Badge>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">₹{claim.approvedAmount?.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-primary flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2">Need Help with Your Claim?</p>
                <div className="space-y-1">
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call our 24/7 helpline: <strong>1800-123-4567</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email: <strong>claims@akshronix.com</strong>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claim Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedClaim && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedClaim.claimNumber}</DialogTitle>
                    <DialogDescription>Policy: {selectedClaim.policyNumber}</DialogDescription>
                  </div>
                  <Badge className={getStatusColor(selectedClaim.status)}>
                    {selectedClaim.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Claim Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Claim Amount</p>
                      <p className="text-2xl font-bold text-primary">₹{selectedClaim.claimAmount.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  {selectedClaim.approvedAmount && (
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Approved Amount</p>
                        <p className="text-2xl font-bold text-green-600">₹{selectedClaim.approvedAmount.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  )}
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Submitted On</p>
                      <p className="text-xl font-bold">{new Date(selectedClaim.submittedDate).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="mb-4">Claim Progress</h3>
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-6">
                      {selectedClaim.timeline.map((item, idx) => (
                        <div key={item.id} className="relative flex gap-4">
                          <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                            item.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`}>
                            {item.completed ? (
                              <CheckCircle className="w-6 h-6 text-white" />
                            ) : (
                              <Clock className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className={item.completed ? '' : 'text-muted-foreground'}>{item.status}</h4>
                              {item.date && (
                                <span className="text-sm text-muted-foreground">{item.date} • {item.time}</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Claimant Info */}
                <div>
                  <h3 className="mb-4">Claimant Information</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedClaim.claimantName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedClaim.claimantPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedClaim.claimantEmail}</span>
                        </div>
                        {selectedClaim.assignedTo && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>Assigned to: {selectedClaim.assignedTo}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="mb-4">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {selectedClaim.documents.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Uploaded on {doc.uploadDate} • {doc.size}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1" variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button className="flex-1" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

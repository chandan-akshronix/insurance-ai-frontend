import { useState, useEffect } from 'react';
import { Search, Eye, Download, FileText, Clock, CheckCircle, XCircle, AlertCircle, Phone, Mail, MapPin, Calendar, User, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../contexts/AuthContext';
import { getUserClaimApplications, getClaimApplicationById } from '../../services/api';

interface ClaimDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  category?: string;  // Document category (e.g., "death-certificate", "claim-form")
  url?: string;       // Document URL
  documentId?: number | string; // SQL document ID
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

// Helper function to transform MongoDB claim application to Claim interface
const transformClaimApplication = (app: any): Claim => {
  const claimAmount = app.estimated_amount || app.hospitalization_details?.estimated_amount || 
                      app.accident_details?.estimated_repair_cost || 
                      app.death_details?.amount || 0;
  
  const submittedDate = app.created_at ? new Date(app.created_at).toISOString().split('T')[0] : 
                        new Date().toISOString().split('T')[0];
  const lastUpdate = app.updated_at ? new Date(app.updated_at).toISOString().split('T')[0] : 
                     submittedDate;
  
  // Get description from incident or type-specific details
  const description = app.incident_details?.incident_description || 
                     app.hospitalization_details?.ailment ||
                     app.accident_details?.accident_type ||
                     app.death_details?.cause_of_death ||
                     `${app.claim_type} claim`;
  
  // Transform documents - extract from MongoDB structure
  // Handles both old structure (without category) and new structure (with category)
  const documents: ClaimDocument[] = (app.documents || []).map((doc: any, idx: number) => {
    // MongoDB stores: {filename, url, documentId, docType, category}
    // Map to UI structure: {id, name, type, uploadDate, size, category, url, documentId}
    // Backward compatible: handles documents without category field
    const category = doc.category || undefined;
    
    // Log for debugging backward compatibility
    if (!category && doc.url) {
      console.debug(`[CLAIMS_TRACK] Document ${idx + 1} has no category (backward compatible):`, doc.filename || doc.name);
    }
    
    return {
      id: doc.documentId?.toString() || doc.id || `d${idx}`,
      name: doc.filename || doc.name || 'Document',
      type: doc.docType || doc.type || 'pdf',
      uploadDate: doc.uploadDate || doc.upload_date || submittedDate,
      size: doc.size || doc.fileSize || 'N/A',
      category: category,  // Document category for folder organization (optional for backward compatibility)
      url: doc.url || doc.documentUrl || undefined,  // Document URL (works for both old and new structure)
      documentId: doc.documentId || doc.id || undefined  // SQL document ID
    };
  });
  
  // Create basic timeline from status
  const timeline: ClaimTimeline[] = [
    {
      id: 't1',
      status: 'Submitted',
      description: 'Claim submitted successfully',
      date: submittedDate,
      time: new Date(app.created_at || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      completed: true
    }
  ];
  
  // Add timeline based on status
  if (app.status === 'approved' || app.status === 'settled') {
    timeline.push({
      id: 't2',
      status: 'Documents Verified',
      description: 'All documents verified',
      date: submittedDate,
      time: '',
      completed: true
    });
    timeline.push({
      id: 't3',
      status: 'Approved',
      description: app.status === 'settled' ? 'Claim settled successfully' : 'Claim approved',
      date: lastUpdate,
      time: '',
      completed: true
    });
  } else if (app.status === 'under-review' || app.status === 'submitted') {
    timeline.push({
      id: 't2',
      status: 'Under Review',
      description: 'Documents under review',
      date: '',
      time: '',
      completed: false
    });
  }
  
  return {
    id: app._id || app.id || '',
    claimNumber: `CLM${app.claim_type?.toUpperCase() || 'CLM'}${app._id?.substring(0, 8) || Date.now()}`,
    policyNumber: app.policy_id?.toString() || app.policy_number || 'N/A',
    type: (app.claim_type === 'health' ? 'health' : 
           app.claim_type === 'car' ? 'car' : 
           app.claim_type === 'life' ? 'life' : 'health') as 'health' | 'life' | 'car',
    status: (app.status === 'submitted' ? 'submitted' :
             app.status === 'approved' ? 'approved' :
             app.status === 'rejected' ? 'rejected' :
             app.status === 'settled' ? 'settled' :
             'under-review') as 'submitted' | 'under-review' | 'approved' | 'rejected' | 'settled',
    claimAmount: typeof claimAmount === 'string' ? parseFloat(claimAmount.replace(/[₹,]/g, '')) || 0 : (claimAmount || 0),
    approvedAmount: app.approved_amount || undefined,
    submittedDate,
    lastUpdate,
    description,
    documents,
    timeline,
    claimantName: app.claimant_info?.name || 'N/A',
    claimantPhone: app.claimant_info?.phone || 'N/A',
    claimantEmail: app.claimant_info?.email || 'N/A',
    assignedTo: app.assigned_to || undefined
  };
};

export default function ClaimsTrack() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch claims on component mount
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const userId = user?.id || localStorage.getItem('userId');
        
        if (!userId) {
          console.warn('No user ID available');
          setClaims([]);
          return;
        }

        const applications = await getUserClaimApplications(userId);
        
        // Transform MongoDB applications to Claim interface
        const transformedClaims = (Array.isArray(applications) ? applications : []).map(transformClaimApplication);
        setClaims(transformedClaims);
      } catch (error: any) {
        console.error('Error fetching claims:', error);
        toast.error('Failed to load claims. Please try again.');
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery) {
      toast.error('Please enter a claim number');
      return;
    }
    
    // Search in current claims
    const claim = claims.find(c => 
      c.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.policyNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (claim) {
      setSelectedClaim(claim);
      setShowDetails(true);
      toast.success('Claim found!');
    } else {
      // Try to fetch by ID if search by claim number fails
      try {
        // Extract ID from search query if it looks like an application ID
        const appId = searchQuery.trim();
        const application = await getClaimApplicationById(appId);
        if (application) {
          const transformedClaim = transformClaimApplication(application);
          setSelectedClaim(transformedClaim);
          setShowDetails(true);
          toast.success('Claim found!');
        } else {
          toast.error('Claim not found. Please check the claim number.');
        }
      } catch (error) {
        toast.error('Claim not found. Please check the claim number.');
      }
    }
  };

  const handleViewDetails = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowDetails(true);
  };

  const filteredClaims = searchQuery
    ? claims.filter(claim => 
        claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.policyNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : claims;

  if (loading) {
    return (
      <div className="pt-[70px] min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading claims...</p>
        </div>
      </div>
    );
  }

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
            <TabsTrigger value="all">All Claims ({claims.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({claims.filter(c => c.status === 'submitted' || c.status === 'under-review').length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({claims.filter(c => c.status === 'approved').length})</TabsTrigger>
            <TabsTrigger value="settled">Settled ({claims.filter(c => c.status === 'settled').length})</TabsTrigger>
          </TabsList>

          {filteredClaims.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Claims Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? 'No claims match your search. Please try a different search term.'
                    : "You haven't submitted any claims yet. Submit your first claim to track it here."}
                </p>
                {!searchQuery && (
                  <Button onClick={() => window.location.href = '/claims/submit'}>
                    Submit a Claim
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
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
            </>
          )}
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
                                  {doc.category ? (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                      {doc.category}
                                    </span>
                                  ) : (
                                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded" title="Document uses old folder structure (backward compatible)">
                                      Legacy
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {doc.url && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => window.open(doc.url, '_blank')}
                                  title="View document"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              {doc.url && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = doc.url!;
                                    link.download = doc.name;
                                    link.click();
                                  }}
                                  title="Download document"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
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

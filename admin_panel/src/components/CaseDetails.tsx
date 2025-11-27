import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, XCircle, FileText, Download, Activity, Brain, ArrowRight, Database, TrendingUp, ChevronDown, ChevronUp, User, Mail, Phone, Send } from 'lucide-react';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';

interface CaseDetailsProps {
  claimId: string;
  onBack: () => void;
}

const agentSteps = [
  { 
    id: 1, 
    name: 'Customer Submission', 
    status: 'completed', 
    timestamp: '2025-10-26 09:15:23',
    duration: '0.8s',
    confidence: 0.98,
    summary: 'Customer provided personal details, ID proof, income certificate, and medical reports. All required documents uploaded successfully.',
    input: [
      'Customer form data: Name, DOB, Address, Contact',
      '4 document files uploaded (ID, Income, Medical, Address)',
      'Digital signature captured'
    ],
    thinking: [
      'Validating all mandatory fields are present',
      'Checking document file formats and sizes',
      'Verifying digital signature authenticity',
      'Scanning for duplicate submissions in system'
    ],
    decision: {
      outcome: 'Accepted for processing',
      reasoning: 'All required documents uploaded successfully. No duplicate applications found. Digital signature verified. Ready for validation pipeline.',
      metrics: [
        { label: 'Documents Uploaded', value: '4/4', status: 'success' },
        { label: 'Form Completeness', value: '100%', status: 'success' },
        { label: 'Duplicate Check', value: 'Pass', status: 'success' }
      ]
    }
  },
  { 
    id: 2, 
    name: 'Data Validation', 
    status: 'completed', 
    timestamp: '2025-10-26 09:17:45',
    duration: '142s',
    confidence: 0.95,
    summary: 'OCR/NLP extracted data from documents. APIs verified identity and income. Output: Structured dataset with validation flags - all checks passed.',
    input: [
      'Scanned documents from submission',
      'Customer-provided form data',
      'External API endpoints (UIDAI, Income Tax Dept)'
    ],
    thinking: [
      'Running OCR on ID proof to extract Aadhaar number',
      'Parsing medical reports using NLP models',
      'Cross-referencing extracted data with form inputs',
      'Calling UIDAI API for identity verification',
      'Validating income certificate against IT records',
      'Calculating overall data consistency score'
    ],
    decision: {
      outcome: 'Data validated successfully',
      reasoning: 'OCR extraction achieved 95% confidence. Identity confirmed via UIDAI. Income verified through IT department API. All extracted fields match customer inputs within acceptable variance.',
      metrics: [
        { label: 'OCR Accuracy', value: '95%', status: 'success' },
        { label: 'Identity Match', value: '100%', status: 'success' },
        { label: 'Income Verified', value: 'Yes', status: 'success' },
        { label: 'Data Consistency', value: '98%', status: 'success' }
      ]
    }
  },
  { 
    id: 3, 
    name: 'Fraud Detection', 
    status: 'completed', 
    timestamp: '2025-10-26 09:23:12',
    duration: '327s',
    confidence: 0.89,
    summary: 'AI anomaly models analyzed application patterns. API checks completed. Output: Low fraud risk score (12%), no red flags detected.',
    input: [
      'Validated customer data',
      'Historical fraud patterns database',
      'IP address and device fingerprint',
      'Previous claims history'
    ],
    thinking: [
      'Analyzing application submission patterns',
      'Comparing against 50,000+ known fraud cases',
      'Checking for synthetic identity indicators',
      'Evaluating document authenticity scores',
      'Cross-checking blacklist databases',
      'Assessing behavioral anomaly scores',
      'Running ensemble fraud detection model'
    ],
    decision: {
      outcome: 'Low fraud risk detected',
      reasoning: 'Fraud risk score of 12% falls within acceptable range. No red flags in document authenticity checks. IP and device fingerprint show normal usage patterns. No matches found in fraud databases.',
      metrics: [
        { label: 'Fraud Risk Score', value: '12%', status: 'success' },
        { label: 'Document Authenticity', value: '96%', status: 'success' },
        { label: 'Blacklist Check', value: 'Clear', status: 'success' },
        { label: 'Behavioral Anomaly', value: 'None', status: 'success' }
      ]
    }
  },
  { 
    id: 4, 
    name: 'Risk Assessment', 
    status: 'completed', 
    timestamp: '2025-10-26 09:28:34',
    duration: '322s',
    confidence: 0.92,
    summary: 'AI model predicted claim probability: 8.2%, expected loss: ₹45,000. Risk band: Medium-Low. Health indicators within normal range.',
    input: [
      'Customer age: 34 years',
      'Medical history from reports',
      'Sum insured: ₹500,000',
      'Occupation: Software Engineer',
      'Lifestyle indicators from application'
    ],
    thinking: [
      'Loading actuarial risk model (trained on 2M+ policies)',
      'Analyzing age, gender, and occupation risk factors',
      'Evaluating pre-existing conditions from medical reports',
      'Calculating BMI and health score from provided data',
      'Assessing lifestyle risk factors (smoking, alcohol)',
      'Predicting claim probability using ML ensemble',
      'Estimating expected loss based on sum insured'
    ],
    decision: {
      outcome: 'Medium-Low risk band assigned',
      reasoning: 'Customer age and health profile fall within favorable range. No major pre-existing conditions detected. Occupation risk is low. Predicted claim probability of 8.2% with expected loss of ₹45,000 is within acceptable limits for standard underwriting.',
      metrics: [
        { label: 'Claim Probability', value: '8.2%', status: 'success' },
        { label: 'Expected Loss', value: '₹45,000', status: 'success' },
        { label: 'Risk Band', value: 'Medium-Low', status: 'success' },
        { label: 'Health Score', value: '84/100', status: 'success' }
      ]
    }
  },
  { 
    id: 5, 
    name: 'Premium Calculation', 
    status: 'completed', 
    timestamp: '2025-10-26 09:32:18',
    duration: '224s',
    confidence: 0.96,
    summary: 'Computed premium using base premium (₹12,000), risk loading (+₹2,400), no-claim discount (-₹1,200), compliance adjustments. Final premium: ₹13,200/year.',
    input: [
      'Base premium rate: ₹12,000',
      'Risk assessment output: Medium-Low',
      'Sum insured: ₹500,000',
      'Customer age and profile data',
      'Market rate tables and regulatory guidelines'
    ],
    thinking: [
      'Retrieving base premium for age group and sum insured',
      'Applying risk loading based on Medium-Low risk band (+20%)',
      'Checking eligibility for no-claim discount',
      'Calculating age-based adjustments',
      'Applying geographic zone multiplier',
      'Ensuring compliance with regulatory premium caps',
      'Computing final premium with all adjustments'
    ],
    decision: {
      outcome: 'Premium calculated at ₹13,200/year',
      reasoning: 'Base premium of ₹12,000 adjusted with risk loading (+₹2,400 for Medium-Low risk). No-claim discount not applicable for new policy. All regulatory caps verified. Premium is competitive with market rates and ensures profitability.',
      metrics: [
        { label: 'Base Premium', value: '₹12,000', status: 'info' },
        { label: 'Risk Loading', value: '+₹2,400', status: 'warning' },
        { label: 'Discounts', value: '-₹1,200', status: 'success' },
        { label: 'Final Premium', value: '₹13,200/year', status: 'success' }
      ]
    }
  },
  { 
    id: 6, 
    name: 'Decision Agent', 
    status: 'in_progress', 
    timestamp: '2025-10-26 09:35:42',
    duration: '18s (ongoing)',
    confidence: 0.87,
    summary: 'Evaluating application for auto-approval. All risk parameters within acceptable limits. Processing final decision...',
    input: [
      'All previous agent outputs',
      'Fraud risk: 12% (Low)',
      'Risk band: Medium-Low',
      'Premium: ₹13,200/year',
      'Auto-approval threshold rules'
    ],
    thinking: [
      'Validating all upstream agents completed successfully',
      'Checking fraud risk against auto-approval threshold (must be <15%)',
      'Evaluating risk band acceptability for auto-approval',
      'Verifying premium is within profitable range',
      'Cross-checking policy limits and regulatory compliance',
      'Assessing if manual review is required',
      'Computing final approval confidence score...'
    ],
    decision: {
      outcome: 'Processing decision...',
      reasoning: 'All risk parameters are within acceptable limits. Fraud risk of 12% is below the 15% threshold. Medium-Low risk band qualifies for auto-approval. Awaiting final compliance checks before issuing approval...',
      metrics: [
        { label: 'Auto-Approval Eligible', value: 'Yes', status: 'success' },
        { label: 'Compliance Check', value: 'In Progress', status: 'warning' },
        { label: 'Decision Confidence', value: '87%', status: 'success' },
        { label: 'Manual Review', value: 'Not Required', status: 'success' }
      ]
    }
  },
  { 
    id: 7, 
    name: 'Customer Notification', 
    status: 'pending', 
    timestamp: null,
    duration: null,
    confidence: null,
    summary: 'Awaiting decision completion. Will deliver policy approval, terms, and welcome package to customer via AI assistant.',
    input: [
      'Decision outcome (pending)',
      'Policy details and terms',
      'Customer contact preferences',
      'Notification templates'
    ],
    thinking: [
      'Awaiting Decision Agent completion',
      'Will prepare personalized notification',
      'Will generate policy documents',
      'Will schedule delivery via preferred channel'
    ],
    decision: {
      outcome: 'Awaiting upstream decision',
      reasoning: 'This step will execute once Decision Agent completes. The system will automatically generate and deliver policy approval notification with all necessary documents.',
      metrics: [
        { label: 'Status', value: 'Pending', status: 'warning' },
        { label: 'Dependencies', value: 'Decision Agent', status: 'warning' }
      ]
    }
  },
];

const documents = [
  { id: 1, name: 'ID Proof (Aadhaar Card)', status: 'verified', mismatch: false },
  { id: 2, name: 'Income Certificate', status: 'verified', mismatch: false },
  { id: 3, name: 'Medical Report', status: 'verified', mismatch: false },
  { id: 4, name: 'Address Proof', status: 'verified', mismatch: false },
];

const auditEntries = [
  { time: '09:35:42', agent: 'Decision Agent', action: 'Started final decision evaluation' },
  { time: '09:32:18', agent: 'Premium Calc', action: 'Final premium calculated: ₹13,200/year with breakdowns' },
  { time: '09:28:34', agent: 'Risk Assessment', action: 'Risk band assigned: Medium-Low, Expected loss: ₹45,000' },
  { time: '09:28:15', agent: 'Risk Assessment', action: 'Claim probability predicted: 8.2%' },
  { time: '09:23:12', agent: 'Fraud Detection', action: 'Fraud risk score calculated: 12% (Low risk)' },
  { time: '09:21:45', agent: 'Data Validation', action: 'Identity and income verified via API checks' },
  { time: '09:17:45', agent: 'Data Validation', action: 'OCR extraction completed with 95% confidence' },
  { time: '09:15:23', agent: 'Customer', action: 'Application submitted with all required documents' },
];

const seniorReviewers = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    role: 'Senior Underwriting Manager',
    department: 'Health Insurance Division',
    email: 'priya.sharma@insurance.com',
    phone: '+91 98765 43210',
    availability: 'Available',
    caseLoad: '12 cases',
  },
  {
    id: 2,
    name: 'Amit Patel',
    role: 'Chief Underwriter',
    department: 'Risk Assessment',
    email: 'amit.patel@insurance.com',
    phone: '+91 98765 43211',
    availability: 'Available',
    caseLoad: '8 cases',
  },
  {
    id: 3,
    name: 'Meera Reddy',
    role: 'Senior Risk Analyst',
    department: 'Fraud & Compliance',
    email: 'meera.reddy@insurance.com',
    phone: '+91 98765 43212',
    availability: 'In Meeting',
    caseLoad: '15 cases',
  },
];

const availableDocuments = [
  { id: 'medical', label: 'Additional Medical Reports', description: 'Recent health check-up or specialist consultation reports' },
  { id: 'income', label: 'Updated Income Proof', description: 'Latest salary slips or tax returns' },
  { id: 'identity', label: 'Secondary Identity Proof', description: 'Passport, Driving License, or Voter ID' },
  { id: 'address', label: 'Address Verification', description: 'Utility bills or rental agreement' },
  { id: 'nominee', label: 'Nominee Details & KYC', description: 'Nominee identification and relationship proof' },
  { id: 'employment', label: 'Employment Verification', description: 'Company ID card or employment letter' },
  { id: 'previous', label: 'Previous Insurance History', description: 'Claims history from previous insurers' },
  { id: 'lifestyle', label: 'Lifestyle Declaration', description: 'Smoking/drinking habits questionnaire' },
];

export function CaseDetails({ claimId, onBack }: CaseDetailsProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(6); // In-progress step is expanded by default
  const [expandAll, setExpandAll] = useState(false);
  const [showActionBar, setShowActionBar] = useState(true);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [showRequestDocsDialog, setShowRequestDocsDialog] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState<string>('');
  const [escalationReason, setEscalationReason] = useState('');
  const [requestedDocs, setRequestedDocs] = useState<Set<string>>(new Set());
  const [requestReason, setRequestReason] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [hasDocumentRequest, setHasDocumentRequest] = useState(false);
  const [escalatedTo, setEscalatedTo] = useState<string>('');
  const [requestedDocsList, setRequestedDocsList] = useState<string[]>([]);
  
  // State for collapsible sections within each step
  const [expandedSections, setExpandedSections] = useState<{
    [stepId: number]: {
      inputData: boolean;
      agentAnalysis: boolean;
      decision: boolean;
    }
  }>({});

  const toggleStep = (stepId: number) => {
    // If clicking the same step, collapse it; otherwise, expand the new step
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };
  
  const toggleSection = (stepId: number, section: 'inputData' | 'agentAnalysis' | 'decision') => {
    setExpandedSections(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [section]: !prev[stepId]?.[section]
      }
    }));
  };
  
  const isSectionExpanded = (stepId: number, section: 'inputData' | 'agentAnalysis' | 'decision') => {
    return expandedSections[stepId]?.[section] || false;
  };

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedStep(null);
    } else {
      setExpandedStep(agentSteps[0]?.id || null);
    }
    setExpandAll(!expandAll);
  };

  const handleAction = (action: string) => {
    if (action === 'Escalate to Senior') {
      setShowEscalateDialog(true);
    } else if (action === 'Request Documents') {
      setShowRequestDocsDialog(true);
    } else {
      alert(`Action: ${action} - This would be integrated with your backend`);
    }
  };

  const handleEscalate = () => {
    if (!selectedReviewer || !escalationReason.trim()) {
      toast.error('Please select a reviewer and provide a reason for escalation');
      return;
    }
    const reviewer = seniorReviewers.find(r => r.id.toString() === selectedReviewer);
    
    // Set escalation state
    setIsEscalated(true);
    setEscalatedTo(reviewer?.name || '');
    
    // Show success toast
    toast.success('Application Escalated Successfully', {
      description: `Case ${claimId} has been escalated to ${reviewer?.name}. They will be notified immediately.`,
      duration: 5000,
    });
    
    // Close dialog and reset form
    setShowEscalateDialog(false);
    setSelectedReviewer('');
    setEscalationReason('');
  };

  const handleRequestDocs = () => {
    if (requestedDocs.size === 0 || !requestReason.trim()) {
      toast.error('Please select at least one document and provide a reason');
      return;
    }
    
    const docNames = Array.from(requestedDocs).map(id => 
      availableDocuments.find(d => d.id === id)?.label
    ).filter(Boolean) as string[];
    
    // Set document request state
    setHasDocumentRequest(true);
    setRequestedDocsList(docNames);
    
    // Show success toast
    toast.success('Document Request Sent', {
      description: `Request for ${docNames.length} document${docNames.length > 1 ? 's' : ''} has been sent to the customer via email and SMS.`,
      duration: 5000,
    });
    
    // Close dialog and reset form
    setShowRequestDocsDialog(false);
    setRequestedDocs(new Set());
    setRequestReason('');
  };

  const toggleDocument = (docId: string) => {
    const newDocs = new Set(requestedDocs);
    if (newDocs.has(docId)) {
      newDocs.delete(docId);
    } else {
      newDocs.add(docId);
    }
    setRequestedDocs(newDocs);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-6 h-6 text-blue-600 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-gray-300" />;
      default:
        return <XCircle className="w-6 h-6 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'in_progress':
        return 'border-blue-500 bg-blue-50';
      case 'warning':
        return 'border-orange-500 bg-orange-50';
      case 'pending':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-red-500 bg-red-50';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'bg-green-100 text-green-700 border-0',
      in_progress: 'bg-blue-100 text-blue-700 border-0',
      warning: 'bg-orange-100 text-orange-700 border-0',
      pending: 'bg-gray-100 text-gray-700',
    };
    return variants[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-10 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl mb-2">Application: {claimId}</h1>
            <p className="text-gray-600 text-lg">Complete underwriting workflow and decision trail</p>
          </div>
          <Badge className="bg-blue-100 text-blue-700 border-0 px-6 py-3 text-base">
            ⏳ Processing
          </Badge>
        </div>
      </div>

      {/* Header Info Card - Cleaner, More Spacious */}
      <Card className="mb-8 border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Customer</p>
              <p className="text-lg">Rajesh Kumar</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Policy Type</p>
              <p className="text-lg">Health Insurance</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Sum Insured</p>
              <p className="text-lg">₹500,000</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Fraud Risk</p>
              <Badge className="bg-green-100 text-green-700 border-0 text-base px-4 py-1">Low (12%)</Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Application Date</p>
              <p className="text-lg">Oct 26, 2025</p>
            </div>
          </div>

          {/* Action Status Indicators */}
          {(isEscalated || hasDocumentRequest) && (
            <>
              <Separator className="my-6" />
              <div className="flex flex-wrap gap-3">
                {isEscalated && (
                  <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm">Escalated to {escalatedTo}</p>
                      <p className="text-xs text-gray-600">Case assigned to senior reviewer</p>
                    </div>
                  </div>
                )}
                {hasDocumentRequest && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm">Documents Requested</p>
                      <p className="text-xs text-gray-600">Waiting for {requestedDocsList.length} document{requestedDocsList.length > 1 ? 's' : ''} from customer</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timeline">Agent Timeline</TabsTrigger>
          <TabsTrigger value="documents">Document Verification</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Underwriting Process Tracking</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Real-time AI agent execution monitoring</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExpandAll}
                    className="text-sm"
                  >
                    {expandAll ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Collapse All
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Expand All
                      </>
                    )}
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span>Live Monitoring</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Horizontal Process Tracking Timeline */}
              <div className="mb-8">
                <div className="flex items-start justify-between gap-2">
                  {agentSteps.map((step, index) => {
                    const isExpanded = expandedStep === step.id;
                    
                    return (
                      <div key={step.id} className="flex items-start flex-1">
                        {/* Stage Card */}
                        <button
                          onClick={() => toggleStep(step.id)}
                          className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 w-full ${
                            isExpanded 
                              ? `${getStatusColor(step.status)} shadow-lg scale-105` 
                              : `border-gray-200 bg-white hover:shadow-md`
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                            isExpanded ? 'ring-4 ring-white' : ''
                          } ${getStatusColor(step.status)}`}>
                            {getStatusIcon(step.status)}
                          </div>
                          <div className="text-center">
                            <p className={`text-xs mb-1 ${isExpanded ? '' : 'text-gray-900'}`}>
                              {step.name}
                            </p>
                            <Badge className={`text-xs ${getStatusBadge(step.status)} border-0`}>
                              {step.status === 'in_progress' ? 'In Progress' :
                               step.status === 'completed' ? 'Completed' :
                               'Pending'}
                            </Badge>
                          </div>
                        </button>
                        
                        {/* Arrow Connector */}
                        {index < agentSteps.length - 1 && (
                          <div className="flex items-center justify-center px-1 pt-8">
                            <ArrowRight className={`w-5 h-5 ${
                              step.status === 'completed' ? 'text-green-400' : 'text-gray-300'
                            }`} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expanded Stage Details */}
              {expandedStep !== null && (
                <div className="space-y-6">
                  {agentSteps.filter(step => step.id === expandedStep).map(step => (
                    <div key={step.id} className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-200 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-xl">{step.name}</p>
                            <Badge className={`${getStatusBadge(step.status)} px-3 py-1`}>
                              {step.status === 'in_progress' ? 'In Progress' : step.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            {step.timestamp && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {step.timestamp}
                              </span>
                            )}
                            {step.duration && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Duration: {step.duration}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{step.summary}</p>
                        </div>
                        
                        {/* Confidence Score */}
                        {step.confidence !== null && (
                          <div className="flex flex-col items-center ml-4">
                            <div className="relative w-20 h-20">
                              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="15.5"
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="2"
                                />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="15.5"
                                  fill="none"
                                  stroke={step.confidence >= 0.9 ? '#10b981' : step.confidence >= 0.7 ? '#3b82f6' : step.confidence >= 0.5 ? '#f59e0b' : '#ef4444'}
                                  strokeWidth="2.5"
                                  strokeDasharray={`${step.confidence * 97.4}, 97.4`}
                                  strokeLinecap="round"
                                  className="transition-all duration-1000"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl">{(step.confidence * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">Confidence</span>
                          </div>
                        )}
                      </div>

                      {/* Details Sections */}
                      <div className="space-y-3 mt-4">
                        {/* Input Data Section - Collapsible */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleSection(step.id, 'inputData')}
                            className="w-full flex items-center justify-between p-4 hover:bg-blue-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-blue-900">Input Data</span>
                            </div>
                            {isSectionExpanded(step.id, 'inputData') ? (
                              <ChevronUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                          {isSectionExpanded(step.id, 'inputData') && (
                            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                              <ul className="space-y-1 text-sm text-gray-700">
                                {step.input.map((input, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>{input}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Agent Analysis Section - Collapsible */}
                        <div className={`${step.status === 'in_progress' ? 'bg-blue-50 border-blue-300' : 'bg-purple-50 border-purple-200'} border rounded-lg overflow-hidden`}>
                          <button
                            onClick={() => toggleSection(step.id, 'agentAnalysis')}
                            className={`w-full flex items-center justify-between p-4 transition-colors ${
                              step.status === 'in_progress' ? 'hover:bg-blue-100' : 'hover:bg-purple-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Brain className={`w-4 h-4 ${step.status === 'in_progress' ? 'text-blue-600' : 'text-purple-600'}`} />
                              <span className={`text-sm ${step.status === 'in_progress' ? 'text-blue-900' : 'text-purple-900'}`}>
                                {step.status === 'in_progress' ? 'Agent Processing...' : 'Agent Analysis'}
                              </span>
                            </div>
                            {isSectionExpanded(step.id, 'agentAnalysis') ? (
                              <ChevronUp className={`w-4 h-4 ${step.status === 'in_progress' ? 'text-blue-600' : 'text-purple-600'}`} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${step.status === 'in_progress' ? 'text-blue-600' : 'text-purple-600'}`} />
                            )}
                          </button>
                          {isSectionExpanded(step.id, 'agentAnalysis') && (
                            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                              <ul className="space-y-1.5 text-sm text-gray-700">
                                {step.thinking.map((thought, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className={`${step.status === 'in_progress' ? 'text-blue-600' : 'text-purple-600'} mt-1`}>▸</span>
                                    <span>{thought}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Decision & Output Section - Collapsible */}
                        <div className={`${
                          step.status === 'completed' ? 'bg-green-50 border-green-200' : 
                          step.status === 'in_progress' ? 'bg-yellow-50 border-yellow-200' : 
                          'bg-gray-50 border-gray-200'
                        } border rounded-lg overflow-hidden`}>
                          <button
                            onClick={() => toggleSection(step.id, 'decision')}
                            className={`w-full flex items-center justify-between p-4 transition-colors ${
                              step.status === 'completed' ? 'hover:bg-green-100' : 
                              step.status === 'in_progress' ? 'hover:bg-yellow-100' : 
                              'hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ArrowRight className={`w-4 h-4 ${
                                step.status === 'completed' ? 'text-green-600' : 
                                step.status === 'in_progress' ? 'text-yellow-600' : 
                                'text-gray-600'
                              }`} />
                              <span className={`text-sm ${
                                step.status === 'completed' ? 'text-green-900' : 
                                step.status === 'in_progress' ? 'text-yellow-900' : 
                                'text-gray-900'
                              }`}>
                                Decision & Output
                              </span>
                            </div>
                            {isSectionExpanded(step.id, 'decision') ? (
                              <ChevronUp className={`w-4 h-4 ${
                                step.status === 'completed' ? 'text-green-600' : 
                                step.status === 'in_progress' ? 'text-yellow-600' : 
                                'text-gray-600'
                              }`} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${
                                step.status === 'completed' ? 'text-green-600' : 
                                step.status === 'in_progress' ? 'text-yellow-600' : 
                                'text-gray-600'
                              }`} />
                            )}
                          </button>
                          {isSectionExpanded(step.id, 'decision') && (
                            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                              <div className="mb-3">
                                <p className="text-sm mb-1">
                                  <span className="text-gray-600">Outcome:</span> <span>{step.decision.outcome}</span>
                                </p>
                                <p className="text-sm text-gray-700">{step.decision.reasoning}</p>
                              </div>
                              
                              {/* Metrics Grid */}
                              <div className="grid grid-cols-2 gap-2">
                                {step.decision.metrics.map((metric, idx) => (
                                  <div key={idx} className="bg-white rounded-lg p-3 border">
                                    <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm">{metric.value}</p>
                                      {metric.status === 'success' && <CheckCircle className="w-3 h-3 text-green-600" />}
                                      {metric.status === 'warning' && <Clock className="w-3 h-3 text-yellow-600" />}
                                      {metric.status === 'info' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Verification Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p>{doc.name}</p>
                          {doc.mismatch && (
                            <p className="text-sm text-orange-600 mt-1">
                              ⚠ OCR data mismatch detected
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={doc.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="bg-gray-100 h-32 rounded flex items-center justify-center text-gray-400">
                      Document Preview
                    </div>
                    <Button variant="outline" className="w-full mt-3" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail (MCP Decision Trace)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {auditEntries.map((entry, index) => (
                  <div key={index}>
                    <div className="flex gap-4 py-3">
                      <span className="text-sm text-gray-500 w-20">{entry.time}</span>
                      <span className="text-sm text-blue-600 w-32">{entry.agent}</span>
                      <span className="text-sm flex-1">{entry.action}</span>
                    </div>
                    {index < auditEntries.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky Floating Action Bar */}
      {showActionBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-200 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto px-10 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm">Application {claimId}</p>
                  <p className="text-xs text-gray-500">Ready for review - All checks completed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAction('Request Documents')}
                  className="h-10"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Request Docs
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAction('Escalate to Senior')}
                  className="h-10 border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Escalate
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleAction('Reject Application')}
                  className="h-10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 h-10 px-6"
                  onClick={() => handleAction('Approve Application')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Application
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowActionBar(false)}
                  className="ml-2"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Action Bar Button (when hidden) */}
      {!showActionBar && (
        <button
          onClick={() => setShowActionBar(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-50 animate-in zoom-in duration-200"
        >
          <Activity className="w-5 h-5" />
          <span>Show Actions</span>
        </button>
      )}

      {/* Bottom spacing to account for sticky bar */}
      <div className="h-24"></div>

      {/* Escalate Dialog */}
      <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Escalate Application to Senior Reviewer
            </DialogTitle>
            <DialogDescription>
              Select a senior reviewer and provide the reason for escalation. The case will be assigned to them immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Application Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm mb-1">
                <span className="text-gray-600">Application ID:</span> <span>{claimId}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Customer:</span> <span>Rajesh Kumar - Health Insurance (₹500,000)</span>
              </p>
            </div>

            {/* Select Senior Reviewer */}
            <div>
              <Label className="mb-3 block">Select Senior Reviewer</Label>
              <RadioGroup value={selectedReviewer} onValueChange={setSelectedReviewer}>
                <div className="space-y-3">
                  {seniorReviewers.map((reviewer) => (
                    <div key={reviewer.id} className="flex items-start space-x-3">
                      <RadioGroupItem value={reviewer.id.toString()} id={`reviewer-${reviewer.id}`} className="mt-1" />
                      <label htmlFor={`reviewer-${reviewer.id}`} className="flex-1 cursor-pointer">
                        <Card className={`border-2 transition-all ${selectedReviewer === reviewer.id.toString() ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{reviewer.name}</p>
                                  <p className="text-sm text-gray-600">{reviewer.role}</p>
                                </div>
                              </div>
                              <Badge className={reviewer.availability === 'Available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                {reviewer.availability}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span className="text-xs">{reviewer.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span className="text-xs">{reviewer.phone}</span>
                              </div>
                              <div className="text-xs">
                                <span className="text-gray-500">Department:</span> {reviewer.department}
                              </div>
                              <div className="text-xs">
                                <span className="text-gray-500">Current Load:</span> {reviewer.caseLoad}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Escalation Reason */}
            <div>
              <Label htmlFor="escalation-reason" className="mb-2 block">
                Reason for Escalation <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="escalation-reason"
                placeholder="Explain why this application requires senior review (e.g., complex medical history, high sum insured, unusual risk factors, policy violations...)"
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleEscalate}
            >
              <Send className="w-4 h-4 mr-2" />
              Escalate Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Documents Dialog */}
      <Dialog open={showRequestDocsDialog} onOpenChange={setShowRequestDocsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Request Additional Documents
            </DialogTitle>
            <DialogDescription>
              Select the documents you need from the customer. They will receive an email notification with clear instructions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Application Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm mb-1">
                <span className="text-gray-600">Customer:</span> <span>Rajesh Kumar</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Contact:</span> <span>rajesh.kumar@email.com | +91 98765 12345</span>
              </p>
            </div>

            {/* Document Selection */}
            <div>
              <Label className="mb-3 block">Select Required Documents <span className="text-red-500">*</span></Label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id={`doc-${doc.id}`}
                      checked={requestedDocs.has(doc.id)}
                      onCheckedChange={() => toggleDocument(doc.id)}
                      className="mt-1"
                    />
                    <label htmlFor={`doc-${doc.id}`} className="flex-1 cursor-pointer">
                      <p className="font-medium text-sm">{doc.label}</p>
                      <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                    </label>
                  </div>
                ))}
              </div>
              {requestedDocs.size > 0 && (
                <p className="text-sm text-blue-600 mt-2">
                  {requestedDocs.size} document{requestedDocs.size > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Request Reason */}
            <div>
              <Label htmlFor="request-reason" className="mb-2 block">
                Reason for Request <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="request-reason"
                placeholder="Explain why these documents are needed (e.g., verification purposes, incomplete information, risk assessment requirements...)"
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDocsDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleRequestDocs}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

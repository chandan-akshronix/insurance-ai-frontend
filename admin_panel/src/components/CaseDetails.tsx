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
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { ApplicationProcess, AgentStep } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface CaseDetailsProps {
  claimId: string;
  onBack: () => void;
}

// Mock data removed - fetching from API

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
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [auditEntries, setAuditEntries] = useState<any[]>([]);
  const [appDetails, setAppDetails] = useState<ApplicationProcess | null>(null);

  const [expandedStep, setExpandedStep] = useState<number | null>(6);
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

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/agent/application/${claimId}`);
        if (!response.ok) throw new Error('Failed to fetch application');
        const data: ApplicationProcess = await response.json();
        setAppDetails(data);

        // Populate agent steps from API
        // Populate agent steps from API with robust fallback
        let steps = [];
        if (Array.isArray(data.stepHistory) && data.stepHistory.length > 0) {
          steps = data.stepHistory;
        } else if (data.agentData && data.agentData.stepHistory) {
          // Handle case where it might be a JSON string in agentData
          try {
            steps = typeof data.agentData.stepHistory === 'string'
              ? JSON.parse(data.agentData.stepHistory)
              : data.agentData.stepHistory;
          } catch (e) {
            console.error("Error parsing nested stepHistory", e);
          }
        } else if (data.agentData && data.agentData.ui_visualization) {
          steps = data.agentData.ui_visualization;
        }

        if (steps.length > 0) {
          setAgentSteps(steps);
          // Auto-expand the last active step ONLY on initial load
          setExpandedStep((prev) => {
            if (prev === null) {
              return steps.find((s: any) => s.status === 'in_progress' || s.status === 'in-progress')?.id || steps.length;
            }
            return prev;
          });
        }

        // Mock documents for now, or extract from ingest_llm if available
        setDocuments([
          { id: 1, name: 'ID Proof (Aadhaar Card)', status: 'verified', mismatch: false },
          { id: 2, name: 'Income Certificate', status: 'verified', mismatch: false },
        ]);

        // Mock audit for now
        setAuditEntries([
          { time: new Date().toLocaleTimeString(), agent: 'System', action: `Loaded application ${claimId}` }
        ]);

      } catch (error) {
        console.error("Error fetching case details:", error);
      }
    };

    fetchDetails();
    const interval = setInterval(fetchDetails, 5000); // Live poll for agent updates
    return () => clearInterval(interval);
  }, [claimId]);

  // State for collapsible sections within each step
  const [expandedSections, setExpandedSections] = useState<{
    [stepId: number]: {
      inputData: boolean;
      agentAnalysis: boolean;
      decision: boolean;
    }
  }>({});

  // Helper to format agent thinking logs with colors
  const formatThinking = (text: string) => {
    // Keywords for styling
    const successKeywords = ['Exact Match', 'Matched', 'Verified', 'Normal', 'Safe', 'Approve', 'Accept', 'Success'];
    const warningKeywords = ['Partial', 'Overweight', 'Manual Review'];
    const dangerKeywords = ['Mismatch', 'Obese', 'High Risk', 'Decline', 'Reject', 'Critical', 'Missing'];

    let formattedText: React.ReactNode = text;

    // Check for calculation pattern (contains =)
    if (text.includes('=')) {
      return <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-700 font-semibold">{text}</code>;
    }

    // Keyword highlighting (simple replacement logic for React)
    const parts = text.split(new RegExp(`(${[...successKeywords, ...warningKeywords, ...dangerKeywords].join('|')})`, 'g'));

    return (
      <span>
        {parts.map((part, i) => {
          if (successKeywords.includes(part)) return <span key={i} className="text-green-600 font-bold">{part}</span>;
          if (warningKeywords.includes(part)) return <span key={i} className="text-yellow-600 font-bold">{part}</span>;
          if (dangerKeywords.includes(part)) return <span key={i} className="text-red-600 font-bold">{part}</span>;
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const toggleStep = (stepId: number) => {
    // If clicking the same step, collapse it; otherwise, expand the new step
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const toggleSection = (stepId: number, section: 'inputData' | 'agentAnalysis' | 'decision') => {
    setExpandedSections((prev: any) => ({
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

  const handleAction = async (action: string) => {
    if (action === 'Escalate to Senior') {
      setShowEscalateDialog(true);
    } else if (action === 'Request Documents') {
      setShowRequestDocsDialog(true);
    } else if (action === 'Approve Application') {
      await handleActionSubmit('approve', 'Manual approval via Admin Panel');
    } else if (action === 'Reject Application') {
      await handleActionSubmit('reject', 'Manual rejection via Admin Panel');
    } else {
      toast.error(`Unknown action: ${action}`);
    }
  };

  const handleActionSubmit = async (action: string, reason: string) => {
    try {
      const endpoint = `${API_BASE_URL}/agent/review`;
      const payload = {
        application_id: claimId,
        action: action,
        reason: reason
      };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        toast.success(`Action '${action}' submitted successfully`);
        onBack();
      } else {
        toast.error('Failed to submit action');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(`Error submitting action: ${e.message}`);
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

    // Call Backend
    handleActionSubmit('escalate', `Escalated to ${reviewer?.name}. Reason: ${escalationReason}`);
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

    // Call Backend
    handleActionSubmit('request_docs', `Requested: ${docNames.join(', ')}. Reason: ${requestReason}`);
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
                  {agentSteps.map((step: AgentStep, index: number) => {
                    const isExpanded = expandedStep === step.id;

                    return (
                      <div key={step.id} className="flex items-start flex-1">
                        {/* Stage Card */}
                        <button
                          onClick={() => toggleStep(step.id)}
                          className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 w-full ${isExpanded
                            ? `${getStatusColor(step.status)} shadow-lg scale-105`
                            : `border-gray-200 bg-white hover:shadow-md`
                            }`}
                        >
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isExpanded ? 'ring-4 ring-white' : ''
                            } ${getStatusColor(step.status)}`}>
                            {getStatusIcon(step.status)}
                          </div>
                          <div className="text-center">
                            <p className={`text-xs mb-1 ${isExpanded ? '' : 'text-gray-900'}`}>
                              {step.name}
                            </p>
                            <Badge className={`text-xs ${getStatusBadge(step.status)} border-0`}>
                              {step.status === 'in_progress' || step.status === 'in-progress' ? 'In Progress' :
                                step.status === 'completed' ? 'Completed' :
                                  'Pending'}
                            </Badge>
                          </div>
                        </button>

                        {/* Arrow Connector */}
                        {index < agentSteps.length - 1 && (
                          <div className="flex items-center justify-center px-1 pt-8">
                            <ArrowRight className={`w-5 h-5 ${step.status === 'completed' ? 'text-green-400' : 'text-gray-300'
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
                  {agentSteps.filter(step => step.id === expandedStep).map((step: AgentStep) => (
                    <div key={step.id} className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-200 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-xl">{step.name}</p>
                            <Badge className={`${getStatusBadge(step.status)} px-3 py-1`}>
                              {step.status === 'in_progress' || step.status === 'in-progress' ? 'In Progress' : step.status.replace('_', ' ')}
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
                                  stroke={(step.confidence || 0) >= 0.9 ? '#10b981' : (step.confidence || 0) >= 0.7 ? '#3b82f6' : (step.confidence || 0) >= 0.5 ? '#f59e0b' : '#ef4444'}
                                  strokeWidth="2.5"
                                  strokeDasharray={`${(step.confidence || 0) * 97.4}, 97.4`}
                                  strokeLinecap="round"
                                  className="transition-all duration-1000"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl">{((step.confidence || 0) * 100).toFixed(0)}%</span>
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
                                {step.input?.map((input: string, idx: number) => (
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
                        <div className={`${step.status === 'in_progress' || step.status === 'in-progress' ? 'bg-blue-50 border-blue-300' : 'bg-purple-50 border-purple-200'} border rounded-lg overflow-hidden`}>
                          <button
                            onClick={() => toggleSection(step.id, 'agentAnalysis')}
                            className={`w-full flex items-center justify-between p-4 transition-colors ${step.status === 'in_progress' || step.status === 'in-progress' ? 'hover:bg-blue-100' : 'hover:bg-purple-100'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <Brain className={`w-4 h-4 ${step.status === 'in_progress' || step.status === 'in-progress' ? 'text-blue-600' : 'text-purple-600'}`} />
                              <span className={`text-sm ${step.status === 'in_progress' || step.status === 'in-progress' ? 'text-blue-900' : 'text-purple-900'}`}>
                                {step.status === 'in_progress' || step.status === 'in-progress' ? 'Agent Processing...' : 'Agent Analysis'}
                              </span>
                            </div>
                            {isSectionExpanded(step.id, 'agentAnalysis') ? (
                              <ChevronUp className={`w-4 h-4 ${step.status === 'in_progress' || step.status === 'in-progress' ? 'text-blue-600' : 'text-purple-600'}`} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${step.status === 'in_progress' || step.status === 'in-progress' ? 'text-blue-600' : 'text-purple-600'}`} />
                            )}
                          </button>
                          {isSectionExpanded(step.id, 'agentAnalysis') && (
                            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                              <ul className="space-y-1.5 text-sm text-gray-700">
                                {step.thinking?.map((thought: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className={`${step.status === 'in_progress' || step.status === 'in-progress' ? 'text-blue-600' : 'text-purple-600'} mt-1`}>▸</span>
                                    <span className="font-mono text-xs leading-relaxed">{formatThinking(thought)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Decision & Output Section - Collapsible */}
                        <div className={`${step.status === 'completed' ? 'bg-green-50 border-green-200' :
                          step.status === 'in_progress' || step.status === 'in-progress' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-gray-50 border-gray-200'
                          } border rounded-lg overflow-hidden`}>
                          <button
                            onClick={() => toggleSection(step.id, 'decision')}
                            className={`w-full flex items-center justify-between p-4 transition-colors ${step.status === 'completed' ? 'hover:bg-green-100' :
                              step.status === 'in_progress' || step.status === 'in-progress' ? 'hover:bg-yellow-100' :
                                'hover:bg-gray-100'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <ArrowRight className={`w-4 h-4 ${step.status === 'completed' ? 'text-green-600' :
                                step.status === 'in_progress' || step.status === 'in-progress' ? 'text-yellow-600' :
                                  'text-gray-600'
                                }`} />
                              <span className={`text-sm ${step.status === 'completed' ? 'text-green-900' :
                                step.status === 'in_progress' || step.status === 'in-progress' ? 'text-yellow-900' :
                                  'text-gray-900'
                                }`}>
                                Decision & Output
                              </span>
                            </div>
                            {isSectionExpanded(step.id, 'decision') ? (
                              <ChevronUp className={`w-4 h-4 ${step.status === 'completed' ? 'text-green-600' :
                                step.status === 'in_progress' || step.status === 'in-progress' ? 'text-yellow-600' :
                                  'text-gray-600'
                                }`} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${step.status === 'completed' ? 'text-green-600' :
                                step.status === 'in_progress' || step.status === 'in-progress' ? 'text-yellow-600' :
                                  'text-gray-600'
                                }`} />
                            )}
                          </button>
                          {isSectionExpanded(step.id, 'decision') && (
                            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                              <div className="mb-3">
                                <p className="text-sm mb-1">
                                  <span className="text-gray-600">Outcome:</span> <span>{step.decision?.outcome}</span>
                                </p>
                                <p className="text-sm text-gray-700">{step.decision?.reasoning}</p>
                              </div>

                              {/* Metrics Grid */}
                              <div className="grid grid-cols-2 gap-2">
                                {step.decision?.metrics?.map((metric: any, idx: number) => (
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
                {documents.map((doc: any) => (
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
                {auditEntries.map((entry: any, index: number) => (
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEscalationReason(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequestReason(e.target.value)}
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

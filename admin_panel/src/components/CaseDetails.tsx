import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, XCircle, FileText, Download, Activity, Brain, ArrowRight, Database, TrendingUp, ChevronDown, ChevronUp, User, Mail, Phone, Send, Loader2, UserCheck } from 'lucide-react';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Skeleton } from './ui/skeleton';
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

/**
 * Helper function to extract customer name from application data
 * Follows the same extraction path as AIProcessFlow.tsx for consistency
 */
function extractCustomerName(appDetails: ApplicationProcess | null): string {
  if (!appDetails) return 'Unknown Customer';
  
  // Try to extract from normalized application data (same path as list view)
  const name = appDetails.agentData?.ingest_llm?.normalized_application?.personal_details?.fullName;
  if (name && typeof name === 'string' && name.trim()) {
    return name.trim();
  }
  
  // Fallback: Try alternative paths
  const altName = appDetails.agentData?.application?.personal_details?.fullName ||
                  appDetails.agentData?.application?.personal_details?.full_name ||
                  appDetails.agentData?.application?.personalDetails?.fullName;
  if (altName && typeof altName === 'string' && altName.trim()) {
    return altName.trim();
  }
  
  // Final fallback: Use customerId if available
  if (appDetails.customerId) {
    return `Customer ${appDetails.customerId}`;
  }
  
  return 'Unknown Customer';
}

/**
 * Helper function to extract and format policy type from application data
 * Follows the same extraction path as AIProcessFlow.tsx for consistency
 */
function extractPolicyType(appDetails: ApplicationProcess | null): string {
  if (!appDetails) return 'Life Insurance';
  
  // Try to extract from normalized application data (same path as list view)
  const plan = appDetails.agentData?.ingest_llm?.normalized_application?.coverage_selection?.selectedPlan;
  if (plan && typeof plan === 'string' && plan.trim()) {
    return formatPolicyTypeString(plan.trim());
  }
  
  // Fallback: Try alternative paths
  const altPlan = appDetails.agentData?.application?.coverage_selection?.selectedPlan ||
                  appDetails.agentData?.application?.coverageSelection?.selectedPlan ||
                  appDetails.agentData?.application?.policy_type ||
                  appDetails.agentData?.application?.type;
  if (altPlan && typeof altPlan === 'string' && altPlan.trim()) {
    return formatPolicyTypeString(altPlan.trim());
  }
  
  // Default fallback
  return 'Life Insurance';
}

/**
 * Helper function to format policy type string
 * Converts formats like "smart", "life_insurance", "health_insurance" to readable format
 */
function formatPolicyTypeString(plan: string): string {
  if (!plan) return 'Life Insurance';
  
  // Handle common formats
  const lowerPlan = plan.toLowerCase();
  
  // Direct mappings for common values
  const mappings: Record<string, string> = {
    'smart': 'Smart Plan',
    'life_insurance': 'Life Insurance',
    'health_insurance': 'Health Insurance',
    'car_insurance': 'Car Insurance',
    'vehicle_insurance': 'Vehicle Insurance',
    'life': 'Life Insurance',
    'health': 'Health Insurance',
    'car': 'Car Insurance',
  };
  
  if (mappings[lowerPlan]) {
    return mappings[lowerPlan];
  }
  
  // Format snake_case or kebab-case to Title Case
  if (plan.includes('_') || plan.includes('-')) {
    return plan
      .split(/[_-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Capitalize first letter if it's a single word
  return plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
}

/**
 * Helper function to extract sum insured (coverage amount) from application data
 * Follows the same extraction path as AIProcessFlow.tsx for consistency
 */
function extractSumInsured(appDetails: ApplicationProcess | null): number {
  if (!appDetails) return 0;
  
  // Try to extract from normalized application data (same path as list view)
  const amount = appDetails.agentData?.ingest_llm?.normalized_application?.coverage_selection?.coverageAmount;
  if (amount !== null && amount !== undefined) {
    const parsed = parseFloat(String(amount));
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  
  // Fallback: Try alternative paths
  const altAmount = appDetails.agentData?.application?.coverage_selection?.coverageAmount ||
                    appDetails.agentData?.application?.coverageSelection?.coverageAmount ||
                    appDetails.agentData?.application?.sum_insured ||
                    appDetails.agentData?.application?.sumInsured ||
                    appDetails.agentData?.application?.amount;
  if (altAmount !== null && altAmount !== undefined) {
    const parsed = parseFloat(String(altAmount));
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  
  // Default fallback
  return 0;
}

/**
 * Helper function to format numbers as Indian currency (₹)
 * Handles edge cases and uses proper Indian number formatting
 */
function formatIndianCurrency(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  
  // Ensure amount is a number
  const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
  
  if (isNaN(numAmount)) {
    return '₹0';
  }
  
  // Format with Indian locale (en-IN) for proper comma placement
  // Indian numbering: 1,00,000 (lakhs) and 1,00,00,000 (crores)
  const formatted = numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return `₹${formatted}`;
}

/**
 * Helper function to extract and calculate fraud risk from application data
 * Uses KYC confidence score (0.0-1.0) and converts to risk percentage (0-100%)
 * Higher confidence = Lower fraud risk
 */
function extractFraudRisk(appDetails: ApplicationProcess | null): { level: 'Low' | 'Medium' | 'High', percentage: number } {
  if (!appDetails) {
    return { level: 'Low', percentage: 0 };
  }
  
  let riskPercentage = 0;
  
  // Primary: Extract from KYC confidence (0.0-1.0) and convert to risk percentage
  // Risk = (1 - Confidence) * 100
  const kycConfidence = appDetails.agentData?.kyc_reconciliation?.kyc_confidence;
  if (kycConfidence !== null && kycConfidence !== undefined) {
    const confidence = typeof kycConfidence === 'number' ? kycConfidence : parseFloat(String(kycConfidence));
    if (!isNaN(confidence) && confidence >= 0 && confidence <= 1) {
      riskPercentage = Math.round((1 - confidence) * 100);
    }
  }
  
  // Fallback: Try alternative paths for risk scores
  if (riskPercentage === 0 || isNaN(riskPercentage)) {
    // Try aggregated risk from decision node
    const decisionRisk = appDetails.agentData?.decision?.aggregated_risk ||
                        appDetails.agentData?.decision?.risk_score;
    if (decisionRisk !== null && decisionRisk !== undefined) {
      const risk = typeof decisionRisk === 'number' ? decisionRisk : parseFloat(String(decisionRisk));
      if (!isNaN(risk) && risk >= 0 && risk <= 100) {
        riskPercentage = Math.round(risk);
      }
    }
  }
  
  // Fallback: Calculate from health and financial risk scores if available
  if (riskPercentage === 0 || isNaN(riskPercentage)) {
    const healthRisk = appDetails.agentData?.health_underwriting?.risk_score ||
                      appDetails.agentData?.health?.risk_score;
    const financialRisk = appDetails.agentData?.financial_eligibility?.risk_score ||
                         appDetails.agentData?.financial?.risk_score;
    
    if (healthRisk !== null && healthRisk !== undefined || financialRisk !== null && financialRisk !== undefined) {
      const hRisk = healthRisk ? (typeof healthRisk === 'number' ? healthRisk : parseFloat(String(healthRisk))) : 0;
      const fRisk = financialRisk ? (typeof financialRisk === 'number' ? financialRisk : parseFloat(String(financialRisk))) : 0;
      
      if (!isNaN(hRisk) && !isNaN(fRisk)) {
        // Average of health and financial risk as fallback
        riskPercentage = Math.round((hRisk + fRisk) / 2);
      }
    }
  }
  
  // Determine risk level based on percentage
  let level: 'Low' | 'Medium' | 'High';
  if (riskPercentage <= 30) {
    level = 'Low';
  } else if (riskPercentage <= 70) {
    level = 'Medium';
  } else {
    level = 'High';
  }
  
  return { level, percentage: riskPercentage };
}

/**
 * Helper function to get badge styling for fraud risk level
 */
function getFraudRiskBadgeStyle(level: 'Low' | 'Medium' | 'High'): string {
  switch (level) {
    case 'Low':
      return 'bg-green-100 text-green-700';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'High':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Helper function to extract application date from application data
 * Tries multiple paths to find the application creation/start date
 */
function extractApplicationDate(appDetails: ApplicationProcess | null): Date | null {
  if (!appDetails) return null;
  
  // Primary: Extract from startTime (ISO string or timestamp)
  if (appDetails.startTime) {
    const date = parseDate(appDetails.startTime);
    if (date && !isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Fallback: Try alternative paths in agentData
  const altDateStr = appDetails.agentData?.application?.created_at ||
                     appDetails.agentData?.application?.createdAt ||
                     appDetails.agentData?.application?.startTime ||
                     appDetails.agentData?.ingest_llm?.normalized_application?.created_at;
  
  if (altDateStr) {
    const date = parseDate(altDateStr);
    if (date && !isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Final fallback: Use lastUpdated if startTime is not available
  if (appDetails.lastUpdated) {
    const date = parseDate(appDetails.lastUpdated);
    if (date && !isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
}

/**
 * Helper function to parse various date formats
 * Handles ISO strings, timestamps, and common date formats
 */
function parseDate(dateValue: string | number | Date): Date | null {
  if (!dateValue) return null;
  
  // If already a Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // If it's a number (timestamp)
  if (typeof dateValue === 'number') {
    // Check if it's in seconds (10 digits) or milliseconds (13 digits)
    const timestamp = dateValue.toString().length === 10 ? dateValue * 1000 : dateValue;
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // If it's a string, try parsing
  if (typeof dateValue === 'string') {
    // Try ISO string first
    const isoDate = new Date(dateValue);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    
    // Try parsing as timestamp string
    const timestamp = parseInt(dateValue, 10);
    if (!isNaN(timestamp)) {
      const ts = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
      const date = new Date(ts);
      return isNaN(date.getTime()) ? null : date;
    }
  }
  
  return null;
}

/**
 * Helper function to format date as "MMM DD, YYYY" (e.g., "Oct 26, 2025")
 * Handles timezone and provides consistent formatting
 */
function formatApplicationDate(date: Date | null): string {
  if (!date) {
    return 'N/A';
  }
  
  try {
    // Format as "MMM DD, YYYY" (e.g., "Oct 26, 2025")
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

/**
 * Helper function to check data availability for a specific step
 * Used for debugging why steps are pending
 */
function getStepDataAvailability(stepName: string, appDetails: ApplicationProcess | null): { exists: boolean; path: string; data: any } {
  if (!appDetails || !appDetails.agentData) {
    return { exists: false, path: 'N/A', data: null };
  }

  const stepDataMap: Record<string, { path: string; key: string }> = {
    'Customer Submission': { path: 'agentData.ingest_llm', key: 'ingest_llm' },
    'Document Processing': { path: 'agentData.document_processing', key: 'document_processing' },
    'KYC Verification': { path: 'agentData.kyc_reconciliation', key: 'kyc_reconciliation' },
    'Health Assessment': { path: 'agentData.health_underwriting', key: 'health_underwriting' },
    'Employment Verification': { path: 'agentData.occupation_risk', key: 'occupation_risk' },
    'Financial Eligibility': { path: 'agentData.financial_eligibility', key: 'financial_eligibility' },
    'Final Decision': { path: 'agentData.policy_decision', key: 'policy_decision' }
  };

  const stepInfo = stepDataMap[stepName];
  if (!stepInfo) {
    return { exists: false, path: 'Unknown step', data: null };
  }

  const data = appDetails.agentData[stepInfo.key];
  return {
    exists: !!data,
    path: stepInfo.path,
    data: data
  };
}

/**
 * Helper function to extract customer contact information (email and phone) from application data
 */
function extractCustomerContact(appDetails: ApplicationProcess | null): { email: string; phone: string } {
  if (!appDetails) {
    return { email: 'N/A', phone: 'N/A' };
  }
  
  let email = '';
  let phone = '';
  
  // Try to extract from normalized application data
  const contactInfo = appDetails.agentData?.ingest_llm?.normalized_application?.contact_info ||
                      appDetails.agentData?.ingest_llm?.normalized_application?.contactInfo ||
                      appDetails.agentData?.application?.contact_info ||
                      appDetails.agentData?.application?.contactInfo;
  
  if (contactInfo) {
    email = contactInfo.email || contactInfo.Email || '';
    phone = contactInfo.phone || contactInfo.Phone || contactInfo.phoneNumber || contactInfo.phone_number || '';
  }
  
  // Fallback: Try alternative paths
  if (!email) {
    email = appDetails.agentData?.application?.personal_details?.email ||
            appDetails.agentData?.application?.personal_details?.Email ||
            appDetails.agentData?.application?.personalDetails?.email ||
            appDetails.agentData?.ingest_llm?.normalized_application?.personal_details?.email || '';
  }
  
  if (!phone) {
    phone = appDetails.agentData?.application?.personal_details?.phone ||
            appDetails.agentData?.application?.personal_details?.Phone ||
            appDetails.agentData?.application?.personal_details?.phoneNumber ||
            appDetails.agentData?.application?.personalDetails?.phone ||
            appDetails.agentData?.ingest_llm?.normalized_application?.personal_details?.phone || '';
  }
  
  return {
    email: email && email.trim() ? email.trim() : 'N/A',
    phone: phone && phone.trim() ? phone.trim() : 'N/A'
  };
}

export function CaseDetails({ claimId, onBack }: CaseDetailsProps) {
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [auditEntries, setAuditEntries] = useState<any[]>([]);
  const [appDetails, setAppDetails] = useState<ApplicationProcess | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedStep, setExpandedStep] = useState<number | null>(6);
  const [expandAll, setExpandAll] = useState(false);
  const [showActionBar, setShowActionBar] = useState(true);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [showRequestDocsDialog, setShowRequestDocsDialog] = useState(false);
  const [showManualCompleteDialog, setShowManualCompleteDialog] = useState(false);
  const [selectedStepForCompletion, setSelectedStepForCompletion] = useState<AgentStep | null>(null);
  const [manualCompletionNotes, setManualCompletionNotes] = useState('');
  const [manualCompletionConfirmed, setManualCompletionConfirmed] = useState(false);
  const [stepValidationWarning, setStepValidationWarning] = useState<string | null>(null);
  const [showOverrideConfirmation, setShowOverrideConfirmation] = useState(false);
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
      setIsLoading(true);
      setError(null);
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

        // Debug: Log agentData structure to understand pending steps
        console.group('🔍 Agent Data Debug - Application:', claimId);
        console.log('Full agentData:', data.agentData);
        console.log('Step History:', steps);
        console.log('Agent Data Keys:', data.agentData ? Object.keys(data.agentData) : 'No agentData');
        
        // Check data availability for each expected step
        const stepDataChecks: Record<string, any> = {
          'Customer Submission': {
            exists: !!data.agentData?.ingest_llm,
            path: 'agentData.ingest_llm',
            data: data.agentData?.ingest_llm
          },
          'Document Processing': {
            exists: !!data.agentData?.document_processing,
            path: 'agentData.document_processing',
            data: data.agentData?.document_processing
          },
          'KYC Verification': {
            exists: !!data.agentData?.kyc_reconciliation,
            path: 'agentData.kyc_reconciliation',
            data: data.agentData?.kyc_reconciliation
          },
          'Health Assessment': {
            exists: !!data.agentData?.health_underwriting,
            path: 'agentData.health_underwriting',
            data: data.agentData?.health_underwriting
          },
          'Employment Verification': {
            exists: !!(data.agentData?.occupation_risk || data.agentData?.occupation),
            path: 'agentData.occupation_risk',
            data: data.agentData?.occupation_risk || data.agentData?.occupation
          },
          'Financial Eligibility': {
            exists: !!data.agentData?.financial_eligibility,
            path: 'agentData.financial_eligibility',
            data: data.agentData?.financial_eligibility
          },
          'Final Decision': {
            exists: !!data.agentData?.policy_decision,
            path: 'agentData.policy_decision',
            data: data.agentData?.policy_decision
          }
        };
        
        console.log('Step Data Availability:', stepDataChecks);
        console.groupEnd();

        // Mock documents for now, or extract from ingest_llm if available
        setDocuments([
          { id: 1, name: 'ID Proof (Aadhaar Card)', status: 'verified', mismatch: false },
          { id: 2, name: 'Income Certificate', status: 'verified', mismatch: false },
        ]);

        // Load audit trail from application data
        const auditTrail = data.auditTrail || [];
        // Format audit entries for display
        const formattedAuditEntries = auditTrail.map((entry: any) => ({
          time: entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A',
          agent: entry.admin_name || entry.admin_id || 'Admin',
          action: entry.message || `${entry.action}: ${entry.step_name || 'Unknown Step'}`,
          details: entry.admin_notes || '',
          stepName: entry.step_name,
          previousStatus: entry.previous_status,
          newStatus: entry.new_status
        }));
        
        // Add system entry for loading application
        formattedAuditEntries.unshift({
          time: new Date().toLocaleString(),
          agent: 'System',
          action: `Loaded application ${claimId}`,
          details: '',
          stepName: null,
          previousStatus: null,
          newStatus: null
        });
        
        setAuditEntries(formattedAuditEntries);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching case details:", error);
        setError(error instanceof Error ? error.message : 'Failed to load application details');
        setIsLoading(false);
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

  // Critical steps that cannot be skipped
  const CRITICAL_STEPS = ['KYC Verification', 'Health Assessment'];
  
  // Step order for validation
  const STEP_ORDER = [
    'Customer Submission',
    'Document Processing',
    'KYC Verification',
    'Health Assessment',
    'Employment Verification',
    'Financial Eligibility',
    'Final Decision'
  ];

  // Step dependencies mapping
  const STEP_DEPENDENCIES: Record<string, string[]> = {
    'Customer Submission': ['Document Processing', 'KYC Verification'],
    'Document Processing': ['KYC Verification'],
    'KYC Verification': ['Health Assessment', 'Employment Verification', 'Financial Eligibility'],
    'Health Assessment': ['Final Decision'],
    'Employment Verification': ['Final Decision'],
    'Financial Eligibility': ['Final Decision'],
    'Final Decision': []
  };

  // Get steps that depend on a given step
  const getDependentSteps = (stepName: string): string[] => {
    return STEP_DEPENDENCIES[stepName] || [];
  };

  const validateStepCompletion = (step: AgentStep): { isValid: boolean; warning?: string; error?: string } => {
    // Check if step is critical
    if (CRITICAL_STEPS.includes(step.name)) {
      return {
        isValid: false,
        error: `Cannot manually complete critical step "${step.name}". This step must be completed by the agent workflow.`
      };
    }

    // Check if previous steps are completed
    const stepIndex = STEP_ORDER.indexOf(step.name);
    if (stepIndex === -1) {
      // Step not in order list, allow with warning
      return {
        isValid: true,
        warning: 'This step is not in the standard workflow order. Proceed with caution.'
      };
    }

    // Check previous steps
    const previousSteps = STEP_ORDER.slice(0, stepIndex);
    const incompleteSteps: string[] = [];
    
    for (const prevStepName of previousSteps) {
      const prevStep = agentSteps.find(s => s.name === prevStepName);
      if (!prevStep || (prevStep.status !== 'completed' && prevStep.status !== 'in_progress' && prevStep.status !== 'in-progress')) {
        incompleteSteps.push(prevStepName);
      }
    }

    if (incompleteSteps.length > 0) {
      return {
        isValid: true,
        warning: `The following steps are not yet completed: ${incompleteSteps.join(', ')}. Completing this step may skip required workflow steps.`
      };
    }

    return { isValid: true };
  };

  const handleManualComplete = (step: AgentStep) => {
    // Validate step before opening dialog
    const validation = validateStepCompletion(step);
    
    if (!validation.isValid && validation.error) {
      toast.error(validation.error);
      return;
    }

    setSelectedStepForCompletion(step);
    setManualCompletionNotes('');
    setManualCompletionConfirmed(false);
    setStepValidationWarning(validation.warning || null);
    setShowOverrideConfirmation(false);
    setShowManualCompleteDialog(true);
  };

  const handleSubmitManualCompletion = async () => {
    if (!selectedStepForCompletion || !manualCompletionNotes.trim() || !manualCompletionConfirmed) {
      toast.error('Please provide admin notes and confirm verification');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/agent/step/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: claimId,
          step_id: selectedStepForCompletion.id,
          step_name: selectedStepForCompletion.name,
          admin_notes: manualCompletionNotes.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to complete step' }));
        throw new Error(errorData.detail || 'Failed to complete step');
      }

      const updatedProcess = await response.json();
      setAppDetails(updatedProcess);
      
      // Update step history if available
      if (updatedProcess.stepHistory) {
        setAgentSteps(updatedProcess.stepHistory);
      }

      toast.success(`Step "${selectedStepForCompletion.name}" marked as complete`);
      setShowManualCompleteDialog(false);
      setSelectedStepForCompletion(null);
      setManualCompletionNotes('');
      setManualCompletionConfirmed(false);
      setStepValidationWarning(null);
      setShowOverrideConfirmation(false);
    } catch (error: any) {
      console.error('Error completing step manually:', error);
      toast.error(error.message || 'Failed to complete step');
    }
  };

  const getStatusBadge = (status: string, step?: AgentStep) => {
    // Check if step was manually completed
    const isManual = step && step.status === 'completed' && (step as any).completed_by === 'human';
    
    const variants: Record<string, string> = {
      completed: isManual ? 'bg-orange-100 text-orange-700 border-0' : 'bg-green-100 text-green-700 border-0',
      in_progress: 'bg-blue-100 text-blue-700 border-0',
      warning: 'bg-orange-100 text-orange-700 border-0',
      pending: 'bg-gray-100 text-gray-700',
    };
    return variants[status] || 'bg-gray-100 text-gray-700';
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="p-10 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-96" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        
        {/* Loading Skeleton for Header Info Card */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-4 w-20 mx-auto mb-2" />
                  <Skeleton className="h-6 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Loading Skeleton for Main Content */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-10 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-1">Failed to Load Application</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    // Trigger refetch
                    const fetchDetails = async () => {
                      try {
                        const response = await fetch(`${API_BASE_URL}/agent/application/${claimId}`);
                        if (!response.ok) throw new Error('Failed to fetch application');
                        const data: ApplicationProcess = await response.json();
                        setAppDetails(data);
                        setIsLoading(false);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to load application details');
                        setIsLoading(false);
                      }
                    };
                    fetchDetails();
                  }}
                >
                  <Loader2 className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <p className="text-lg">{extractCustomerName(appDetails)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Policy Type</p>
              <p className="text-lg">{extractPolicyType(appDetails)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Sum Insured</p>
              <p className="text-lg">{formatIndianCurrency(extractSumInsured(appDetails))}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Fraud Risk</p>
              {(() => {
                const fraudRisk = extractFraudRisk(appDetails);
                return (
                  <Badge className={`${getFraudRiskBadgeStyle(fraudRisk.level)} border-0 text-base px-4 py-1`}>
                    {fraudRisk.level} ({fraudRisk.percentage}%)
                  </Badge>
                );
              })()}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Application Date</p>
              <p className="text-lg">{formatApplicationDate(extractApplicationDate(appDetails))}</p>
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
          {/* Pending Steps Summary Banner */}
          {agentSteps.filter(s => s.status === 'pending').length > 0 && (
            <Card className="border-yellow-300 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-900">
                      {agentSteps.filter(s => s.status === 'pending').length} step{agentSteps.filter(s => s.status === 'pending').length > 1 ? 's' : ''} waiting for agent
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      The AI agent workflow is processing these steps. You can manually complete them if needed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                            } ${step.status === 'pending' ? 'animate-pulse border-yellow-300' : ''}`}
                        >
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isExpanded ? 'ring-4 ring-white' : ''
                            } ${getStatusColor(step.status)}`}>
                            {getStatusIcon(step.status)}
                          </div>
                          <div className="text-center">
                            <p className={`text-xs mb-1 ${isExpanded ? '' : 'text-gray-900'}`}>
                              {step.name}
                            </p>
                            <Badge className={`text-xs ${getStatusBadge(step.status, step)} border-0`}>
                              {step.status === 'in_progress' || step.status === 'in-progress' ? 'In Progress' :
                                step.status === 'completed' && (step as any).completed_by === 'human' ? 'Completed (Manual)' :
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
                            <Badge className={`${getStatusBadge(step.status, step)} px-3 py-1`}>
                              {step.status === 'in_progress' || step.status === 'in-progress' ? 'In Progress' : 
                               step.status === 'completed' && (step as any).completed_by === 'human' ? 'Completed (Manual)' :
                               step.status === 'completed' ? 'Completed' : step.status.replace('_', ' ')}
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
                          
                          {/* Debug Information for Pending Steps */}
                          {step.status === 'pending' && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-yellow-900 mb-1">Why is this step pending?</p>
                                  {(() => {
                                    const dataCheck = getStepDataAvailability(step.name, appDetails);
                                    return (
                                      <div className="text-xs text-yellow-800 space-y-1">
                                        <p>
                                          <span className="font-medium">Data Path:</span> <code className="bg-yellow-100 px-1 rounded">{dataCheck.path}</code>
                                        </p>
                                        <p>
                                          <span className="font-medium">Data Available:</span>{' '}
                                          <span className={dataCheck.exists ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                                            {dataCheck.exists ? 'Yes ✓' : 'No ✗'}
                                          </span>
                                        </p>
                                        {!dataCheck.exists && (
                                          <p className="text-yellow-700 italic mt-1">
                                            This step requires data at <code className="bg-yellow-100 px-1 rounded">{dataCheck.path}</code> to be marked as complete.
                                            The agent workflow may not have reached this step yet, or the data structure may be different.
                                          </p>
                                        )}
                                        {dataCheck.exists && (
                                          <details className="mt-2">
                                            <summary className="cursor-pointer text-yellow-700 hover:text-yellow-900 font-medium">
                                              View Available Data
                                            </summary>
                                            <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs overflow-auto max-h-40">
                                              {JSON.stringify(dataCheck.data, null, 2)}
                                            </pre>
                                          </details>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          )}
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

                        {/* Manual Completion Button for Pending Steps */}
                        {step.status === 'pending' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <Button
                              onClick={() => handleManualComplete(step)}
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                              variant="default"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Mark as Complete (Human Review)
                            </Button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Manually verify and complete this step if the agent workflow is stuck
                            </p>
                          </div>
                        )}

                        {/* Visual Indicator for Manually Completed Steps */}
                        {step.status === 'completed' && (step as any).completed_by === 'human' && (
                          <div className="mt-4 pt-4 border-t border-orange-200">
                            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <UserCheck className="w-4 h-4 text-orange-600" />
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-orange-900">Completed Manually</p>
                                {(step as any).admin_notes && (
                                  <p className="text-xs text-orange-700 mt-1">{(step as any).admin_notes}</p>
                                )}
                                {(step as any).completed_at && (
                                  <p className="text-xs text-orange-600 mt-1">
                                    Completed at: {new Date((step as any).completed_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
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
                {auditEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No audit entries yet.</p>
                    <p className="text-sm mt-2">Manual step completions and actions will appear here.</p>
                  </div>
                ) : (
                  auditEntries.map((entry: any, index: number) => (
                    <div key={index}>
                      <div className="flex gap-4 py-3">
                        <span className="text-sm text-gray-500 w-40 flex-shrink-0">{entry.time}</span>
                        <span className="text-sm text-blue-600 w-32 flex-shrink-0 font-medium">{entry.agent}</span>
                        <div className="flex-1">
                          <span className="text-sm">{entry.action}</span>
                          {entry.details && (
                            <p className="text-xs text-gray-600 mt-1 italic">Notes: {entry.details}</p>
                          )}
                          {entry.stepName && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="text-xs bg-orange-100 text-orange-700 border-0">
                                {entry.stepName}
                              </Badge>
                              {entry.previousStatus && entry.newStatus && (
                                <span className="text-xs text-gray-500">
                                  {entry.previousStatus} → {entry.newStatus}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {index < auditEntries.length - 1 && <Separator />}
                    </div>
                  ))
                )}
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
                <span className="text-gray-600">Customer:</span>{' '}
                <span>
                  {extractCustomerName(appDetails)} - {extractPolicyType(appDetails)} ({formatIndianCurrency(extractSumInsured(appDetails))})
                </span>
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
                <span className="text-gray-600">Customer:</span> <span>{extractCustomerName(appDetails)}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Contact:</span>{' '}
                <span>
                  {(() => {
                    const contact = extractCustomerContact(appDetails);
                    return `${contact.email} | ${contact.phone}`;
                  })()}
                </span>
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

      {/* Manual Step Completion Dialog */}
      <Dialog open={showManualCompleteDialog} onOpenChange={setShowManualCompleteDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-orange-600" />
              Manually Complete Step
            </DialogTitle>
            <DialogDescription>
              Verify and manually mark this step as complete. This will trigger the next step in the workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm mb-1">
                <span className="text-gray-600">Step:</span> <span className="font-semibold">{selectedStepForCompletion?.name}</span>
              </p>
              <p className="text-sm mb-1">
                <span className="text-gray-600">Application ID:</span> <span>{claimId}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Current Status:</span>{' '}
                <Badge className="bg-gray-100 text-gray-700 border-0">{selectedStepForCompletion?.status}</Badge>
              </p>
            </div>

            {/* Step Data Preview */}
            {selectedStepForCompletion && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Step Summary</Label>
                  <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-700">
                    {selectedStepForCompletion.summary || 'No summary available'}
                  </div>
                </div>

                {/* Step Dependencies Visualization */}
                {getDependentSteps(selectedStepForCompletion.name).length > 0 && (
                  <div>
                    <Label className="mb-2 block">Steps That Depend on This Step</Label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800 mb-2">
                        Completing this step will enable the following steps:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {getDependentSteps(selectedStepForCompletion.name).map((depStep) => {
                          const depStepData = agentSteps.find(s => s.name === depStep);
                          const isCompleted = depStepData?.status === 'completed';
                          return (
                            <Badge
                              key={depStep}
                              className={`text-xs ${
                                isCompleted
                                  ? 'bg-green-100 text-green-700 border-green-300'
                                  : 'bg-blue-100 text-blue-700 border-blue-300'
                              } border`}
                            >
                              {depStep} {isCompleted && '✓'}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <Label htmlFor="manual-completion-notes" className="mb-2 block">
                Admin Notes <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="manual-completion-notes"
                placeholder="Explain why you are manually completing this step (e.g., verified data manually, agent workflow stuck, external verification completed...)"
                value={manualCompletionNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setManualCompletionNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                These notes will be recorded in the audit trail and visible to other admins.
              </p>
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Checkbox
                id="manual-completion-confirm"
                checked={manualCompletionConfirmed}
                onCheckedChange={(checked) => setManualCompletionConfirmed(checked === true)}
                className="mt-1"
              />
              <label htmlFor="manual-completion-confirm" className="flex-1 cursor-pointer">
                <p className="text-sm font-semibold text-yellow-900">
                  I have verified this step is complete
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  By checking this box, you confirm that you have reviewed the step data and verified that it should be marked as complete.
                </p>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowManualCompleteDialog(false);
              setManualCompletionNotes('');
              setManualCompletionConfirmed(false);
            }}>
              Cancel
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleSubmitManualCompletion}
              disabled={
                !manualCompletionNotes.trim() || 
                !manualCompletionConfirmed || 
                (stepValidationWarning && !showOverrideConfirmation)
              }
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

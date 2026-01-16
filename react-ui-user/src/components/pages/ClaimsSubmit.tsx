import { useState, useEffect } from 'react';
import { Check, Upload, X, FileText, Image as ImageIcon, AlertCircle, Calendar, MapPin, User, Phone, Mail, CreditCard, ArrowLeft, ArrowRight, CheckCircle, Heart, Car, Activity, Plus, Info, Building2, Stethoscope, Clock, Download, Camera, Briefcase, Shield, Award, Loader2, FileCheck, Trash2, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import { createClaimApplication, updateClaimApplication, uploadDocument, getUserPolicies } from '../../services/api';

interface UploadedFile {
  id: string;
  file: File;                    // File object for actual upload
  name: string;
  size: number;
  type: string;                  // MIME type
  category: string;              // Document category (e.g., "hospital-bills")
  preview?: string;              // Preview URL for images
  progress?: number;             // Upload progress (0-100)
  uploading?: boolean;           // Upload status
  error?: string | null;         // Upload error message
  uploadedUrl?: string | null;   // Azure Blob URL (after successful upload)
  documentId?: number | null;   // PostgreSQL document ID (after successful upload)
}

// Policy interface to match backend response from /policy/user/{userId}
// Based on backend router policy.py get_policies_by_user endpoint
interface Policy {
  id?: number;                    // May not be present in API response
  policyId?: number;              // Primary field from backend (p.id)
  userId?: number;                // User ID
  type: string;                   // Policy type enum: 'life_insurance', 'vehicle_insurance', 'health_insurance'
  planName: string;               // Policy plan name
  policyNumber: string;           // Unique policy number
  coverage: number | string;      // Coverage amount (number from backend)
  premium?: number | string;      // Premium amount (optional)
  status?: string;                // Policy status (e.g., 'Active')
  expiryDate?: string;            // Expiry date in ISO format
  startDate?: string;             // Start date in ISO format (optional)
  validTill?: string;             // Alternative field name (may not exist)
  benefits?: any;                 // Benefits JSON (optional)
  nominee?: string;               // Nominee name (optional)
  nomineeId?: number;             // Nominee ID (optional)
  personalDetails?: any;          // Personal details JSON (optional)
  policyDocument?: string;        // Policy document URL (optional)
  applicationId?: string;         // MongoDB Application ID (Source of Truth)
}

export default function ClaimsSubmit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [claimType, setClaimType] = useState<'health' | 'life' | 'car' | ''>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [claimNumber, setClaimNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Policy states
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState<boolean>(false);
  const [policiesError, setPoliciesError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Claim Type & Policy
    selectedPolicy: '',

    // Step 2: Intimation Details
    intimationDate: new Date().toISOString().split('T')[0],
    intimationTime: new Date().toTimeString().slice(0, 5),

    // Step 3: Incident/Hospitalization Details
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    incidentDescription: '',

    // Health specific
    claimCategory: '', // cashless, reimbursement
    hospitalName: '',
    hospitalAddress: '',
    hospitalCity: '',
    hospitalType: '', // network, non-network
    admissionDate: '',
    dischargeDate: '',
    treatmentType: '',
    ailment: '',
    roomType: '',
    doctorName: '',
    estimatedAmount: '',

    // Car specific
    accidentType: '',
    policeStation: '',
    firNumber: '',
    firDate: '',
    policeComplaintFiled: '',
    thirdPartyInvolved: '',
    thirdPartyDetails: '',
    driverName: '',
    driverLicenseNumber: '',
    driverRelation: '',
    vehicleCondition: '',
    repairWorkshop: '',
    estimatedRepairCost: '',

    // Life specific
    deceasedName: '',
    deceasedDOB: '',
    deceasedAge: '',
    dateOfDeath: '',
    timeOfDeath: '',
    placeOfDeath: '',
    causeOfDeath: '',
    deathType: '', // natural, accidental, illness
    hospitalNameDeath: '',
    claimantRelation: '',

    // Step 4: Documents Upload (handled separately)

    // Step 5: Claimant/Patient Info
    claimantName: '',
    patientName: '',
    patientAge: '',
    patientGender: '',
    claimantPhone: '',
    claimantEmail: '',
    claimantAddress: '',
    claimantCity: '',
    claimantPincode: '',

    // Step 6: Bank Details
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountType: ''
  });

  const steps = [
    { num: 1, title: 'Select Policy', icon: Shield },
    { num: 2, title: 'Intimation', icon: AlertCircle },
    { num: 3, title: 'Incident Details', icon: FileText },
    { num: 4, title: 'Upload Documents', icon: Upload },
    { num: 5, title: 'Claimant Info', icon: User },
    { num: 6, title: 'Bank Details', icon: CreditCard },
    { num: 7, title: 'Review & Submit', icon: CheckCircle }
  ];

  const handleFileUpload = (files: FileList | null, category: string) => {
    if (!files) return;

    // Validate category if claim type is set
    if (claimType && category) {
      try {
        // Import category validation (dynamic import to avoid circular dependencies)
        const { isValidCategory, normalizeCategoryId } = require('../../utils/categoryMapping');
        const normalizedCategory = normalizeCategoryId(category);

        if (!isValidCategory(claimType as 'health' | 'life' | 'car', normalizedCategory)) {
          console.warn(`[CLAIM_DOCUMENT_UPLOAD] ⚠️  Category '${category}' (normalized: '${normalizedCategory}') may not be valid for claim type '${claimType}'`);
          // Don't block upload, but log warning
        } else {
          console.log(`[CLAIM_DOCUMENT_UPLOAD] ✅ Category '${category}' validated for claim type '${claimType}'`);
        }
      } catch (error) {
        console.debug('[CLAIM_DOCUMENT_UPLOAD] Category validation not available:', error);
      }
    }

    const userIdForUpload = user?.id || localStorage.getItem('userId') || '1';
    const policyIdForUpload = formData.selectedPolicy ? String(formData.selectedPolicy) : undefined;

    // Create file objects
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,                    // Store File object for actual upload
      name: file.name,
      size: file.size,
      type: file.type,
      category,                      // Category ID (e.g., "death-certificate")
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,                   // Initialize progress
      uploading: true,               // Start uploading immediately
      error: null,                    // No error initially
      uploadedUrl: null,              // Will be set after successful upload
      documentId: null                // Will be set after successful upload
    }));

    // Add files to state and upload immediately (like application process)
    setUploadedFiles(prev => {
      const updated = [...prev, ...newFiles];

      // Upload each new file immediately
      newFiles.forEach((fileObj, localIndex) => {
        const globalIndex = prev.length + localIndex;

        // Upload immediately (no claimId yet, will be updated later if needed)
        // Pass category to organize documents in folders
        uploadDocument(
          fileObj.file,
          'claim_document',
          userIdForUpload,
          policyIdForUpload,
          undefined, // No claimId yet - will upload to claims/pending/{userId}
          (progress) => {
            // Update progress using functional update
            setUploadedFiles(current => {
              const next = [...current];
              if (next[globalIndex] && next[globalIndex].id === fileObj.id) {
                next[globalIndex] = { ...next[globalIndex], progress };
              }
              return next;
            });
          },
          fileObj.category // Pass category for folder organization
        ).then((res) => {
          // Extract fileUrl with multiple fallbacks
          const fileUrl = res.fileUrl || res.fileurl || res.url || null;
          const documentId = res.documentId || res.document_id || res.id || null;

          if (!fileUrl) {
            throw new Error('Upload succeeded but no file URL returned from server');
          }

          // Verify Azure Blob Storage URL
          const isAzureUrl = fileUrl.includes('blob.core.windows.net');
          if (!isAzureUrl) {
            console.warn(`[CLAIM_DOCUMENT_UPLOAD] ⚠️  File uploaded but not to Azure: ${fileUrl}`);
            console.warn(`[CLAIM_DOCUMENT_UPLOAD] Expected Azure URL (blob.core.windows.net), got: ${fileUrl.substring(0, 100)}`);
          }

          // Update state with success
          setUploadedFiles(current => {
            const next = [...current];
            const fileIndex = next.findIndex(f => f.id === fileObj.id);
            if (fileIndex !== -1) {
              next[fileIndex] = {
                ...next[fileIndex],
                uploadedUrl: fileUrl,
                documentId: documentId,
                progress: 100,
                uploading: false,
                error: null
              };
            }
            return next;
          });

          console.log(`[CLAIM_DOCUMENT_UPLOAD] ✅ File uploaded successfully`);
          console.log(`[CLAIM_DOCUMENT_UPLOAD]   URL: ${fileUrl.substring(0, 100)}...`);
          console.log(`[CLAIM_DOCUMENT_UPLOAD]   Azure Storage: ${isAzureUrl ? '✅ YES' : '❌ NO'}`);
          console.log(`[CLAIM_DOCUMENT_UPLOAD]   Document ID: ${documentId}`);
          console.log(`[CLAIM_DOCUMENT_UPLOAD]   Category: ${fileObj.category}`);

          // Verify Azure URL and log for debugging
          if (isAzureUrl) {
            console.log(`[CLAIM_DOCUMENT_UPLOAD] ✅ Verified: Document is in Azure Blob Storage`);
            toast.success(`"${fileObj.name}" uploaded to Azure Blob Storage successfully!`);
          } else {
            console.warn(`[CLAIM_DOCUMENT_UPLOAD] ⚠️  WARNING: Document uploaded but NOT to Azure Storage`);
            console.warn(`[CLAIM_DOCUMENT_UPLOAD]   URL: ${fileUrl}`);
            console.warn(`[CLAIM_DOCUMENT_UPLOAD]   Expected: blob.core.windows.net in URL`);
            toast.warning(`"${fileObj.name}" uploaded, but not to Azure Storage. Check backend configuration.`);
          }
        }).catch((error: any) => {
          console.error(`[CLAIM_DOCUMENT_UPLOAD] ❌ Upload failed for ${fileObj.name}:`, error);

          // Categorize errors for better user feedback
          let errorMessage = 'Upload failed';
          let isAzureError = false;

          if (error?.message) {
            const msg = error.message.toLowerCase();
            if (msg.includes('azure') || msg.includes('blob') || msg.includes('storage')) {
              errorMessage = 'Azure Storage error: Please try again or contact support';
              isAzureError = true;
            } else if (msg.includes('timeout') || msg.includes('time')) {
              errorMessage = 'Upload timeout: Please check your connection and try again';
            } else if (msg.includes('network') || msg.includes('failed to fetch')) {
              errorMessage = 'Network error: Please check your internet connection';
            } else if (msg.includes('413') || msg.includes('too large')) {
              errorMessage = 'File too large: Maximum size is 10MB';
            } else if (msg.includes('415') || msg.includes('type')) {
              errorMessage = 'File type not supported';
            } else if (msg.includes('401') || msg.includes('403')) {
              errorMessage = 'Authentication error: Please log in again';
            } else if (msg.includes('500') || msg.includes('server')) {
              errorMessage = 'Server error: Please try again later';
            } else {
              errorMessage = error.message;
            }
          }

          // Update state with error
          setUploadedFiles(current => {
            const next = [...current];
            const fileIndex = next.findIndex(f => f.id === fileObj.id);
            if (fileIndex !== -1) {
              next[fileIndex] = {
                ...next[fileIndex],
                uploading: false,
                error: errorMessage,
                progress: 0
              };
            }
            return next;
          });

          if (isAzureError) {
            toast.error(`Azure Storage Error: "${fileObj.name}" - ${errorMessage}`);
          } else {
            toast.error(`Failed to upload "${fileObj.name}": ${errorMessage}`);
          }
        });
      });

      return updated;
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('File removed');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Fetch policies from API on component mount
  useEffect(() => {
    const fetchPolicies = async () => {
      setLoadingPolicies(true);
      setPoliciesError(null);

      try {
        const userId = user?.id || localStorage.getItem('userId');

        if (!userId) {
          console.warn('[CLAIMS] No userId available to fetch policies');
          setLoadingPolicies(false);
          return;
        }

        console.log('[CLAIMS] Fetching policies for userId:', userId);
        const policiesData = await getUserPolicies(userId);

        // Handle array response directly
        const policiesArray = Array.isArray(policiesData) ? policiesData : [];
        console.log('[CLAIMS] Fetched policies:', policiesArray.length, 'policies');

        setPolicies(policiesArray);
      } catch (error: any) {
        console.error('[CLAIMS] Error fetching policies:', error);
        setPoliciesError(error?.message || 'Failed to load policies');
        toast.error('Failed to load policies. Please refresh the page.');
      } finally {
        setLoadingPolicies(false);
      }
    };

    fetchPolicies();
  }, [user]);

  // Filter policies by claim type
  const getPoliciesByType = (claimType: string): Policy[] => {
    if (!claimType || !policies.length) return [];

    return policies.filter(policy => {
      const policyType = (policy.type || '').toLowerCase();
      const policyName = (policy.planName || '').toLowerCase();

      switch (claimType) {
        case 'health':
          return policyType.includes('health') ||
            policyType.includes('medical') ||
            policyName.includes('health') ||
            policyType === 'health_insurance';
        case 'life':
          return policyType.includes('life') ||
            policyType.includes('term') ||
            policyType === 'life_insurance';
        case 'car':
          return policyType.includes('car') ||
            policyType.includes('vehicle') ||
            policyType.includes('motor') ||
            policyType === 'vehicle_insurance';
        default:
          return false;
      }
    });
  };

  // Map backend policy to UI format
  const mapPolicyToUI = (policy: Policy) => {
    // Format coverage amount
    const formatCoverage = (coverage: number | string): string => {
      if (typeof coverage === 'string') {
        // If already formatted, return as is
        if (coverage.includes('₹') || coverage.includes('Lakhs')) {
          return coverage;
        }
        // Try to parse
        const num = parseFloat(coverage);
        if (isNaN(num)) return coverage;
        coverage = num;
      }

      if (coverage >= 100000) {
        return `₹${(coverage / 100000).toFixed(1)} Lakhs`;
      } else if (coverage >= 1000) {
        return `₹${(coverage / 1000).toFixed(0)}K`;
      }
      return `₹${coverage}`;
    };

    // Format date
    const formatDate = (dateStr?: string): string => {
      if (!dateStr) return 'N/A';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return dateStr;
      }
    };

    return {
      id: String(policy.policyId || policy.id || ''),
      name: policy.planName || 'Unnamed Policy',
      policyNumber: policy.policyNumber || 'N/A',
      sumInsured: formatCoverage(policy.coverage || 0),
      expiryDate: formatDate(policy.expiryDate || policy.validTill),
      // Note: Backend API does not return insuranceCompany or insurer field
      // Using 'Unknown' as fallback, but this could be extracted from planName if needed
      insurer: 'Unknown',
      // Additional fields for car insurance
      vehicle: undefined, // Will be added if available in policy (e.g., from personalDetails)
      // Store original policy for reference
      originalPolicy: policy
    };
  };

  // Upload a single file at the given index
  const uploadFileAtIndex = async (index: number, claimId?: string | number) => {
    // Get file from state
    let fileObj: UploadedFile | null = null;

    setUploadedFiles(prev => {
      fileObj = prev[index] || null;
      return prev; // Don't modify, just read
    });

    if (!fileObj || !fileObj.file) {
      console.warn(`File at index ${index} not found or no file object`);
      return null;
    }

    // Prevent uploading if already uploading
    if (fileObj.uploading) {
      console.warn(`File at index ${index} is already uploading`);
      return null;
    }

    // If already uploaded successfully, return existing data
    if (fileObj.uploadedUrl && !fileObj.error) {
      console.log(`File at index ${index} already uploaded successfully`);
      return {
        fileUrl: fileObj.uploadedUrl,
        documentId: fileObj.documentId,
        fileName: fileObj.name
      };
    }

    const userIdForUpload = user?.id || localStorage.getItem('userId') || '1';
    const policyIdForUpload = formData.selectedPolicy || undefined;

    // Mark uploading and clear any previous errors
    setUploadedFiles(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = {
          ...next[index],
          uploading: true,
          progress: 0,
          error: null
        };
      }
      return next;
    });

    try {
      console.log(`[CLAIM_DOCUMENT_UPLOAD] Uploading file at index ${index}:`, fileObj.file.name, 'with documentType: claim_document');

      // Upload document with claim_document type
      // Use claimId if provided (after claim creation), otherwise undefined (will use pending folder)
      // Pass category to organize documents in category-based folders
      const res = await uploadDocument(
        fileObj.file,
        'claim_document',  // All claim documents use this type
        userIdForUpload,
        policyIdForUpload,
        claimId,  // Will be undefined initially, set after claim creation
        (progress) => {
          // Update progress
          setUploadedFiles(prev => {
            const next = [...prev];
            if (next[index] && next[index].uploading) {
              next[index] = { ...next[index], progress };
            }
            return next;
          });
        },
        fileObj.category // Pass category for folder organization (e.g., "death-certificate", "claim-form")
      );

      // Log full response for debugging
      console.log(`[CLAIM_DOCUMENT_UPLOAD] Full API response:`, res);
      console.log(`[CLAIM_DOCUMENT_UPLOAD] Response fileUrl:`, res.fileUrl || res.fileurl);
      console.log(`[CLAIM_DOCUMENT_UPLOAD] Response documentId:`, res.documentId || res.document_id);

      // Extract fileUrl with multiple fallbacks
      const fileUrl = res.fileUrl || res.fileurl || res.url || null;
      const documentId = res.documentId || res.document_id || res.id || null;

      if (!fileUrl) {
        console.error(`[CLAIM_DOCUMENT_UPLOAD] No fileUrl in response:`, res);
        throw new Error('Upload succeeded but no file URL returned from server');
      }

      // Update state with uploaded URL and document ID
      setUploadedFiles(prev => {
        const next = [...prev];
        if (next[index]) {
          next[index] = {
            ...next[index],
            uploadedUrl: fileUrl,
            documentId: documentId,
            progress: 100,
            uploading: false,
            error: null
          };
        }
        return next;
      });

      console.log(`[CLAIM_DOCUMENT_UPLOAD] File uploaded successfully:`, fileUrl);
      return {
        fileUrl: fileUrl,
        documentId: documentId,
        fileName: res.fileName || res.filename || fileObj.name,
        category: fileObj.category // Preserve category
      };
    } catch (error: any) {
      console.error(`[CLAIM_DOCUMENT_UPLOAD] Upload failed for file at index ${index}:`, error);

      // Update state with error
      setUploadedFiles(prev => {
        const next = [...prev];
        if (next[index]) {
          next[index] = {
            ...next[index],
            uploading: false,
            error: error?.message || 'Upload failed'
          };
        }
        return next;
      });

      toast.error(`Failed to upload ${fileObj.name}: ${error?.message || 'Upload failed'}`);
      throw error;
    }
  };

  // Upload all files (can be called before or after claim creation)
  const uploadAllFiles = async (claimId?: string | number) => {
    console.log(`[CLAIM_DOCUMENT_UPLOAD] Starting upload for ${uploadedFiles.length} files with claimId: ${claimId}`);

    const uploadPromises = uploadedFiles.map((fileObj, index) => {
      // Skip if already uploaded successfully
      if (fileObj.uploadedUrl && !fileObj.error) {
        console.log(`[CLAIM_DOCUMENT_UPLOAD] File ${index} already uploaded: ${fileObj.name}`);
        return Promise.resolve({
          fileUrl: fileObj.uploadedUrl,
          documentId: fileObj.documentId,
          fileName: fileObj.name,
          category: fileObj.category
        });
      }

      // Upload file with error handling
      return uploadFileAtIndex(index, claimId)
        .then((res) => {
          if (!res || !res.fileUrl) {
            console.error(`[CLAIM_DOCUMENT_UPLOAD] Upload returned invalid result for file ${index}:`, res);
            throw new Error(`Upload failed for ${fileObj.name}: Invalid response from server`);
          }
          console.log(`[CLAIM_DOCUMENT_UPLOAD] File ${index} uploaded successfully:`, res);
          return {
            ...res,
            category: fileObj.category // Ensure category is preserved
          };
        })
        .catch((error) => {
          console.error(`[CLAIM_DOCUMENT_UPLOAD] Upload failed for file ${index} (${fileObj.name}):`, error);
          // Re-throw with more context
          throw new Error(`Failed to upload ${fileObj.name}: ${error.message || error}`);
        });
    });

    try {
      // Use Promise.allSettled to get all results (success and failures)
      const results = await Promise.allSettled(uploadPromises);

      const successful: any[] = [];
      const failed: any[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          failed.push({
            index,
            fileName: uploadedFiles[index]?.name,
            error: result.reason
          });
        }
      });

      console.log(`[CLAIM_DOCUMENT_UPLOAD] Upload summary: ${successful.length} succeeded, ${failed.length} failed`);

      if (failed.length > 0) {
        console.error('[CLAIM_DOCUMENT_UPLOAD] Failed uploads:', failed);
        // Show specific errors for failed uploads
        const errorMessages = failed.map(f => `${f.fileName}: ${f.error?.message || 'Unknown error'}`).join(', ');
        throw new Error(`Some documents failed to upload: ${errorMessages}`);
      }

      return successful;
    } catch (error) {
      console.error('[CLAIM_DOCUMENT_UPLOAD] Upload process failed:', error);
      throw error;
    }
  };

  const getRequiredDocuments = () => {
    if (claimType === 'health') {
      if (formData.claimCategory === 'cashless') {
        return [
          { id: 'pre-auth', name: 'Pre-Authorization Form', required: true },
          { id: 'hospital-id', name: 'Hospital ID Card', required: true },
          { id: 'policy-copy', name: 'Policy Copy', required: true },
          { id: 'id-proof', name: 'Photo ID Proof', required: true },
          { id: 'medical-reports', name: 'Medical Reports/Prescription', required: false }
        ];
      } else {
        return [
          { id: 'claim-form', name: 'Duly Filled Claim Form', required: true },
          { id: 'hospital-bills', name: 'Hospital Bills & Receipts', required: true },
          { id: 'discharge-summary', name: 'Discharge Summary', required: true },
          { id: 'medical-reports', name: 'Investigation Reports', required: true },
          { id: 'prescription', name: 'Doctor\'s Prescription', required: true },
          { id: 'payment-receipts', name: 'Payment Receipts', required: true },
          { id: 'id-proof', name: 'Photo ID Proof', required: true },
          { id: 'cancelled-cheque', name: 'Cancelled Cheque', required: true }
        ];
      }
    } else if (claimType === 'life') {
      return [
        { id: 'death-certificate', name: 'Death Certificate', required: true },
        { id: 'claimant-id', name: 'Claimant ID Proof', required: true },
        { id: 'claimant-address', name: 'Address Proof', required: true },
        { id: 'medical-records', name: 'Medical Records (if illness)', required: false },
        { id: 'fir-copy', name: 'FIR Copy (if accidental)', required: false },
        { id: 'post-mortem', name: 'Post Mortem Report (if applicable)', required: false },
        { id: 'bank-details', name: 'Cancelled Cheque/Bank Statement', required: true }
      ];
    } else if (claimType === 'car') {
      return [
        { id: 'claim-form', name: 'Duly Filled Claim Form', required: true },
        { id: 'policy-copy', name: 'Policy Copy', required: true },
        { id: 'rc-copy', name: 'RC Book Copy', required: true },
        { id: 'driving-license', name: 'Driving License', required: true },
        { id: 'fir-copy', name: 'FIR Copy', required: formData.policeComplaintFiled === 'yes' },
        { id: 'damage-photos', name: 'Vehicle Damage Photos', required: true },
        { id: 'repair-estimate', name: 'Repair Estimate/Invoice', required: true },
        { id: 'survey-report', name: 'Survey Report', required: false },
        { id: 'third-party-docs', name: 'Third Party Documents', required: formData.thirdPartyInvolved === 'yes' }
      ];
    }
    return [];
  };

  const handleNext = () => {
    // Validation
    if (step === 1 && (!claimType || !formData.selectedPolicy)) {
      toast.error('Please select claim type and policy');
      return;
    }

    if (step === 3) {
      if (!formData.incidentDate) {
        toast.error('Please provide incident date');
        return;
      }
      if (claimType === 'health' && !formData.hospitalName) {
        toast.error('Please provide hospital details');
        return;
      }
      if (claimType === 'car' && !formData.accidentType) {
        toast.error('Please provide accident details');
        return;
      }
      if (claimType === 'life' && !formData.dateOfDeath) {
        toast.error('Please provide death details');
        return;
      }
    }

    if (step === 4) {
      // Pre-step validation: Check if required documents are uploaded
      const requiredDocs = getRequiredDocuments().filter(d => d.required);
      const uploadedCategories = new Set(uploadedFiles.map(f => f.category));
      const missingDocs = requiredDocs.filter(d => !uploadedCategories.has(d.id));

      if (missingDocs.length > 0) {
        // Show which documents are missing with upload status
        const uploadedCount = uploadedFiles.filter(f => f.uploadedUrl && !f.error).length;
        const failedCount = uploadedFiles.filter(f => f.error).length;

        console.warn('[CLAIM_SUBMIT] Step 4 validation: Missing required documents');
        console.warn('[CLAIM_SUBMIT] Uploaded:', uploadedCount, 'Failed:', failedCount, 'Missing:', missingDocs.length);

        const errorMessage = `Please upload required documents before proceeding:\n\n` +
          `Missing: ${missingDocs.map(d => d.name).join(', ')}\n\n` +
          `Status: ${uploadedCount} uploaded, ${failedCount} failed`;

        toast.error(errorMessage, { duration: 5000 });
        return;
      }
    }

    if (step === 5) {
      if (!formData.claimantName || !formData.claimantPhone || !formData.claimantEmail) {
        toast.error('Please fill all required fields');
        return;
      }
    }

    if (step === 6) {
      if (!formData.accountNumber || !formData.ifscCode || !formData.accountHolderName) {
        toast.error('Please provide complete bank details');
        return;
      }
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        toast.error('Account numbers do not match');
        return;
      }
    }

    setStep(step + 1);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!claimType || !formData.selectedPolicy) {
      toast.error('Please select a policy');
      return;
    }

    if (!formData.claimantName || !formData.claimantPhone || !formData.claimantEmail) {
      toast.error('Please fill in all claimant details');
      return;
    }

    // Validate required documents are uploaded (files exist in uploadedFiles)
    const requiredDocs = getRequiredDocuments().filter(d => d.required);
    const uploadedCategories = new Set(uploadedFiles.map(f => f.category));
    const missingRequiredDocs = requiredDocs.filter(d => !uploadedCategories.has(d.id));

    if (missingRequiredDocs.length > 0) {
      // Show detailed error with upload status for each document
      const uploadedFilesList = uploadedFiles
        .filter(f => f.category && f.uploadedUrl)
        .map(f => ({ category: f.category, name: f.name, status: f.error ? 'Failed' : 'Uploaded' }));

      const missingDocNames = missingRequiredDocs.map(d => d.name);

      console.warn('[CLAIM_SUBMIT] Pre-submit validation: Missing required documents');
      console.warn('[CLAIM_SUBMIT] Required:', requiredDocs.map(d => ({ id: d.id, name: d.name })));
      console.warn('[CLAIM_SUBMIT] Uploaded:', uploadedFilesList);
      console.warn('[CLAIM_SUBMIT] Missing:', missingDocNames);

      const errorMessage = `Please upload all required documents:\n\n` +
        `Missing: ${missingDocNames.join(', ')}\n\n` +
        `Uploaded: ${uploadedFilesList.length} document(s)\n` +
        `Please upload the missing documents before submitting.`;

      toast.error(errorMessage, { duration: 6000 });
      return;
    }

    setIsSubmitting(true);

    // Declare applicationId at function scope so it's available in catch block
    let applicationId: string | undefined;

    try {
      // Get selected policy details from real policies
      const filteredPolicies = getPoliciesByType(claimType);
      const selectedPolicyObj = filteredPolicies.find(p =>
        String(p.policyId || p.id) === String(formData.selectedPolicy)
      );

      if (!selectedPolicyObj) {
        toast.error('Selected policy not found. Please select a valid policy.');
        setIsSubmitting(false);
        return;
      }

      // Extract the actual policy ID from backend response (policyId is the primary field)
      const actualPolicyId = selectedPolicyObj.policyId || selectedPolicyObj.id;

      if (!actualPolicyId) {
        toast.error('Invalid policy ID. Please select a valid policy.');
        setIsSubmitting(false);
        return;
      }

      const selectedPolicy = mapPolicyToUI(selectedPolicyObj);

      console.log('[CLAIM_SUBMIT] Selected policy:', {
        policyId: actualPolicyId,
        policyNumber: selectedPolicy.policyNumber,
        planName: selectedPolicy.name
      });

      // Build payload structure
      const payload: any = {
        user_id: user?.id || localStorage.getItem('userId'),
        userId: user?.id || localStorage.getItem('userId'), // Support both formats
        claim_type: claimType,
        policy_id: String(actualPolicyId), // Use actual policy ID from backend (policyId field)
        policyNumber: selectedPolicy?.policyNumber || selectedPolicyObj.policyNumber || null,
        insurance_application_id: selectedPolicyObj.applicationId, // Pre-linked ID from Policy
        status: 'submitted',

        // Intimation details
        intimation_date: formData.intimationDate,
        intimation_time: formData.intimationTime,

        // Incident details
        incident_details: {
          incident_date: formData.incidentDate,
          incident_time: formData.incidentTime,
          incident_location: formData.incidentLocation,
          incident_description: formData.incidentDescription
        },

        // Claimant information
        claimant_info: {
          name: formData.claimantName,
          phone: formData.claimantPhone,
          email: formData.claimantEmail,
          address: formData.claimantAddress,
          city: formData.claimantCity,
          pincode: formData.claimantPincode
        },

        // Bank details
        bank_details: {
          account_holder_name: formData.accountHolderName,
          account_number: formData.accountNumber,
          ifsc_code: formData.ifscCode,
          bank_name: formData.bankName,
          branch_name: formData.branchName,
          account_type: formData.accountType
        },

        // Type-specific details
        ...(claimType === 'health' && {
          hospitalization_details: {
            claim_category: formData.claimCategory,
            hospital_name: formData.hospitalName,
            hospital_address: formData.hospitalAddress,
            hospital_city: formData.hospitalCity,
            hospital_type: formData.hospitalType,
            admission_date: formData.admissionDate,
            discharge_date: formData.dischargeDate,
            treatment_type: formData.treatmentType,
            ailment: formData.ailment,
            room_type: formData.roomType,
            doctor_name: formData.doctorName,
            estimated_amount: formData.estimatedAmount,
            patient_name: formData.patientName,
            patient_age: formData.patientAge,
            patient_gender: formData.patientGender
          }
        }),

        ...(claimType === 'car' && {
          accident_details: {
            accident_type: formData.accidentType,
            vehicle_condition: formData.vehicleCondition,
            repair_workshop: formData.repairWorkshop,
            estimated_repair_cost: formData.estimatedRepairCost,
            police_complaint_filed: formData.policeComplaintFiled,
            fir_number: formData.firNumber,
            fir_date: formData.firDate,
            police_station: formData.policeStation,
            third_party_involved: formData.thirdPartyInvolved,
            third_party_details: formData.thirdPartyDetails,
            driver_name: formData.driverName,
            driver_license_number: formData.driverLicenseNumber,
            driver_relation: formData.driverRelation
          }
        }),

        ...(claimType === 'life' && {
          death_details: {
            deceased_name: formData.deceasedName,
            deceased_dob: formData.deceasedDOB,
            deceased_age: formData.deceasedAge,
            date_of_death: formData.dateOfDeath,
            time_of_death: formData.timeOfDeath,
            place_of_death: formData.placeOfDeath,
            cause_of_death: formData.causeOfDeath,
            death_type: formData.deathType,
            hospital_name: formData.hospitalNameDeath,
            claimant_relation: formData.claimantRelation
          }
        })

        // Documents will be added after upload (see below)
      };

      // Step 1: Create claim application first (to get application ID)
      console.log('[CLAIM_SUBMIT] Creating claim application...');

      try {
        const response = await createClaimApplication(payload);
        applicationId = response?.id;

        if (!applicationId) {
          throw new Error('Failed to create claim application. No application ID returned.');
        }

        console.log('[CLAIM_SUBMIT] ✅ Claim application created with ID:', applicationId);
      } catch (createError: any) {
        console.error('[CLAIM_SUBMIT] ❌ Failed to create claim application:', createError);
        throw new Error(`Failed to create claim application: ${createError?.message || 'Unknown error'}`);
      }

      // Step 2: Upload documents with claimId reference
      let uploadedDocs: Array<{
        filename: string;
        url: string;
        documentId: number | string | null;
        docType: string;
        category: string;
      }> = [];

      if (uploadedFiles.length > 0) {
        console.log(`[CLAIM_SUBMIT] Uploading ${uploadedFiles.length} document(s) with claimId: ${applicationId}...`);

        try {
          // Upload all files with the claim ID
          const uploadResults = await uploadAllFiles(applicationId);

          console.log(`[CLAIM_SUBMIT] Upload results:`, uploadResults);
          console.log(`[CLAIM_SUBMIT] Total results: ${uploadResults.length}, Expected: ${uploadedFiles.length}`);

          // Map upload results to document format with better error handling
          uploadedDocs = uploadResults
            .filter(result => {
              if (result === null) {
                console.warn('[CLAIM_SUBMIT] Filtered out null result');
                return false;
              }
              const hasUrl = !!(result.fileUrl || result.fileurl);
              if (!hasUrl) {
                console.warn('[CLAIM_SUBMIT] Filtered out result without fileUrl:', result);
              }
              return hasUrl;
            })
            .map(result => {
              // Get category from uploadedFiles state (it's stored there)
              const fileObj = uploadedFiles.find(f =>
                f.uploadedUrl === (result.fileUrl || result.fileurl) ||
                f.documentId === (result.documentId || result.document_id)
              );

              const doc = {
                filename: result.fileName || result.filename || 'unknown',
                url: result.fileUrl || result.fileurl || '',
                documentId: result.documentId || result.document_id || null,
                docType: 'claim_document',
                category: fileObj?.category || result.category || 'other'  // Use category from fileObj if available
              };

              console.log(`[CLAIM_SUBMIT] Mapped document:`, doc);
              console.log(`[CLAIM_SUBMIT]   Category source: ${fileObj?.category ? 'fileObj' : 'result'}`);

              return doc;
            });

          console.log(`[CLAIM_SUBMIT] Successfully uploaded ${uploadedDocs.length}/${uploadedFiles.length} documents`);
          console.log(`[CLAIM_SUBMIT] Uploaded categories:`, Array.from(new Set(uploadedDocs.map(d => d.category))));
          console.log(`[CLAIM_SUBMIT] Required document IDs:`, requiredDocs.map(d => d.id));

          // Validate that all required documents uploaded successfully
          const uploadedCategories = new Set(uploadedDocs.map(d => d.category));
          const missingRequiredUploads = requiredDocs.filter(d => !uploadedCategories.has(d.id));

          if (missingRequiredUploads.length > 0) {
            // Create detailed error message with upload status
            const uploadedFileNames = uploadedDocs.map(d => d.filename).filter(Boolean);
            const missingDocNames = missingRequiredUploads.map(d => d.name);

            console.error('[CLAIM_SUBMIT] Required documents validation failed');
            console.error('[CLAIM_SUBMIT] Uploaded categories:', Array.from(uploadedCategories));
            console.error('[CLAIM_SUBMIT] Required document IDs:', requiredDocs.map(d => d.id));
            console.error('[CLAIM_SUBMIT] Missing required documents:', missingDocNames);
            console.error('[CLAIM_SUBMIT] Successfully uploaded files:', uploadedFileNames);
            console.error('[CLAIM_SUBMIT] Upload status summary:', {
              totalRequired: requiredDocs.length,
              uploaded: uploadedDocs.length,
              missing: missingRequiredUploads.length,
              uploadedCategories: Array.from(uploadedCategories),
              requiredCategories: requiredDocs.map(d => d.id)
            });

            // Show detailed error with upload status
            const errorMessage = `Required documents missing or failed to upload:\n\n` +
              `Missing: ${missingDocNames.join(', ')}\n\n` +
              `Uploaded: ${uploadedFileNames.length} file(s)\n` +
              `Please ensure all required documents are uploaded before submitting.`;

            toast.error(errorMessage, { duration: 8000 });
            setIsSubmitting(false);
            return; // Stop submission if required documents failed
          }
        } catch (uploadError: any) {
          console.error('[CLAIM_SUBMIT] Document upload failed:', uploadError);
          toast.error('Document upload failed. Please try again.');
          setIsSubmitting(false);
          return; // Stop submission on upload failure
        }
      } else {
        // No files to upload, but check if required documents were expected
        if (requiredDocs.length > 0) {
          toast.warning('No documents selected for upload, but some documents may be required. Continuing with claim submission.');
        }
      }

      // Step 3: Update claim application with document URLs
      if (uploadedDocs.length > 0) {
        console.log('[CLAIM_SUBMIT] Updating claim application with document URLs...');
        console.log('[CLAIM_SUBMIT] Documents to save:', uploadedDocs.map(d => ({
          filename: d.filename,
          url: d.url.substring(0, 100) + '...',
          documentId: d.documentId,
          docType: d.docType,
          category: d.category
        })));

        // Verify all documents have required fields
        const documentsWithMissingFields = uploadedDocs.filter(doc =>
          !doc.filename || !doc.url || !doc.docType || !doc.category
        );

        if (documentsWithMissingFields.length > 0) {
          console.warn('[CLAIM_SUBMIT] ⚠️  Some documents missing required fields:', documentsWithMissingFields);
        }

        // Verify URLs are Azure Blob Storage URLs
        const nonAzureUrls = uploadedDocs.filter(doc =>
          doc.url && !doc.url.includes('blob.core.windows.net')
        );

        if (nonAzureUrls.length > 0) {
          console.warn('[CLAIM_SUBMIT] ⚠️  Some documents do not have Azure URLs:', nonAzureUrls.map(d => d.filename));
        } else {
          console.log('[CLAIM_SUBMIT] ✅ All documents have Azure Blob Storage URLs');
        }

        try {
          const updatePayload = {
            documents: uploadedDocs,
            status: 'submitted' // Ensure status is set
          };

          console.log('[CLAIM_SUBMIT] Sending update payload to MongoDB...');
          const updateResponse = await updateClaimApplication(applicationId, updatePayload);

          console.log('[CLAIM_SUBMIT] ✅ Claim application updated with documents');
          console.log('[CLAIM_SUBMIT] Update response:', updateResponse);
          console.log(`[CLAIM_SUBMIT] Saved ${uploadedDocs.length} document(s) to MongoDB`);

          // Log each document that was saved
          uploadedDocs.forEach((doc, idx) => {
            console.log(`[CLAIM_SUBMIT] Document ${idx + 1} saved:`, {
              filename: doc.filename,
              url: doc.url.substring(0, 80) + '...',
              documentId: doc.documentId,
              category: doc.category,
              isAzureUrl: doc.url.includes('blob.core.windows.net')
            });
          });

        } catch (updateError: any) {
          console.error('[CLAIM_SUBMIT] ❌ Failed to update claim application with documents:', updateError);
          console.error('[CLAIM_SUBMIT] Error details:', {
            message: updateError?.message,
            status: updateError?.response?.status,
            data: updateError?.response?.data
          });
          // Non-critical error - documents are uploaded, just metadata update failed
          toast.warning('Claim submitted, but document metadata update failed. Documents are uploaded.');
        }
      } else {
        console.warn('[CLAIM_SUBMIT] ⚠️  No documents to save to MongoDB');
      }

      // Step 4: Show success and move to confirmation
      console.log('[CLAIM_SUBMIT] ✅ Claim submission successful, moving to step 8');
      console.log('[CLAIM_SUBMIT] Application ID:', applicationId);
      console.log('[CLAIM_SUBMIT] Claim Type:', claimType);
      console.log('[CLAIM_SUBMIT] Selected Policy:', selectedPolicy);

      // Set claim number before navigating to step 8
      setClaimNumber(applicationId); // Use application ID as claim number

      // Ensure step 8 is reached - use setTimeout to ensure state updates are applied
      setTimeout(() => {
        console.log('[CLAIM_SUBMIT] Setting step to 8');
        setStep(8); // Confirmation step
        toast.success('Claim submitted successfully! Your claim is submitted and is in process.');
      }, 100);

    } catch (error: any) {
      console.error('[CLAIM_SUBMIT] ❌ Error submitting claim:', error);
      console.error('[CLAIM_SUBMIT] Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });

      // Even on error, if we have an applicationId, show success page
      // This handles cases where claim was created but something else failed
      if (applicationId) {
        console.log('[CLAIM_SUBMIT] ⚠️  Error occurred but claim was created, showing success page');
        setClaimNumber(applicationId);
        setTimeout(() => {
          setStep(8);
          toast.warning('Claim submitted, but some operations may have failed. Please check your claim status.');
        }, 100);
      } else {
        toast.error(error?.message || 'Failed to submit claim. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected policy from real policies for display
  const filteredPolicies = claimType ? getPoliciesByType(claimType) : [];
  const selectedPolicyObj = filteredPolicies.find(p =>
    String(p.id || p.policyId) === String(formData.selectedPolicy)
  );
  const selectedPolicy = selectedPolicyObj ? mapPolicyToUI(selectedPolicyObj) : null;

  return (
    <div className="pt-[70px] min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl mb-3">Submit Insurance Claim</h1>
            <p className="text-xl text-blue-100">Quick & hassle-free claim submission process</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Progress Steps */}
        {step <= 7 && (
          <div className="mb-12">
            <div className="max-w-5xl mx-auto">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    Step {step} of 7
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {Math.round((step / 7) * 100)}% Complete
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 7) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Step Indicators */}
              <div className="relative">
                <div className="flex justify-between items-start">
                  {steps.map((s, idx) => {
                    const isCompleted = step > s.num;
                    const isActive = step === s.num;
                    const isPending = step < s.num;

                    return (
                      <div key={s.num} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
                        <motion.div
                          initial={false}
                          animate={{ scale: isActive ? 1.1 : 1 }}
                          className="relative z-10 mb-3"
                        >
                          <div
                            className={`
                              w-12 h-12 rounded-full flex items-center justify-center transition-all
                              ${isCompleted ? 'bg-green-500 shadow-lg' : ''}
                              ${isActive ? 'bg-blue-600 shadow-xl ring-4 ring-blue-100' : ''}
                              ${isPending ? 'bg-gray-200' : ''}
                            `}
                          >
                            {isCompleted ? (
                              <Check className="w-6 h-6 text-white" strokeWidth={3} />
                            ) : (
                              <s.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                            )}
                          </div>
                        </motion.div>

                        <div className="text-center px-1">
                          <div className={`
                            text-xs
                            ${isActive ? 'text-blue-600 font-semibold' : ''}
                            ${isCompleted ? 'text-green-600' : ''}
                            ${isPending ? 'text-gray-500' : ''}
                          `}>
                            {s.title}
                          </div>
                        </div>

                        {idx < steps.length - 1 && (
                          <div
                            className="absolute top-6 left-1/2 h-0.5 bg-gray-300"
                            style={{
                              width: `calc(100% / ${steps.length})`,
                              transform: 'translateX(-50%)',
                              marginLeft: `calc(100% / ${steps.length} / 2)`
                            }}
                          >
                            <motion.div
                              className="h-full bg-green-500"
                              initial={{ width: 0 }}
                              animate={{ width: step > s.num ? '100%' : '0%' }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Select Policy */}
            {step === 1 && (
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Claim Type</CardTitle>
                    <CardDescription>Choose the type of insurance claim you want to file</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingPolicies && !claimType && (
                      <div className="text-center py-4 mb-4">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                        <p className="text-xs text-muted-foreground">Loading your policies...</p>
                      </div>
                    )}
                    {policiesError && !claimType && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {policiesError}
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { type: 'health', icon: Heart, label: 'Health Insurance', color: 'blue', desc: 'Hospitalization & medical expenses' },
                        { type: 'life', icon: Activity, label: 'Life Insurance', color: 'purple', desc: 'Death claim settlement' },
                        { type: 'car', icon: Car, label: 'Car Insurance', color: 'orange', desc: 'Vehicle damage or theft' }
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <Card
                            key={item.type}
                            className={`cursor-pointer transition-all hover:shadow-xl ${claimType === item.type ? 'ring-2 ring-blue-600 bg-blue-50' : ''
                              } ${loadingPolicies ? 'opacity-75 cursor-wait' : ''}`}
                            onClick={() => {
                              if (!loadingPolicies) {
                                setClaimType(item.type as any);
                                setFormData({ ...formData, selectedPolicy: '' });
                              }
                            }}
                          >
                            <CardContent className="p-6 text-center">
                              <Icon className={`w-14 h-14 mx-auto mb-3 ${claimType === item.type ? 'text-blue-600' : 'text-gray-400'
                                }`} />
                              <h3 className="text-lg mb-2">{item.label}</h3>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                              {claimType === item.type && (
                                <Badge className="mt-3 bg-blue-600">Selected</Badge>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {claimType && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Select Policy</CardTitle>
                        <CardDescription>Choose the policy for which you want to file a claim</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {loadingPolicies ? (
                          <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                            <p className="text-sm text-muted-foreground">Loading policies...</p>
                          </div>
                        ) : policiesError ? (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {policiesError}
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={async () => {
                                  const userId = user?.id || localStorage.getItem('userId');
                                  if (userId) {
                                    try {
                                      setLoadingPolicies(true);
                                      setPoliciesError(null);
                                      const policiesData = await getUserPolicies(userId);
                                      const policiesArray = Array.isArray(policiesData) ? policiesData : [];
                                      setPolicies(policiesArray);
                                    } catch (error: any) {
                                      setPoliciesError(error?.message || 'Failed to load policies');
                                      toast.error('Failed to load policies');
                                    } finally {
                                      setLoadingPolicies(false);
                                    }
                                  }
                                }}
                              >
                                Retry
                              </Button>
                            </AlertDescription>
                          </Alert>
                        ) : getPoliciesByType(claimType).length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-lg mb-2">No policies available</p>
                            <p className="text-sm">No {claimType} policies found for your account.</p>
                            <p className="text-sm mt-2">Please purchase a policy or contact support.</p>
                          </div>
                        ) : (
                          getPoliciesByType(claimType).map((policy) => {
                            const uiPolicy = mapPolicyToUI(policy);
                            const policyId = String(policy.id || policy.policyId || '');

                            return (
                              <Card
                                key={policyId}
                                className={`cursor-pointer transition-all hover:shadow-lg ${formData.selectedPolicy === policyId ? 'ring-2 ring-blue-600 bg-blue-50' : ''
                                  }`}
                                onClick={() => setFormData({ ...formData, selectedPolicy: policyId })}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold">{uiPolicy.name}</h4>
                                        {formData.selectedPolicy === policyId && (
                                          <Check className="w-5 h-5 text-blue-600" />
                                        )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                        <p>Policy: {uiPolicy.policyNumber}</p>
                                        <p>Sum Insured: {uiPolicy.sumInsured}</p>
                                        {uiPolicy.vehicle && (
                                          <p>Vehicle: {uiPolicy.vehicle}</p>
                                        )}
                                        <p>Insurer: {uiPolicy.insurer}</p>
                                      </div>
                                      <Badge variant="secondary" className="mt-2">
                                        Valid till: {uiPolicy.expiryDate}
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 2: Claim Intimation */}
            {step === 2 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Claim Intimation</CardTitle>
                    <CardDescription>Important: Intimate your claim as soon as possible</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert className="bg-orange-50 border-orange-200">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription>
                        <strong>Important:</strong> For health claims, intimate within 24 hours of hospitalization. For car claims, intimate within 24-48 hours of incident.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Intimation Date *</Label>
                        <Input
                          type="date"
                          value={formData.intimationDate}
                          onChange={(e) => setFormData({ ...formData, intimationDate: e.target.value })}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Intimation Time *</Label>
                        <Input
                          type="time"
                          value={formData.intimationTime}
                          onChange={(e) => setFormData({ ...formData, intimationTime: e.target.value })}
                        />
                      </div>
                    </div>

                    {claimType === 'health' && (
                      <div className="space-y-2">
                        <Label>Claim Category *</Label>
                        <RadioGroup value={formData.claimCategory} onValueChange={(value) => setFormData({ ...formData, claimCategory: value })}>
                          <div className="grid grid-cols-2 gap-4">
                            <Card className={`cursor-pointer ${formData.claimCategory === 'cashless' ? 'ring-2 ring-blue-600' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <RadioGroupItem value="cashless" id="cashless" />
                                  <Label htmlFor="cashless" className="cursor-pointer flex-1">
                                    <div>
                                      <div className="font-semibold">Cashless</div>
                                      <div className="text-sm text-muted-foreground">Network hospital</div>
                                    </div>
                                  </Label>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className={`cursor-pointer ${formData.claimCategory === 'reimbursement' ? 'ring-2 ring-blue-600' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <RadioGroupItem value="reimbursement" id="reimbursement" />
                                  <Label htmlFor="reimbursement" className="cursor-pointer flex-1">
                                    <div>
                                      <div className="font-semibold">Reimbursement</div>
                                      <div className="text-sm text-muted-foreground">Any hospital</div>
                                    </div>
                                  </Label>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold mb-1">Quick Tips:</p>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Keep all original bills and documents ready</li>
                            <li>• Take clear photos of all documents</li>
                            <li>• Inform your insurer before admission (for planned procedures)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Incident Details */}
            {step === 3 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {claimType === 'health' && 'Hospitalization Details'}
                      {claimType === 'life' && 'Death Details'}
                      {claimType === 'car' && 'Accident Details'}
                    </CardTitle>
                    <CardDescription>Provide complete information about the incident</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          {claimType === 'health' && 'Admission Date *'}
                          {claimType === 'life' && 'Date of Death *'}
                          {claimType === 'car' && 'Accident Date *'}
                        </Label>
                        <Input
                          type="date"
                          value={formData.incidentDate}
                          onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={formData.incidentTime}
                          onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Health Insurance Specific */}
                    {claimType === 'health' && (
                      <>
                        <div className="space-y-2">
                          <Label>Hospital Name *</Label>
                          <Input
                            placeholder="Enter hospital name"
                            value={formData.hospitalName}
                            onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Hospital City *</Label>
                            <Input
                              placeholder="Enter city"
                              value={formData.hospitalCity}
                              onChange={(e) => setFormData({ ...formData, hospitalCity: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Hospital Type</Label>
                            <Select value={formData.hospitalType} onValueChange={(value) => setFormData({ ...formData, hospitalType: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="network">Network Hospital</SelectItem>
                                <SelectItem value="non-network">Non-Network Hospital</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Treatment Type *</Label>
                            <Select value={formData.treatmentType} onValueChange={(value) => setFormData({ ...formData, treatmentType: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planned">Planned Hospitalization</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                                <SelectItem value="daycare">Daycare Procedure</SelectItem>
                                <SelectItem value="surgery">Surgery</SelectItem>
                                <SelectItem value="maternity">Maternity</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Room Type</Label>
                            <Select value={formData.roomType} onValueChange={(value) => setFormData({ ...formData, roomType: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select room type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General Ward</SelectItem>
                                <SelectItem value="semi-private">Semi-Private</SelectItem>
                                <SelectItem value="private">Private Room</SelectItem>
                                <SelectItem value="icu">ICU</SelectItem>
                                <SelectItem value="deluxe">Deluxe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Ailment/Disease/Injury *</Label>
                          <Textarea
                            placeholder="Describe the illness or injury"
                            value={formData.ailment}
                            onChange={(e) => setFormData({ ...formData, ailment: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Discharge Date (if known)</Label>
                            <Input
                              type="date"
                              value={formData.dischargeDate}
                              onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Estimated Amount (₹)</Label>
                            <Input
                              type="number"
                              placeholder="Estimated treatment cost"
                              value={formData.estimatedAmount}
                              onChange={(e) => setFormData({ ...formData, estimatedAmount: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Treating Doctor Name</Label>
                          <Input
                            placeholder="Doctor's name"
                            value={formData.doctorName}
                            onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {/* Car Insurance Specific */}
                    {claimType === 'car' && (
                      <>
                        <div className="space-y-2">
                          <Label>Accident Type *</Label>
                          <Select value={formData.accidentType} onValueChange={(value) => setFormData({ ...formData, accidentType: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select accident type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="collision">Collision with another vehicle</SelectItem>
                              <SelectItem value="self">Self accident (no third party)</SelectItem>
                              <SelectItem value="theft">Theft/Break-in</SelectItem>
                              <SelectItem value="fire">Fire</SelectItem>
                              <SelectItem value="natural">Natural calamity</SelectItem>
                              <SelectItem value="vandalism">Vandalism/Riots</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Accident Location *</Label>
                          <Textarea
                            placeholder="Enter complete address where accident occurred"
                            value={formData.incidentLocation}
                            onChange={(e) => setFormData({ ...formData, incidentLocation: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Was police complaint filed? *</Label>
                          <RadioGroup value={formData.policeComplaintFiled} onValueChange={(value) => setFormData({ ...formData, policeComplaintFiled: value })}>
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="police-yes" />
                                <Label htmlFor="police-yes">Yes</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="police-no" />
                                <Label htmlFor="police-no">No</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        {formData.policeComplaintFiled === 'yes' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Police Station Name</Label>
                                <Input
                                  placeholder="Police station"
                                  value={formData.policeStation}
                                  onChange={(e) => setFormData({ ...formData, policeStation: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>FIR Number</Label>
                                <Input
                                  placeholder="FIR number"
                                  value={formData.firNumber}
                                  onChange={(e) => setFormData({ ...formData, firNumber: e.target.value })}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <div className="space-y-2">
                          <Label>Third party involved? *</Label>
                          <RadioGroup value={formData.thirdPartyInvolved} onValueChange={(value) => setFormData({ ...formData, thirdPartyInvolved: value })}>
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="third-yes" />
                                <Label htmlFor="third-yes">Yes</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="third-no" />
                                <Label htmlFor="third-no">No</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        {formData.thirdPartyInvolved === 'yes' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                          >
                            <Label>Third Party Details</Label>
                            <Textarea
                              placeholder="Name, contact, vehicle details of third party"
                              value={formData.thirdPartyDetails}
                              onChange={(e) => setFormData({ ...formData, thirdPartyDetails: e.target.value })}
                              rows={3}
                            />
                          </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Driver Name *</Label>
                            <Input
                              placeholder="Name of driver at time of accident"
                              value={formData.driverName}
                              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Driver License Number *</Label>
                            <Input
                              placeholder="DL number"
                              value={formData.driverLicenseNumber}
                              onChange={(e) => setFormData({ ...formData, driverLicenseNumber: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Vehicle Condition</Label>
                          <Select value={formData.vehicleCondition} onValueChange={(value) => setFormData({ ...formData, vehicleCondition: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="driveable">Driveable</SelectItem>
                              <SelectItem value="towing">Needs towing</SelectItem>
                              <SelectItem value="total-loss">Total loss</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Estimated Repair Cost (₹)</Label>
                          <Input
                            type="number"
                            placeholder="Approximate repair cost"
                            value={formData.estimatedRepairCost}
                            onChange={(e) => setFormData({ ...formData, estimatedRepairCost: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {/* Life Insurance Specific */}
                    {claimType === 'life' && (
                      <>
                        <div className="space-y-2">
                          <Label>Deceased Name *</Label>
                          <Input
                            placeholder="Full name of the deceased"
                            value={formData.deceasedName}
                            onChange={(e) => setFormData({ ...formData, deceasedName: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input
                              type="date"
                              value={formData.deceasedDOB}
                              onChange={(e) => setFormData({ ...formData, deceasedDOB: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Date of Death *</Label>
                            <Input
                              type="date"
                              value={formData.dateOfDeath}
                              onChange={(e) => setFormData({ ...formData, dateOfDeath: e.target.value })}
                              max={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Time of Death</Label>
                            <Input
                              type="time"
                              value={formData.timeOfDeath}
                              onChange={(e) => setFormData({ ...formData, timeOfDeath: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Place of Death *</Label>
                          <Textarea
                            placeholder="Enter complete address"
                            value={formData.placeOfDeath}
                            onChange={(e) => setFormData({ ...formData, placeOfDeath: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Type of Death *</Label>
                          <Select value={formData.deathType} onValueChange={(value) => setFormData({ ...formData, deathType: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="natural">Natural Death</SelectItem>
                              <SelectItem value="illness">Due to Illness</SelectItem>
                              <SelectItem value="accidental">Accidental Death</SelectItem>
                              <SelectItem value="suicide">Suicide (after 1 year of policy)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Cause of Death *</Label>
                          <Textarea
                            placeholder="Describe the cause of death in detail"
                            value={formData.causeOfDeath}
                            onChange={(e) => setFormData({ ...formData, causeOfDeath: e.target.value })}
                            rows={4}
                          />
                        </div>

                        {formData.deathType === 'illness' && (
                          <div className="space-y-2">
                            <Label>Hospital Name (if applicable)</Label>
                            <Input
                              placeholder="Hospital where treatment was given"
                              value={formData.hospitalNameDeath}
                              onChange={(e) => setFormData({ ...formData, hospitalNameDeath: e.target.value })}
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Claimant's Relation to Deceased *</Label>
                          <Select value={formData.claimantRelation} onValueChange={(value) => setFormData({ ...formData, claimantRelation: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select relation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spouse">Spouse</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="sibling">Sibling</SelectItem>
                              <SelectItem value="nominee">Nominee</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>Additional Information</Label>
                      <Textarea
                        placeholder="Any other relevant details"
                        value={formData.incidentDescription}
                        onChange={(e) => setFormData({ ...formData, incidentDescription: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Upload Documents */}
            {step === 4 && (
              <div className="max-w-4xl mx-auto space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong>Document Guidelines:</strong> Upload clear, legible copies. PDF or JPG format accepted. Maximum 10MB per file.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>Required Documents</CardTitle>
                    <CardDescription>Please upload all mandatory documents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {getRequiredDocuments().map((doc) => {
                        const uploaded = uploadedFiles.filter(f => f.category === doc.id);
                        return (
                          <div key={doc.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{doc.name}</h4>
                                    {doc.required && (
                                      <Badge variant="destructive" className="text-xs">Required</Badge>
                                    )}
                                    {uploaded.length > 0 && (
                                      <Badge className="bg-green-500 text-xs">
                                        <Check className="w-3 h-3 mr-1" />
                                        Uploaded
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`upload-${doc.id}`)?.click()}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                              </Button>
                              <input
                                id={`upload-${doc.id}`}
                                type="file"
                                multiple
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e.target.files, doc.id)}
                              />
                            </div>

                            {/* Uploaded Files Preview */}
                            {uploaded.length > 0 && (
                              <div className="mt-3 space-y-3">
                                {uploaded.map((file) => {
                                  // Find the file in uploadedFiles array to get upload status
                                  const fileObj = uploadedFiles.find(f => f.id === file.id);
                                  if (!fileObj) return null;

                                  // Determine status and styling based on file state
                                  const isUploading = fileObj.uploading || false;
                                  const isSuccess = fileObj.uploadedUrl && !fileObj.error;
                                  const isError = fileObj.error && !fileObj.uploading;
                                  const isPending = !isUploading && !isSuccess && !isError;

                                  // Dynamic styling based on status
                                  const bgColor = isError
                                    ? 'bg-red-50 border-red-200'
                                    : isSuccess
                                      ? 'bg-green-50 border-green-200'
                                      : isUploading
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-gray-50 border-gray-200';

                                  const iconColor = isError
                                    ? 'text-red-600'
                                    : isSuccess
                                      ? 'text-green-600'
                                      : isUploading
                                        ? 'text-blue-600'
                                        : 'text-gray-400';

                                  const progressColor = isError
                                    ? 'bg-red-500'
                                    : isSuccess
                                      ? 'bg-green-500'
                                      : 'bg-blue-500';

                                  const progress = fileObj.progress || 0;

                                  return (
                                    <div key={file.id} className={`flex items-start gap-3 p-3 border rounded-lg ${bgColor} transition-colors`}>
                                      {/* Status Icon */}
                                      <div className={iconColor} style={{ marginTop: '2px' }}>
                                        {isUploading ? (
                                          <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : isSuccess ? (
                                          <CheckCircle className="w-5 h-5" />
                                        ) : isError ? (
                                          <AlertCircle className="w-5 h-5" />
                                        ) : (
                                          <FileCheck className="w-5 h-5" />
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {file.preview ? (
                                              <img src={file.preview} alt={file.name} className="w-10 h-10 object-cover rounded" />
                                            ) : (
                                              <FileText className="w-10 h-10 text-gray-400 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium truncate" title={file.name}>
                                                {file.name}
                                              </p>
                                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {!isUploading && (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(file.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                title="Remove file"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            )}
                                          </div>
                                        </div>

                                        {/* Progress Bar - Show if uploading or has progress */}
                                        {(isUploading || isSuccess || isError) && (
                                          <div className="mt-2">
                                            <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
                                              <div
                                                className={`h-2 transition-all duration-300 ${progressColor}`}
                                                style={{ width: `${progress}%` }}
                                              />
                                            </div>
                                            <div className="flex items-center justify-between text-xs mt-1">
                                              <span className={isError ? 'text-red-600' : isSuccess ? 'text-green-600' : 'text-blue-600'}>
                                                {isUploading ? `📤 Uploading to Azure... ${progress}%` : isSuccess ? '✅ Uploaded to Azure' : isError ? '❌ Upload failed' : '📄 Ready'}
                                              </span>
                                              {fileObj.error && (
                                                <span className="text-red-600 font-medium truncate ml-2" title={fileObj.error}>
                                                  {fileObj.error}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Status text - Show for all states */}
                                        <p className={`text-xs mt-1 ${isUploading ? 'text-blue-600 font-medium' :
                                          isSuccess ? 'text-green-600 font-medium' :
                                            isError ? 'text-red-600 font-medium' :
                                              'text-gray-500'
                                          }`}>
                                          {isUploading ? `📤 Uploading to Azure... ${progress}%` :
                                            isSuccess ? '✅ Uploaded to Azure successfully' :
                                              isError ? `❌ Upload failed: ${fileObj.error}` :
                                                '📄 Ready to upload'}
                                        </p>
                                      </div>

                                      {/* Action Button - Show retry for errors */}
                                      {isError && (
                                        <div className="flex flex-col gap-2">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                              const idx = uploadedFiles.findIndex(f => f.id === file.id);
                                              if (idx !== -1) {
                                                await uploadFileAtIndex(idx);
                                              }
                                            }}
                                            className="text-xs h-8"
                                          >
                                            Retry
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 5: Claimant/Patient Info */}
            {step === 5 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {claimType === 'health' ? 'Patient Information' : 'Claimant Information'}
                    </CardTitle>
                    <CardDescription>Contact details for claim processing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {claimType === 'health' && (
                      <>
                        <div className="space-y-2">
                          <Label>Patient Name *</Label>
                          <Input
                            placeholder="Full name of patient"
                            value={formData.patientName}
                            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Patient Age *</Label>
                            <Input
                              type="number"
                              placeholder="Age"
                              value={formData.patientAge}
                              onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Patient Gender *</Label>
                            <Select value={formData.patientGender} onValueChange={(value) => setFormData({ ...formData, patientGender: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>Claimant Name *</Label>
                      <Input
                        placeholder="Full name"
                        value={formData.claimantName}
                        onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mobile Number *</Label>
                        <Input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={formData.claimantPhone}
                          onChange={(e) => setFormData({ ...formData, claimantPhone: e.target.value })}
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address *</Label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.claimantEmail}
                          onChange={(e) => setFormData({ ...formData, claimantEmail: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address *</Label>
                      <Textarea
                        placeholder="Complete address"
                        value={formData.claimantAddress}
                        onChange={(e) => setFormData({ ...formData, claimantAddress: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City *</Label>
                        <Input
                          placeholder="City"
                          value={formData.claimantCity}
                          onChange={(e) => setFormData({ ...formData, claimantCity: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pincode *</Label>
                        <Input
                          placeholder="6-digit pincode"
                          value={formData.claimantPincode}
                          onChange={(e) => setFormData({ ...formData, claimantPincode: e.target.value })}
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 6: Bank Details */}
            {step === 6 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Bank Account Details</CardTitle>
                    <CardDescription>Claim amount will be transferred to this account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription>
                        Account must be in the name of policy holder or claimant. Please attach cancelled cheque.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label>Account Holder Name *</Label>
                      <Input
                        placeholder="As per bank records"
                        value={formData.accountHolderName}
                        onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Account Number *</Label>
                        <Input
                          type="text"
                          placeholder="Enter account number"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm Account Number *</Label>
                        <Input
                          type="text"
                          placeholder="Re-enter account number"
                          value={formData.confirmAccountNumber}
                          onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>IFSC Code *</Label>
                        <Input
                          placeholder="e.g., SBIN0001234"
                          value={formData.ifscCode}
                          onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                          className="uppercase"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Type</Label>
                        <Select value={formData.accountType} onValueChange={(value) => setFormData({ ...formData, accountType: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="savings">Savings</SelectItem>
                            <SelectItem value="current">Current</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input
                          placeholder="Bank name"
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Branch Name</Label>
                        <Input
                          placeholder="Branch name"
                          value={formData.branchName}
                          onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 7: Review & Submit */}
            {step === 7 && (
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Claim</CardTitle>
                    <CardDescription>Please verify all details before submission</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Policy Details */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Policy Details
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Policy Number:</span>
                          <span className="font-medium">{selectedPolicy?.policyNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Policy Name:</span>
                          <span className="font-medium">{selectedPolicy?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sum Insured:</span>
                          <span className="font-medium">{selectedPolicy?.sumInsured}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Insurer:</span>
                          <span className="font-medium">{selectedPolicy?.insurer}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Incident Details */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        Incident Details
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{formData.incidentDate}</span>
                        </div>
                        {claimType === 'health' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Hospital:</span>
                              <span className="font-medium">{formData.hospitalName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Treatment Type:</span>
                              <span className="font-medium">{formData.treatmentType}</span>
                            </div>
                          </>
                        )}
                        {claimType === 'car' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Accident Type:</span>
                              <span className="font-medium">{formData.accidentType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Police Complaint:</span>
                              <span className="font-medium">{formData.policeComplaintFiled === 'yes' ? 'Yes' : 'No'}</span>
                            </div>
                          </>
                        )}
                        {claimType === 'life' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Deceased:</span>
                              <span className="font-medium">{formData.deceasedName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date of Death:</span>
                              <span className="font-medium">{formData.dateOfDeath}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Documents */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-600" />
                        Uploaded Documents ({uploadedFiles.length})
                      </h3>
                      <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="flex-1">{file.name}</span>
                            <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Claimant Details */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Claimant Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{formData.claimantName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{formData.claimantPhone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{formData.claimantEmail}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Bank Details */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Bank Details
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Holder:</span>
                          <span className="font-medium">{formData.accountHolderName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Number:</span>
                          <span className="font-medium">XXXX{formData.accountNumber.slice(-4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">IFSC Code:</span>
                          <span className="font-medium">{formData.ifscCode}</span>
                        </div>
                      </div>
                    </div>

                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        <strong>Declaration:</strong> I hereby declare that the information provided is true and correct to the best of my knowledge. I understand that any false information may result in claim rejection.
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                        I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</a> and confirm that all information provided is accurate.
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 8: Confirmation */}
            {step === 8 && (
              <div className="max-w-3xl mx-auto">
                {(() => {
                  // Log for debugging
                  console.log('[CLAIM_SUCCESS_PAGE] Rendering step 8 success page');
                  console.log('[CLAIM_SUCCESS_PAGE] Claim Number:', claimNumber);
                  console.log('[CLAIM_SUCCESS_PAGE] Claim Type:', claimType);
                  console.log('[CLAIM_SUCCESS_PAGE] Selected Policy:', selectedPolicy);

                  return (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center mb-8"
                    >
                      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-16 h-16 text-white" />
                      </div>
                      <h1 className="text-4xl mb-3">Claim Submitted Successfully!</h1>
                      <p className="text-xl text-muted-foreground">
                        Your claim is submitted and is in process
                      </p>
                    </motion.div>
                  );
                })()}

                <Card className="mb-6">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
                    <CardTitle>Claim Details</CardTitle>
                    <CardDescription className="text-blue-100">Please save these details for future reference</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-muted-foreground">Claim Number</Label>
                        <p className="text-2xl font-bold text-blue-600">
                          {claimNumber || 'Processing...'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Claim Type</Label>
                        <p className="text-xl font-semibold capitalize">
                          {claimType ? `${claimType} Insurance` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Policy Number</Label>
                        <p className="font-semibold">
                          {selectedPolicy?.policyNumber || formData.selectedPolicy || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Submission Date</Label>
                        <p className="font-semibold">{new Date().toLocaleDateString('en-IN')}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <Badge className="bg-blue-500">Under Review</Badge>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Contact</Label>
                        <p className="font-semibold">
                          {formData.claimantPhone || formData.claimantEmail || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="flex flex-col md:flex-row gap-3">
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/claims/track')}>
                        <Clock className="w-4 h-4 mr-2" />
                        Track Claim Status
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download Receipt
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong>What's Next?</strong> Our team will review your claim within 48 hours. You'll receive updates via SMS and email. Claim reference number has been sent to {formData.claimantEmail}.
                  </AlertDescription>
                </Alert>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold mb-2">Expected Timeline:</p>
                        <ul className="space-y-1 text-muted-foreground">
                          {claimType === 'health' && (
                            <>
                              <li>• Cashless: Pre-authorization in 2-4 hours</li>
                              <li>• Reimbursement: Settlement in 7-15 days</li>
                            </>
                          )}
                          {claimType === 'car' && (
                            <>
                              <li>• Survey within 24-48 hours</li>
                              <li>• Approval in 3-7 days</li>
                            </>
                          )}
                          {claimType === 'life' && (
                            <>
                              <li>• Document verification: 7-10 days</li>
                              <li>• Final settlement: 15-30 days</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Another Claim
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step > 1 && step < 8 && (
          <div className="flex items-center justify-between max-w-4xl mx-auto mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {step < 7 ? (
              <Button
                onClick={handleNext}
                className="ml-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="ml-auto bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
              >
                {isSubmitting ? (
                  <>
                    Submitting...
                    <Clock className="w-4 h-4 ml-2 animate-spin" />
                  </>
                ) : (
                  <>
                    Submit Claim
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="flex justify-end max-w-4xl mx-auto mt-8">
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
              disabled={!claimType || !formData.selectedPolicy}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Help Section */}
        {step < 8 && (
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Need Help?</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Our claims team is here to assist you 24/7. Call us at <strong>1800-123-4567</strong> or email <strong>claims@secureinsure.com</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-white">
                        <Clock className="w-3 h-3 mr-1" />
                        24/7 Support
                      </Badge>
                      <Badge variant="secondary" className="bg-white">
                        <Shield className="w-3 h-3 mr-1" />
                        100% Paperless
                      </Badge>
                      <Badge variant="secondary" className="bg-white">
                        <Award className="w-3 h-3 mr-1" />
                        Quick Settlement
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useCallback, useEffect } from 'react';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Sparkles, Bot, 
  User, Phone, Shield, Plus, TrendingUp, Heart, Users, Lock, 
  CreditCard, ArrowRight, ArrowLeft, Edit2, Check, Info, 
  Clock, Star, Loader2, X, Mail, Home, Calendar, DollarSign,
  FileCheck, Briefcase, Activity, Umbrella, Download, Share2, 
  ChevronRight, Save, Play, Trash2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import { createLifeApplication, uploadDocument } from '../../services/api';

const insurers = [
  { id: 'hdfc', name: 'HDFC Life', rating: 4.7, claimSettlement: 98.5, logo: '🏛️' },
  { id: 'icici', name: 'ICICI Prudential', rating: 4.6, claimSettlement: 97.8, logo: '🏦' },
  { id: 'sbi', name: 'SBI Life', rating: 4.5, claimSettlement: 96.5, logo: '🏦' },
  { id: 'max', name: 'Max Life', rating: 4.6, claimSettlement: 97.2, logo: '🏢' },
  { id: 'bajaj', name: 'Bajaj Allianz Life', rating: 4.4, claimSettlement: 95.8, logo: '🏢' },
];

const riders = [
  { id: 'critical', name: 'Critical Illness Cover', price: 1500, description: 'Lump sum on diagnosis of 36 critical illnesses', icon: Heart },
  { id: 'accidental', name: 'Accidental Death Benefit', price: 800, description: 'Additional sum assured on accidental death', icon: Umbrella },
  { id: 'disability', name: 'Waiver of Premium', price: 1000, description: 'Premium waiver on total permanent disability', icon: Activity },
];

const planVariants = [
  {
    id: 'basic',
    name: 'Basic Plan',
    coverage: 5000000,
    term: 20,
    premium: 8500,
    features: ['Life cover', 'Tax benefits'],
    recommended: false
  },
  {
    id: 'smart',
    name: 'Smart Plan',
    coverage: 10000000,
    term: 30,
    premium: 12500,
    features: ['Life cover', 'Tax benefits', 'Return of premium', 'Critical illness rider'],
    recommended: true
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    coverage: 20000000,
    term: 40,
    premium: 18500,
    features: ['Life cover', 'Tax benefits', 'Return of premium', 'All riders included', 'Waiver of premium'],
    recommended: false
  }
];

export default function LifeInsurance() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    file: File;
    type: string;
    progress: number;
    uploading: boolean;
    error?: string | null;
    uploadedUrl?: string | null;
    documentId?: any;
  }>>([]);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [assistantMessage, setAssistantMessage] = useState('Upload your documents and I\'ll help fill your details automatically!');
  const [policyNumber, setPolicyNumber] = useState('');
  
  const [formData, setFormData] = useState({
    // Auto-filled from documents
    fullName: '',
    dob: '',
    gender: '',
    address: '',
    panNumber: '',
    annualIncome: '',
    occupation: '',
    
    // Contact
    phone: '',
    email: '',
    
    // Coverage
    coverageAmount: 10000000,
    term: 30,
    
    // Riders
    selectedRiders: [] as string[],
    
    // Plan
    selectedPlan: 'smart',
    
    // Health
    weight: '',
    height: '',
    tobacco: false,
    alcohol: false,
    narcotics: false,
    hazardousOccupation: false,
    armedForces: false,
    surgeryHistory: false,
    hypertension: false,
    heartDisease: false,
    heartSurgery: false,
    diabetes: false,
    respiratory: false,
    nervousDisorders: false,
    gastrointestinal: false,
    liverDisorders: false,
    genitourinary: false,
    cancer: false,
    hiv: false,
    bloodDisorders: false,
    psychiatric: false,
    otherDisorder: false,
    congenitalDefects: false,
    familyHistory: false,
    recentAilment: false,
    weightChange: false,
    
    // Nominee
    nomineeName: '',
    nomineeRelation: '',
    nomineeDOB: '',
    nomineeContact: '',
    
    // KYC
    kycVerified: false,
    
    // Payment
    paymentMethod: ''
  });

  const [verificationStatus, setVerificationStatus] = useState({
    fullName: false,
    dob: false,
    gender: false,
    address: false,
    panNumber: false
  });

  // KYC DigiLocker Verification States
  const [userKycStatus, setUserKycStatus] = useState<'pending' | 'otp-sent' | 'verified'>('pending');
  const [nomineeKycStatus, setNomineeKycStatus] = useState<'pending' | 'otp-sent' | 'verified'>('pending');
  const [userAadhaar, setUserAadhaar] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [nomineeAadhaar, setNomineeAadhaar] = useState('');
  const [nomineeOtp, setNomineeOtp] = useState('');

  const steps = [
    { num: 1, title: 'Upload Documents', icon: Upload },
    { num: 2, title: 'AI Extraction', icon: Sparkles },
    { num: 3, title: 'Personal Details', icon: User },
    { num: 4, title: 'Contact Info', icon: Phone },
    { num: 5, title: 'Coverage Selection', icon: Shield },
    { num: 6, title: 'Add Riders', icon: Plus },
    { num: 7, title: 'Compare Plans', icon: TrendingUp },
    { num: 8, title: 'Health Info', icon: Heart },
    { num: 9, title: 'Nominee Details', icon: Users },
    { num: 10, title: 'KYC Verification', icon: Lock },
    { num: 11, title: 'Payment', icon: CreditCard }
  ];

  // Calculate progress
  const progress = ((step - 1) / (steps.length - 1)) * 100;

  // AI Assistant Messages for each step
  const getAssistantMessage = (currentStep: number) => {
    const messages: { [key: number]: string } = {
      1: 'Upload your ID, PAN, or previous policy — I\'ll read and fill your info automatically.',
      2: 'Analyzing your documents... This will just take a moment!',
      3: 'These details are taken from your documents — confirm or edit if needed.',
      4: 'We\'ll send your policy and updates to this email.',
      5: 'Based on your age & income, ₹1 Cr is recommended for optimal protection.',
      6: 'Riders give you extra safety for medical or accidental scenarios.',
      7: 'Compare different plans to find the best fit for your needs.',
      8: 'Please ensure accuracy to avoid claim issues later.',
      9: 'Would you like to make your spouse the nominee?',
      10: 'Your KYC has been auto-verified from uploaded documents.',
      11: 'Review your selection and complete payment to activate your policy.'
    };
    return messages[currentStep] || '';
  };

  // Update assistant message when step changes
  const changeStep = (newStep: number) => {
    setStep(newStep);
    setAssistantMessage(getAssistantMessage(newStep));
  };

  // Upload a single file by index (used for retry or individual upload)
  const uploadFileAtIndex = useCallback(async (index: number) => {
    // Get file from state using functional update to ensure we have latest state
    let fileObj: { file: File; type: string; progress: number; uploading: boolean; error?: string | null; uploadedUrl?: string | null; documentId?: any } | null = null;
    
    setUploadedFiles(prev => {
      fileObj = prev[index] || null;
      return prev; // Don't modify, just read
    });
    
    if (!fileObj) {
      console.warn(`File at index ${index} not found`);
      return null;
    }
    
    // Prevent uploading if already uploading or already uploaded successfully
    if (fileObj.uploading) {
      console.warn(`File at index ${index} is already uploading`);
      return null;
    }
    
    // If already uploaded successfully, don't re-upload unless explicitly retrying
    if (fileObj.uploadedUrl && !fileObj.error) {
      console.log(`File at index ${index} already uploaded successfully`);
      return { fileUrl: fileObj.uploadedUrl, documentId: fileObj.documentId };
    }
    
    const userIdForUpload = user?.id || localStorage.getItem('userId') || '1';

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
      console.log(`[DOCUMENT_UPLOAD] uploadFileAtIndex - Uploading file at index ${index}:`, fileObj.file.name, 'with documentType:', fileObj.type);
      
      // Add timeout for upload (5 minutes max)
      const uploadPromise = uploadDocument(fileObj.file, fileObj.type, userIdForUpload, undefined, (p) => {
        setUploadedFiles(prev => {
          const next = [...prev];
          if (next[index] && next[index].uploading) {
            next[index] = { ...next[index], progress: p };
          }
          return next;
        });
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout: Request took too long')), 5 * 60 * 1000);
      });
      
      const res = await Promise.race([uploadPromise, timeoutPromise]) as any;

      setUploadedFiles(prev => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { 
            ...next[index], 
            uploading: false, 
            progress: 100, 
            uploadedUrl: res.fileUrl || res.fileurl || null, 
            documentId: res.documentId || null,
            error: null
          };
        }
        return next;
      });

      toast.success(`File "${fileObj.file.name}" uploaded successfully!`);
      return res;
    } catch (e: any) {
      // Categorize errors for better user feedback
      let errorMessage = 'Upload failed';
      
      if (e?.message) {
        if (e.message.includes('timeout') || e.message.includes('time')) {
          errorMessage = 'Upload timeout: Please check your connection and try again';
        } else if (e.message.includes('network') || e.message.includes('Network') || e.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Please check your internet connection';
        } else if (e.message.includes('413') || e.message.includes('too large')) {
          errorMessage = 'File too large: Maximum size is 10MB';
        } else if (e.message.includes('415') || e.message.includes('type')) {
          errorMessage = 'File type not supported';
        } else if (e.message.includes('401') || e.message.includes('403')) {
          errorMessage = 'Authentication error: Please log in again';
        } else if (e.message.includes('500') || e.message.includes('server')) {
          errorMessage = 'Server error: Please try again later';
        } else {
          errorMessage = e.message;
        }
      }
      
      setUploadedFiles(prev => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { 
            ...next[index], 
            uploading: false, 
            error: errorMessage,
            progress: 0 // Reset progress on error
          };
        }
        return next;
      });
      
      toast.error(`Failed to upload "${fileObj.file.name}": ${errorMessage}`, { duration: 5000 });
      throw e;
    }
  }, [user]);

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
    
    // Validate and process files
    const validFiles: File[] = [];
    const invalidFiles: { name: string; reason: string }[] = [];
    
    // Get existing file names to check for duplicates
    setUploadedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.file.name.toLowerCase()));
      
      Array.from(files).forEach(file => {
        // Check for duplicate files
        if (existingNames.has(file.name.toLowerCase())) {
          invalidFiles.push({ name: file.name, reason: 'File already uploaded' });
          return;
        }
        
        // Check if file is empty
        if (file.size === 0) {
          invalidFiles.push({ name: file.name, reason: 'File is empty' });
          return;
        }
        
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          invalidFiles.push({ 
            name: file.name, 
            reason: `File size (${sizeMB}MB) exceeds 10MB limit` 
          });
          return;
        }
        
        // Check file type by MIME type
        const hasValidMimeType = ALLOWED_TYPES.includes(file.type);
        // Check file type by extension (fallback for files without MIME type)
        const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => 
          file.name.toLowerCase().endsWith(ext)
        );
        
        if (!hasValidMimeType && !hasValidExtension) {
          invalidFiles.push({ 
            name: file.name, 
            reason: 'File type not supported. Only PDF, JPG, PNG allowed' 
          });
          return;
        }
        
        validFiles.push(file);
        existingNames.add(file.name.toLowerCase());
      });
      
      return prev; // Don't modify, just read
    });
    
    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      invalidFiles.forEach(({ name, reason }) => {
        toast.error(`${name}: ${reason}`, { duration: 4000 });
      });
    }
    
    if (validFiles.length === 0) {
      if (invalidFiles.length > 0) {
        toast.warning('No valid files to upload. Please check file requirements.');
      }
      return;
    }
    
    // Add valid files to state with default type 'kyc_document'
    setUploadedFiles(prev => {
      const startIndex = prev.length;
      const fileArray = validFiles.map(f => ({
        file: f,
        type: 'kyc_document', // Default to 'kyc_document' for auto-upload
        progress: 0,
        uploading: false,
        error: null,
        uploadedUrl: null,
        documentId: null
      }));
      
      const newFiles = [...prev, ...fileArray];
      
      // Automatically start uploading each new file after state update
      // Use queueMicrotask to ensure state is updated before accessing indices
      // Upload files sequentially to avoid overwhelming the server
      queueMicrotask(() => {
        validFiles.forEach((_, index) => {
          const fileIndex = startIndex + index;
          // Small delay between uploads to prevent race conditions
          setTimeout(() => {
            uploadFileAtIndex(fileIndex);
          }, index * 100); // 100ms delay between each upload
        });
      });
      
      return newFiles;
    });
    
    toast.success(`${validFiles.length} file(s) uploading automatically...`);
  }, [user, uploadFileAtIndex]);

  // Handle document type change - may require re-upload if already uploaded
  const handleDocumentTypeChange = useCallback((index: number, newType: string) => {
    setUploadedFiles(prev => {
      const next = [...prev];
      if (!next[index]) return prev;
      
      const fileObj = next[index];
      const oldType = fileObj.type;
      
      // Don't allow type change if currently uploading
      if (fileObj.uploading) {
        toast.warning('Cannot change document type while upload is in progress');
        return prev; // Don't modify
      }
      
      // If type hasn't changed, do nothing
      if (oldType === newType) {
        return prev;
      }
      
      // Update the type
      next[index] = { ...next[index], type: newType };
      
      // If file was already uploaded successfully with different type, mark for re-upload
      if (fileObj.uploadedUrl && oldType !== newType) {
        // Clear uploaded status to allow re-upload with new type
        next[index] = {
          ...next[index],
          uploadedUrl: null,
          documentId: null,
          progress: 0,
          error: null
        };
        
        // Show notification and auto-retry upload with new type
        toast.info(`Document type changed. Re-uploading "${fileObj.file.name}" with new type...`);
        
        // Trigger re-upload after a short delay to ensure state is updated
        setTimeout(() => {
          uploadFileAtIndex(index);
        }, 500);
      } else if (!fileObj.uploadedUrl && !fileObj.uploading) {
        // File hasn't been uploaded yet, just update the type
        // The upload will use the new type automatically when it starts
      }
      
      return next;
    });
  }, [uploadFileAtIndex]);

  // Remove a file from the upload list
  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => {
      const next = [...prev];
      const fileObj = next[index];
      
      if (fileObj?.uploading) {
        toast.warning('Cannot remove file while upload is in progress');
        return prev;
      }
      
      // Remove the file
      const newFiles = next.filter((_, i) => i !== index);
      toast.success(`File "${fileObj?.file.name}" removed`);
      return newFiles;
    });
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  // Quick start with demo data (instant)
  const quickStartWithDemoData = () => {
    // Instantly populate with demo data
    setFormData(prev => ({
      ...prev,
      fullName: 'Rajesh Kumar',
      dob: '1990-05-15',
      gender: 'male',
      address: '123 MG Road, Bangalore, Karnataka - 560001',
      panNumber: 'ABCDE1234F',
      annualIncome: '1200000',
      occupation: 'Software Engineer',
      phone: user?.phone || '+91 9876543210',
      email: user?.email || 'rajesh.kumar@email.com'
    }));

    setVerificationStatus({
      fullName: true,
      dob: true,
      gender: true,
      address: true,
      panNumber: true
    });

    toast.success('Demo data loaded successfully!');
    setAssistantMessage('Demo data loaded! Review and proceed through the steps.');
    changeStep(3);
  };

  // Simulate AI extraction (using temporary/dummy data for quick processing)
  const processDocuments = async () => {
    setIsProcessing(true);
    changeStep(2);
    
    // Very quick AI processing animation (500ms total)
    setAssistantMessage('Processing documents...');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock/Temporary extracted data for quick testing
    setFormData(prev => ({
      ...prev,
      fullName: 'Rajesh Kumar',
      dob: '1990-05-15',
      gender: 'male',
      address: '123 MG Road, Bangalore, Karnataka - 560001',
      panNumber: 'ABCDE1234F',
      annualIncome: '1200000',
      occupation: 'Software Engineer',
      phone: user?.phone || '+91 9876543210',
      email: user?.email || 'rajesh.kumar@email.com'
    }));

    setVerificationStatus({
      fullName: true,
      dob: true,
      gender: true,
      address: true,
      panNumber: true
    });

    setIsProcessing(false);
    toast.success('Details extracted successfully!');
    changeStep(3);
  };

  // Calculate recommended coverage based on income
  const getRecommendedCoverage = (income: string) => {
    const incomeNum = parseInt(income) || 0;
    
    // Rule: Coverage should be 10-15x of annual income
    // We'll use 12x as the recommendation
    const recommendedCoverage = incomeNum * 12;
    
    // Round to nearest 5 lakhs
    const roundedCoverage = Math.round(recommendedCoverage / 500000) * 500000;
    
    // Ensure it's within acceptable range (min 50L, max 2Cr)
    if (roundedCoverage < 5000000) return 5000000;
    if (roundedCoverage > 20000000) return 20000000;
    
    return roundedCoverage;
  };

  // DigiLocker KYC Functions
  const sendUserOtp = async () => {
    if (!userAadhaar || userAadhaar.length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    
    setIsProcessing(true);
    // Simulate API call to DigiLocker
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setUserKycStatus('otp-sent');
    toast.success(`OTP sent to ${formData.phone || 'registered mobile number'}`);
  };

  const verifyUserOtp = async () => {
    if (!userOtp || userOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsProcessing(true);
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setUserKycStatus('verified');
    toast.success('Policyholder KYC verified successfully via DigiLocker!');
  };

  const sendNomineeOtp = async () => {
    if (!nomineeAadhaar || nomineeAadhaar.length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    
    setIsProcessing(true);
    // Simulate API call to DigiLocker
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setNomineeKycStatus('otp-sent');
    toast.success(`OTP sent to ${formData.nomineeContact || 'nominee\'s registered mobile number'}`);
  };

  const verifyNomineeOtp = async () => {
    if (!nomineeOtp || nomineeOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsProcessing(true);
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setNomineeKycStatus('verified');
    toast.success('Nominee KYC verified successfully via DigiLocker!');
  };

  // Save progress
  const saveProgress = () => {
    localStorage.setItem('lifeInsuranceProgress', JSON.stringify({ step, formData }));
    toast.success('Progress saved! You can resume later.');
  };

  // Handle next step
  const handleNext = () => {
    // Validation logic
    if (step === 1 && uploadedFiles.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    if (step === 3) {
      if (!formData.fullName || !formData.dob || !formData.annualIncome) {
        toast.error('Please fill all required fields');
        return;
      }
      // Auto-calculate recommended coverage when moving from step 3 to 4
      const recommendedCoverage = getRecommendedCoverage(formData.annualIncome);
      setFormData(prev => ({
        ...prev,
        coverageAmount: recommendedCoverage
      }));
    }

    if (step === 4) {
      if (!formData.phone || !formData.email) {
        toast.error('Please provide contact information');
        return;
      }
    }

    if (step === 9) {
      if (!formData.nomineeName || !formData.nomineeRelation) {
        toast.error('Please provide nominee details');
        return;
      }
    }

    if (step === 10) {
      if (userKycStatus !== 'verified' || nomineeKycStatus !== 'verified') {
        toast.error('Please complete KYC verification for both policyholder and nominee');
        return;
      }
    }

    if (step === 11) {
      if (!formData.paymentMethod) {
        toast.error('Please select a payment method');
        return;
      }
      handlePayment();
      return;
    }

    changeStep(step + 1);
  };

  // Handle payment — create application then simulate payment success
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // First upload files to backend and collect returned URLs
      const userIdForUpload = user?.id || localStorage.getItem('userId') || '1';
      const uploadedDocs: any[] = [];

      if (uploadedFiles.length > 0) {
        try {
          // upload files in parallel but track progress per-file
          const uploadPromises = uploadedFiles.map((fileObj, idx) => {
            console.log(`[DOCUMENT_UPLOAD] LifeInsurance - Uploading file ${idx + 1}/${uploadedFiles.length}:`, fileObj.file.name, 'with documentType:', fileObj.type);
            return uploadDocument(fileObj.file, fileObj.type, userIdForUpload, undefined, (p) => {
              setUploadedFiles(prev => {
                const next = [...prev];
                next[idx] = { ...next[idx], progress: p };
                return next;
              });
            }).then((res) => {
              // update uploaded url and id
              setUploadedFiles(prev => {
                const next = [...prev];
                next[idx] = { ...next[idx], uploadedUrl: res.fileUrl || res.fileurl || null, documentId: res.documentId || res.document_id || null, progress: 100, uploading: false };
                return next;
              });
              // Return both response and documentType for use in uploadedDocs array
              return { ...res, documentType: fileObj.type };
            }).catch((err) => {
              setUploadedFiles(prev => {
                const next = [...prev];
                next[idx] = { ...next[idx], uploading: false, error: err?.message || 'Upload failed' };
                return next;
              });
              throw err;
            });
          });

          const uploadResults = await Promise.all(uploadPromises);
          for (const r of uploadResults) {
            if (r && (r.fileUrl || r.fileurl)) {
              // Use actual documentType from upload instead of hardcoded 'kyc'
              const docType = r.documentType || 'other'; // Fallback to 'other' if not available
              uploadedDocs.push({ 
                filename: r.fileName || r.file || null, 
                url: r.fileUrl || r.fileurl, 
                documentId: r.documentId || r.document_id || null, 
                docType: docType 
              });
            }
          }
        } catch (e) {
          console.error('Document upload failed', e);
          toast.error('Failed to upload documents. Please try again.');
          setIsProcessing(false);
          return;
        }
      }

      // Build payload for application including uploaded document URLs
      const payload = {
        user_id: user?.id || localStorage.getItem('userId') || 'unknown',
        status: 'submitted',
        personal_details: {
          fullName: formData.fullName,
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address,
          panNumber: formData.panNumber,
          occupation: formData.occupation,
          annualIncome: formData.annualIncome
        },
        contact_info: {
          phone: formData.phone,
          email: formData.email
        },
        documents: uploadedDocs,
        coverage_selection: {
          coverageAmount: formData.coverageAmount,
          term: formData.term,
          selectedPlan: formData.selectedPlan
        },
        riders: formData.selectedRiders.map((r: string) => ({ rider_id: r })),
        health_info: {
          // Physical details
          weight: formData.weight,
          height: formData.height,

          // Question-wise health answers (true = Yes, false = No)
          tobacco_consumption: !!formData.tobacco,
          alcohol_last_year: !!formData.alcohol,
          ever_consumed_narcotics: !!formData.narcotics,
          hazardous_occupation_or_hobby: !!formData.hazardousOccupation,
          employed_in_armed_forces_or_police: !!formData.armedForces,
          prior_tests_investigations_or_surgery: !!formData.surgeryHistory,
          hypertension_high_bp_or_cholesterol: !!formData.hypertension,
          chest_pain_heart_attack_or_heart_disease: !!formData.heartDisease,
          undergone_angioplasty_bypass_or_heart_surgery: !!formData.heartSurgery,
          diabetes_or_related_complications: !!formData.diabetes,
          respiratory_disorders_like_asthma_tb: !!formData.respiratory,
          nervous_disorders_stroke_or_epilepsy: !!formData.nervousDisorders,
          gastrointestinal_disorders: !!formData.gastrointestinal,
          liver_disorders_or_hepatitis: !!formData.liverDisorders,
          genitourinary_disorders: !!formData.genitourinary,
          history_of_cancer_or_tumour: !!formData.cancer,
          hiv_infection_or_positive_test: !!formData.hiv,
          anemia_or_blood_disorders: !!formData.bloodDisorders,
          psychiatric_illness: !!formData.psychiatric,
          other_disorder: !!formData.otherDisorder,
          congenital_defects_or_physical_deformity: !!formData.congenitalDefects,
          family_history_hereditary_before_55: !!formData.familyHistory,
          ailment_or_injury_medical_leave_over_week_in_last_two_years: !!formData.recentAilment,
          weight_change_over_10kg_in_6_months: !!formData.weightChange
        },
        nominee_details: {
          name: formData.nomineeName,
          relation: formData.nomineeRelation,
          dob: formData.nomineeDOB,
          contact: formData.nomineeContact
        },
        kyc_verification: { policyholder: userKycStatus, nominee: nomineeKycStatus },
        payment: { method: formData.paymentMethod, status: 'processing' }
      };
      
      // Attach a minimal `policy` object so backend can create a SQL Policy
      // and record its id on the Mongo application document.
      const selectedPlan = planVariants.find(p => p.id === formData.selectedPlan);
      const policyPayload: any = {
        userId: user?.id || localStorage.getItem('userId') || undefined,
        type: 'life_insurance',
        planName: selectedPlan?.name || 'Life Plan',
        coverage: formData.coverageAmount || selectedPlan?.coverage || 0,
        premium: calculateTotalPremium(),
        tenure: formData.term,
        personalDetails: {
          fullName: formData.fullName,
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address,
          panNumber: formData.panNumber
        },
        nominee: formData.nomineeName || undefined,
        nomineeId: undefined
      };

      // attach policy to payload so backend creates SQL Policy and stores its id
      payload.policy = policyPayload;

      const res = await createLifeApplication(payload);
      const appId = res?.id;

      // Simulate payment then update payment status
      const newPolicyNumber = `LIFE${Date.now()}`;
      setPolicyNumber(newPolicyNumber);
      toast.success('Payment processed successfully!');
      setAssistantMessage('Your Life Insurance Policy is Active 🎉. Your e-policy has been sent to your registered email.');

      // Optionally update the application payment status
      if (appId) {
        try {
          await fetch(`http://20.193.150.128:8000/life-insurance/${appId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment: { method: formData.paymentMethod, status: 'paid', paid_at: new Date().toISOString() } })
          });
        } catch (e) {
          // Non-fatal
          console.warn('Failed to update payment status on application', e);
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle rider
  const toggleRider = (riderId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRiders: prev.selectedRiders.includes(riderId)
        ? prev.selectedRiders.filter(id => id !== riderId)
        : [...prev.selectedRiders, riderId]
    }));
  };

  // Handle plan parameter from URL (when coming from brochure)
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam && ['basic', 'smart', 'premium'].includes(planParam)) {
      const selectedPlanData = planVariants.find(p => p.id === planParam);
      if (selectedPlanData) {
        setFormData(prev => ({
          ...prev,
          selectedPlan: planParam,
          coverageAmount: selectedPlanData.coverage,
          term: selectedPlanData.term
        }));
        toast.success(`${selectedPlanData.name} pre-selected from brochure`);
      }
    }
  }, [searchParams]);

  // Calculate total premium
  const calculateTotalPremium = () => {
    const selectedPlanData = planVariants.find(p => p.id === formData.selectedPlan);
    const basePremium = selectedPlanData?.premium || 12500;
    
    const ridersCost = formData.selectedRiders.reduce((sum, riderId) => {
      const rider = riders.find(r => r.id === riderId);
      return sum + (rider?.price || 0);
    }, 0);
    
    return basePremium + ridersCost;
  };

  return (
    <div className="pt-[70px] min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-5xl mb-3">AI-Powered Life Insurance</h1>
                <p className="text-xl text-blue-100">Upload documents, AI fills everything — you just review and proceed</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/life-insurance')}
                className="ml-4 border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Brochure
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">Step {step} of {steps.length}</span>
              <span className="text-sm text-blue-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Breadcrumb Steps */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {steps.map((s, idx) => {
              const isCompleted = step > s.num;
              const isActive = step === s.num;
              const Icon = s.icon;

              return (
                <div key={s.num} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[80px]">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                      }}
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                        ${isCompleted ? 'bg-green-500 text-white' : ''}
                        ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-200' : ''}
                        ${!isCompleted && !isActive ? 'bg-gray-200 text-gray-400' : ''}
                      `}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </motion.div>
                    <span className={`text-xs text-center ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                      {s.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating AI Assistant */}
        <AnimatePresence>
          {showAIAssistant && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-6 max-w-sm z-40"
            >
              <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{assistantMessage}</p>
                    </div>
                    <button
                      onClick={() => setShowAIAssistant(false)}
                      className="text-white/80 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Upload Documents */}
            {step === 1 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Upload className="w-6 h-6" />
                      Upload Your Documents
                    </CardTitle>
                    <CardDescription>
                      Upload ID, PAN, or previous policy — our AI will read and fill your info automatically
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Drag and Drop Upload */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="mb-2">Drag & drop your documents here</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        or click to browse files
                      </p>
                      <p className="text-xs text-gray-500">
                        Supported: PDF, JPG, PNG (Max 10MB per file)
                      </p>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label>Uploaded Files ({uploadedFiles.length})</Label>
                        {uploadedFiles.map((fobj, idx) => {
                          // Determine status and styling based on file state
                          const isUploading = fobj.uploading;
                          const isSuccess = fobj.uploadedUrl && !fobj.error;
                          const isError = fobj.error && !fobj.uploading;
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

                          return (
                            <div key={idx} className={`flex items-center gap-3 p-3 border rounded-lg ${bgColor} transition-colors`}>
                              {/* Status Icon */}
                              <div className={iconColor}>
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
                                  <span className="text-sm font-medium truncate" title={fobj.file.name}>
                                    {fobj.file.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={fobj.type}
                                      onChange={(e) => handleDocumentTypeChange(idx, e.target.value)}
                                      disabled={isUploading}
                                      className="text-xs rounded px-2 py-1 border bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <option value="kyc_document">KYC Document</option>
                                      <option value="id_card">ID Card</option>
                                      <option value="pan_card">PAN</option>
                                      <option value="policy_document">Previous Policy</option>
                                      <option value="other">Other</option>
                                    </select>
                                    {!isUploading && (
                                      <button
                                        type="button"
                                        onClick={() => removeFile(idx)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                        title="Remove file"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
                                    <div 
                                      className={`h-2 transition-all duration-300 ${progressColor}`} 
                                      style={{ width: `${fobj.progress}%` }} 
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-xs mt-1">
                                    <span className={isError ? 'text-red-600' : isSuccess ? 'text-green-600' : 'text-gray-600'}>
                                      {isUploading ? `Uploading... ${fobj.progress}%` : isSuccess ? 'Uploaded successfully' : isError ? 'Upload failed' : 'Ready to upload'}
                                    </span>
                                    {fobj.error && (
                                      <span className="text-red-600 font-medium">{fobj.error}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Button - Only show retry for errors */}
                              {isError && (
                                <div className="flex flex-col gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => uploadFileAtIndex(idx)}
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

                    {/* Accepted Documents */}
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm">
                        <strong>Accepted documents:</strong> Aadhaar Card, PAN Card, Passport, Driving License, Previous Insurance Policy
                      </AlertDescription>
                    </Alert>

                    {/* Proceed Button */}
                    {uploadedFiles.length > 0 && (
                      <Button
                        onClick={processDocuments}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
                        size="lg"
                      >
                        Proceed to Review Details
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}

                    {/* Quick Demo Data Option */}
                    <Separator className="my-4" />
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">
                        Want to test the flow quickly?
                      </p>
                      <Button
                        onClick={quickStartWithDemoData}
                        variant="outline"
                        className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                        size="lg"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Quick Start with Demo Data
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Instantly loads sample data to test the purchase flow
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: AI Data Extraction (Quick Processing) */}
            {step === 2 && (
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardContent className="py-16 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h2 className="text-3xl mb-4">Processing Demo Data</h2>
                    <p className="text-gray-600 mb-8">Almost ready...</p>

                    {/* Quick Processing Indicator */}
                    <div className="max-w-md mx-auto">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg"
                      >
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        <span>Loading demo data...</span>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Personal Details (Auto-Filled) */}
            {step === 3 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Personal Details</CardTitle>
                    <CardDescription>
                      Auto-filled from your documents — confirm or edit if needed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="fullName">Full Name *</Label>
                        {verificationStatus.fullName && (
                          <Badge className="bg-green-100 text-green-700">
                            <Check className="w-3 h-3 mr-1" />
                            Verified by AI
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="flex-1"
                        />
                        <Button variant="outline" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="dob">Date of Birth *</Label>
                          {verificationStatus.dob && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <Input
                          id="dob"
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Gender *</Label>
                          {verificationStatus.gender && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
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

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="address">Address *</Label>
                        {verificationStatus.address && (
                          <Badge className="bg-green-100 text-green-700">
                            <Check className="w-3 h-3 mr-1" />
                            Verified by AI
                          </Badge>
                        )}
                      </div>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pan">PAN Number *</Label>
                        {verificationStatus.panNumber && (
                          <Badge className="bg-green-100 text-green-700">
                            <Check className="w-3 h-3 mr-1" />
                            Verified by AI
                          </Badge>
                        )}
                      </div>
                      <Input
                        id="pan"
                        value={formData.panNumber}
                        onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                        placeholder="ABCDE1234F"
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation *</Label>
                        <Input
                          id="occupation"
                          value={formData.occupation}
                          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                          placeholder="e.g., Software Engineer"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="annualIncome">Annual Income (₹) *</Label>
                        <Input
                          id="annualIncome"
                          type="number"
                          value={formData.annualIncome}
                          onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                          placeholder="e.g., 1200000"
                        />
                      </div>
                    </div>

                    {formData.annualIncome && (
                      <Alert className="bg-purple-50 border-purple-200">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <AlertDescription className="text-sm">
                          <strong>AI Recommendation:</strong> Based on your annual income of ₹{parseInt(formData.annualIncome).toLocaleString()}, 
                          we recommend a coverage of ₹{(getRecommendedCoverage(formData.annualIncome) / 10000000).toFixed(1)} Cr 
                          (approximately 12x your annual income).
                        </AlertDescription>
                      </Alert>
                    )}

                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-sm">
                        All details have been automatically verified from your uploaded documents
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Contact Information */}
            {step === 4 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      We'll send your policy and updates to these details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 9876543210"
                        />
                        {formData.phone && (
                          <Badge className="bg-green-100 text-green-700 self-center">
                            <Check className="w-3 h-3 mr-1" />
                            Auto-filled
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your@email.com"
                        />
                        {formData.email && (
                          <Badge className="bg-green-100 text-green-700 self-center">
                            <Check className="w-3 h-3 mr-1" />
                            Auto-filled
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm">
                        Your e-policy document will be sent to this email within 24 hours of payment confirmation
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 5: Coverage Selection */}
            {step === 5 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Your Life Cover</CardTitle>
                    <CardDescription>
                      Based on your annual income of ₹{parseInt(formData.annualIncome || '0').toLocaleString()}, 
                      we recommend ₹{(getRecommendedCoverage(formData.annualIncome) / 10000000).toFixed(1)} Cr for optimal protection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Income-based Recommendation Banner */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-2">
                            <strong>AI Smart Recommendation</strong>
                          </p>
                          <p className="text-sm text-gray-700 mb-3">
                            Your annual income: <strong>₹{parseInt(formData.annualIncome || '0').toLocaleString()}</strong>
                          </p>
                          <p className="text-sm text-gray-700 mb-3">
                            Industry standard suggests coverage should be 10-15x of annual income. 
                            For your profile, <strong>₹{(getRecommendedCoverage(formData.annualIncome) / 10000000).toFixed(1)} Cr</strong> provides 
                            comprehensive financial protection for your family.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white"
                            onClick={() => setFormData({ ...formData, coverageAmount: getRecommendedCoverage(formData.annualIncome) })}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Apply Recommended Coverage
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Coverage Amount</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            ₹{(formData.coverageAmount / 10000000).toFixed(1)} Cr
                          </span>
                          {formData.coverageAmount === getRecommendedCoverage(formData.annualIncome) && (
                            <Badge className="bg-green-100 text-green-700">
                              <Star className="w-3 h-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Slider
                        value={[formData.coverageAmount]}
                        onValueChange={([value]) => setFormData({ ...formData, coverageAmount: value })}
                        min={5000000}
                        max={20000000}
                        step={1000000}
                        className="py-4"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>₹50L</span>
                        <span>₹2 Cr</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label>Policy Term (Years)</Label>
                      <Select
                        value={formData.term.toString()}
                        onValueChange={(value) => setFormData({ ...formData, term: parseInt(value) })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select policy term">
                            {formData.term} years
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {Array.from({ length: 99 }, (_, i) => i + 1).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year} years
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm">
                        <strong>Pro Tip:</strong> Higher coverage = higher premium, but more protection for your family
                      </AlertDescription>
                    </Alert>

                    {/* AI Suggestion */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm mb-2">
                            <strong>AI Recommendation:</strong>
                          </p>
                          <p className="text-sm text-gray-700">
                            For someone of your age and profile, a coverage of ₹1 Cr for 30 years is ideal. This ensures your family is financially secure.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 6: Add Riders */}
            {step === 6 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Riders (Optional Add-ons)</CardTitle>
                    <CardDescription>
                      Enhance your coverage with additional protection riders
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {riders.map((rider) => {
                      const Icon = rider.icon;
                      const isSelected = formData.selectedRiders.includes(rider.id);
                      
                      return (
                        <Card
                          key={rider.id}
                          className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
                          onClick={() => toggleRider(rider.id)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-600' : 'bg-gray-100'}`}>
                                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="mb-1">{rider.name}</h3>
                                    <p className="text-sm text-gray-600">{rider.description}</p>
                                  </div>
                                  <Switch
                                    checked={isSelected}
                                    onCheckedChange={() => toggleRider(rider.id)}
                                  />
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                  <Badge variant="outline">₹{rider.price}/year</Badge>
                                  {isSelected && (
                                    <Badge className="bg-green-100 text-green-700">
                                      <Check className="w-3 h-3 mr-1" />
                                      Added
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm">
                        Riders give you extra safety for medical or accidental scenarios at a minimal additional cost
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 7: Compare Plans */}
            {step === 7 && (
              <div className="max-w-6xl mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>Compare Plans</CardTitle>
                    <CardDescription>
                      Choose the plan that best fits your needs and budget
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {planVariants.map((plan) => (
                        <Card
                          key={plan.id}
                          className={`cursor-pointer transition-all ${formData.selectedPlan === plan.id ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-lg'} ${plan.recommended ? 'relative' : ''}`}
                          onClick={() => setFormData({ ...formData, selectedPlan: plan.id })}
                        >
                          {plan.recommended && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                                <Star className="w-3 h-3 mr-1" />
                                Recommended
                              </Badge>
                            </div>
                          )}
                          <CardHeader className="text-center">
                            <CardTitle>{plan.name}</CardTitle>
                            <div className="text-3xl mt-4">
                              ₹{plan.premium.toLocaleString()}
                            </div>
                            <p className="text-sm text-gray-600">per year</p>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Coverage</span>
                                <span>₹{(plan.coverage / 10000000).toFixed(1)} Cr</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Term</span>
                                <span>{plan.term} years</span>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-2">
                              {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>

                            <Button
                              className={`w-full ${formData.selectedPlan === plan.id ? 'bg-blue-600' : ''}`}
                              variant={formData.selectedPlan === plan.id ? 'default' : 'outline'}
                            >
                              {formData.selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 8: Health Information */}
            {step === 8 && (
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Health Details</CardTitle>
                    <CardDescription>
                      {formData.fullName}'s Health Details - Please ensure accuracy to avoid claim issues
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Weight and Height */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="mb-4">Physical Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (in kgs)</Label>
                          <Input
                            id="weight"
                            type="number"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            placeholder="e.g., 70"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height (in inches)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            placeholder="e.g., 170"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Health Questions */}
                    <div className="space-y-3">
                      {/* Tobacco */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Do you consume or have ever consumed tobacco?</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.tobacco ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, tobacco: !formData.tobacco })}
                        >
                          {formData.tobacco ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Alcohol */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Have you consumed Alcohol in the last one year? *</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.alcohol ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, alcohol: !formData.alcohol })}
                        >
                          {formData.alcohol ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Narcotics */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Have you ever consumed narcotics?*</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.narcotics ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, narcotics: !formData.narcotics })}
                        >
                          {formData.narcotics ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Hazardous Occupation */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer text-sm">
                          Is your occupation associated with any specific hazard i.e. were you ever engaged in handling or have hobbies that could be dangerous in any way? like - occupation in Chemical factory, mines, explosives, radiation, corrosive chemicals - aviation other than as a fare paying passenger, diving, mountaineering, any form of racing
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ml-3 ${formData.hazardousOccupation ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, hazardousOccupation: !formData.hazardousOccupation })}
                        >
                          {formData.hazardousOccupation ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Armed Forces */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">
                          Are you employed in the armed (navy, air force, army), para military or police forces? *
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.armedForces ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, armedForces: !formData.armedForces })}
                        >
                          {formData.armedForces ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Surgery History */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">
                          Have you undergone any tests/investigations/surgery or have been hospitalized or for observation or treatment in the past?
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.surgeryHistory ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, surgeryHistory: !formData.surgeryHistory })}
                        >
                          {formData.surgeryHistory ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Hypertension */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Hypertension/ High BP/ high cholesterol</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.hypertension ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, hypertension: !formData.hypertension })}
                        >
                          {formData.hypertension ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Heart Disease */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Chest Pain/ Heart Attack/ any other heart disease or problem</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.heartDisease ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, heartDisease: !formData.heartDisease })}
                        >
                          {formData.heartDisease ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Heart Surgery */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Undergone angioplasty, bypass surgery, heart surgery</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.heartSurgery ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, heartSurgery: !formData.heartSurgery })}
                        >
                          {formData.heartSurgery ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Diabetes */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Diabetes or related complications</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.diabetes ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, diabetes: !formData.diabetes })}
                        >
                          {formData.diabetes ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Respiratory */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Asthma/Tuberculosis/other respiratory disorders</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.respiratory ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, respiratory: !formData.respiratory })}
                        >
                          {formData.respiratory ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Nervous Disorders */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Nervous disorders/stroke/epilepsy/spinal issues</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.nervousDisorders ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, nervousDisorders: !formData.nervousDisorders })}
                        >
                          {formData.nervousDisorders ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Gastrointestinal */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Any Gastrointestinal disorders like Pancreatitis, Colitis etc</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.gastrointestinal ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, gastrointestinal: !formData.gastrointestinal })}
                        >
                          {formData.gastrointestinal ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Liver Disorders */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Liver disorders/ Jaundice/ Hepatitis B or C</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.liverDisorders ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, liverDisorders: !formData.liverDisorders })}
                        >
                          {formData.liverDisorders ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Genitourinary */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">
                          Genitourinary disorders related to kidney, prostatic, urinary system and any other disorder
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.genitourinary ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, genitourinary: !formData.genitourinary })}
                        >
                          {formData.genitourinary ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Cancer */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">History of cancer or a Tumour, Growth or cyst</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.cancer ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, cancer: !formData.cancer })}
                        >
                          {formData.cancer ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* HIV */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">HIV infection or positive HIV test in the past</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.hiv ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, hiv: !formData.hiv })}
                        >
                          {formData.hiv ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Blood Disorders */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Anemia/ Thalassemia/ any blood-related disorder</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.bloodDisorders ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, bloodDisorders: !formData.bloodDisorders })}
                        >
                          {formData.bloodDisorders ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Psychiatric */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Psychiatric illness such as anxiety, depression or any other</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.psychiatric ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, psychiatric: !formData.psychiatric })}
                        >
                          {formData.psychiatric ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Other Disorder */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Any other disorder not mentioned above</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.otherDisorder ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, otherDisorder: !formData.otherDisorder })}
                        >
                          {formData.otherDisorder ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Congenital Defects */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Congenital defects/deformity/physical deformity/handicap</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.congenitalDefects ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, congenitalDefects: !formData.congenitalDefects })}
                        >
                          {formData.congenitalDefects ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Family History */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer text-sm">
                          Are you having any family history related to heart disease, diabetes, cancer or any other hereditary/familial disorder (before 55 years of age)
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ml-3 ${formData.familyHistory ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, familyHistory: !formData.familyHistory })}
                        >
                          {formData.familyHistory ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Recent Ailment */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer text-sm">
                          Did you have any ailment/injury/accident requiring treatment/medication for more than a week or have you availed leave for more than 5 days on medical grounds in the last two years?**
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ml-3 ${formData.recentAilment ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, recentAilment: !formData.recentAilment })}
                        >
                          {formData.recentAilment ? 'Yes' : 'No'}
                        </Button>
                      </div>

                      {/* Weight Change */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Label className="flex-1 cursor-pointer">Weight gain/weight loss more than 10 kg in last 6 months</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`min-w-[60px] ${formData.weightChange ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white text-gray-700'}`}
                          onClick={() => setFormData({ ...formData, weightChange: !formData.weightChange })}
                        >
                          {formData.weightChange ? 'Yes' : 'No'}
                        </Button>
                      </div>
                    </div>

                    <Alert className="bg-orange-50 border-orange-200">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-sm">
                        <strong>Important:</strong> Accurate health information is crucial. Any false declaration may result in claim rejection
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 9: Nominee Details */}
            {step === 9 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Nominee Details</CardTitle>
                    <CardDescription>
                      Specify who will receive the benefit in case of unfortunate event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="nomineeName">Nominee Full Name *</Label>
                      <Input
                        id="nomineeName"
                        value={formData.nomineeName}
                        onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                        placeholder="Enter nominee's full name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomineeRelation">Relationship *</Label>
                        <Select
                          value={formData.nomineeRelation}
                          onValueChange={(value) => setFormData({ ...formData, nomineeRelation: value })}
                        >
                          <SelectTrigger id="nomineeRelation">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nomineeDOB">Date of Birth *</Label>
                        <Input
                          id="nomineeDOB"
                          type="date"
                          value={formData.nomineeDOB}
                          onChange={(e) => setFormData({ ...formData, nomineeDOB: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nomineeContact">Nominee Contact Number</Label>
                      <Input
                        id="nomineeContact"
                        type="tel"
                        value={formData.nomineeContact}
                        onChange={(e) => setFormData({ ...formData, nomineeContact: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                    </div>

                    {/* Quick Suggestion */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm mb-3">
                            <strong>Quick Suggestion:</strong> Would you like to make your spouse the nominee?
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                nomineeRelation: 'spouse',
                                nomineeName: 'Priya Kumar'
                              });
                              toast.success('Spouse details pre-filled');
                            }}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Auto-fill Spouse
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 10: KYC Verification via DigiLocker */}
            {step === 10 && (
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle>KYC Verification via DigiLocker</CardTitle>
                    <CardDescription>
                      Secure Aadhaar-based verification for policyholder and nominee
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Overall Status Banner */}
                    {userKycStatus === 'verified' && nomineeKycStatus === 'verified' ? (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <h3 className="mb-2">All Verifications Completed ✅</h3>
                        <p className="text-sm text-gray-600">
                          Both policyholder and nominee KYC have been successfully verified via DigiLocker
                        </p>
                      </div>
                    ) : (
                      <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm">
                          <strong>DigiLocker KYC:</strong> Complete Aadhaar-based verification for both policyholder and nominee to proceed. 
                          OTPs will be sent to registered mobile numbers.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Two Column Layout for User and Nominee */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* User/Policyholder Verification */}
                      <Card className={`border-2 ${
                        userKycStatus === 'verified' 
                          ? 'border-green-200 bg-green-50/30' 
                          : 'border-blue-200 bg-blue-50/30'
                      }`}>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              userKycStatus === 'verified' ? 'bg-green-600' : 'bg-blue-600'
                            }`}>
                              {userKycStatus === 'verified' ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : (
                                <User className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">Policyholder KYC</CardTitle>
                                {userKycStatus === 'verified' && (
                                  <Badge className="bg-green-100 text-green-700 text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-xs">
                                {formData.fullName}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {userKycStatus === 'pending' && (
                            <>
                              <div className="space-y-3">
                                <Label htmlFor="userAadhaar">Aadhaar Number *</Label>
                                <Input
                                  id="userAadhaar"
                                  type="text"
                                  maxLength={12}
                                  value={userAadhaar}
                                  onChange={(e) => setUserAadhaar(e.target.value.replace(/\D/g, ''))}
                                  placeholder="Enter 12-digit Aadhaar"
                                />
                                <p className="text-xs text-gray-600">
                                  OTP will be sent to: {formData.phone}
                                </p>
                              </div>
                              <Button
                                onClick={sendUserOtp}
                                disabled={isProcessing}
                                className="w-full bg-blue-600"
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending OTP...
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Send OTP via DigiLocker
                                  </>
                                )}
                              </Button>
                            </>
                          )}

                          {userKycStatus === 'otp-sent' && (
                            <>
                              <Alert className="bg-blue-50 border-blue-200">
                                <Phone className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-sm">
                                  OTP sent to {formData.phone}. Please enter the 6-digit code.
                                </AlertDescription>
                              </Alert>
                              <div className="space-y-3">
                                <Label htmlFor="userOtp">Enter OTP *</Label>
                                <Input
                                  id="userOtp"
                                  type="text"
                                  maxLength={6}
                                  value={userOtp}
                                  onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, ''))}
                                  placeholder="Enter 6-digit OTP"
                                  className="text-center text-lg tracking-widest"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={sendUserOtp}
                                  disabled={isProcessing}
                                  className="flex-1"
                                >
                                  Resend OTP
                                </Button>
                                <Button
                                  onClick={verifyUserOtp}
                                  disabled={isProcessing}
                                  className="flex-1 bg-blue-600"
                                >
                                  {isProcessing ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Verifying...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Verify OTP
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          )}

                          {userKycStatus === 'verified' && (
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm">Verified via DigiLocker</span>
                              </div>
                              <Separator className="my-3" />
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600">Name</p>
                                    <p className="text-sm">{formData.fullName}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600">Aadhaar (Masked)</p>
                                    <p className="text-sm">XXXX-XXXX-{userAadhaar.slice(-4)}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600">DOB</p>
                                    <p className="text-sm">{new Date(formData.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600">Mobile</p>
                                    <p className="text-sm">{formData.phone}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Nominee Verification */}
                      <Card className={`border-2 ${
                        nomineeKycStatus === 'verified' 
                          ? 'border-green-200 bg-green-50/30' 
                          : 'border-purple-200 bg-purple-50/30'
                      }`}>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              nomineeKycStatus === 'verified' ? 'bg-green-600' : 'bg-purple-600'
                            }`}>
                              {nomineeKycStatus === 'verified' ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : (
                                <Users className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">Nominee KYC</CardTitle>
                                {nomineeKycStatus === 'verified' && (
                                  <Badge className="bg-green-100 text-green-700 text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-xs">
                                {formData.nomineeName || 'Beneficiary'}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {nomineeKycStatus === 'pending' && (
                            <>
                              <div className="space-y-3">
                                <Label htmlFor="nomineeAadhaar">Nominee Aadhaar Number *</Label>
                                <Input
                                  id="nomineeAadhaar"
                                  type="text"
                                  maxLength={12}
                                  value={nomineeAadhaar}
                                  onChange={(e) => setNomineeAadhaar(e.target.value.replace(/\D/g, ''))}
                                  placeholder="Enter 12-digit Aadhaar"
                                />
                                <p className="text-xs text-gray-600">
                                  OTP will be sent to: {formData.nomineeContact || 'nominee\'s registered mobile'}
                                </p>
                              </div>
                              <Button
                                onClick={sendNomineeOtp}
                                disabled={isProcessing}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending OTP...
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Send OTP via DigiLocker
                                  </>
                                )}
                              </Button>
                            </>
                          )}

                          {nomineeKycStatus === 'otp-sent' && (
                            <>
                              <Alert className="bg-purple-50 border-purple-200">
                                <Phone className="h-4 w-4 text-purple-600" />
                                <AlertDescription className="text-sm">
                                  OTP sent to {formData.nomineeContact}. Please enter the 6-digit code.
                                </AlertDescription>
                              </Alert>
                              <div className="space-y-3">
                                <Label htmlFor="nomineeOtp">Enter OTP *</Label>
                                <Input
                                  id="nomineeOtp"
                                  type="text"
                                  maxLength={6}
                                  value={nomineeOtp}
                                  onChange={(e) => setNomineeOtp(e.target.value.replace(/\D/g, ''))}
                                  placeholder="Enter 6-digit OTP"
                                  className="text-center text-lg tracking-widest"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={sendNomineeOtp}
                                  disabled={isProcessing}
                                  className="flex-1"
                                >
                                  Resend OTP
                                </Button>
                                <Button
                                  onClick={verifyNomineeOtp}
                                  disabled={isProcessing}
                                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                                >
                                  {isProcessing ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Verifying...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Verify OTP
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          )}

                          {nomineeKycStatus === 'verified' && (
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm">Verified via DigiLocker</span>
                              </div>
                              <Separator className="my-3" />
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600">Name</p>
                                    <p className="text-sm">{formData.nomineeName}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600">Aadhaar (Masked)</p>
                                    <p className="text-sm">XXXX-XXXX-{nomineeAadhaar.slice(-4)}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600">Relationship</p>
                                    <p className="text-sm capitalize">{formData.nomineeRelation}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600">Mobile</p>
                                    <p className="text-sm">{formData.nomineeContact}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* DigiLocker Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lock className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="mb-2">About DigiLocker Verification</h4>
                          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                            <li>DigiLocker is a secure Government of India initiative</li>
                            <li>Your Aadhaar data is encrypted and never stored on our servers</li>
                            <li>OTP verification ensures authentic identity confirmation</li>
                            <li>IRDAI compliant for insurance KYC requirements</li>
                            <li>Paperless, instant, and completely secure process</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 11: Payment & Confirmation */}
            {step === 11 && !policyNumber && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment & Confirmation</CardTitle>
                    <CardDescription>
                      Review your selection and complete payment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Summary Card */}
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Policy Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Coverage Amount</span>
                          <span>₹{(formData.coverageAmount / 10000000).toFixed(1)} Cr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Policy Term</span>
                          <span>{formData.term} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Selected Plan</span>
                          <span className="capitalize">{formData.selectedPlan} Plan</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Riders</span>
                          <span>{formData.selectedRiders.length} selected</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span>Total Premium</span>
                          <span className="text-2xl">₹{calculateTotalPremium().toLocaleString()}/year</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <div className="space-y-4">
                      <Label>Select Payment Method *</Label>
                      <RadioGroup
                        value={formData.paymentMethod}
                        onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                      >
                        <Card
                          className={`cursor-pointer ${formData.paymentMethod === 'card' ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <RadioGroupItem value="card" id="card" />
                            <CreditCard className="w-5 h-5 text-gray-600" />
                            <Label htmlFor="card" className="flex-1 cursor-pointer">
                              Credit / Debit Card
                            </Label>
                          </CardContent>
                        </Card>

                        <Card
                          className={`cursor-pointer ${formData.paymentMethod === 'upi' ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <RadioGroupItem value="upi" id="upi" />
                            <Sparkles className="w-5 h-5 text-gray-600" />
                            <Label htmlFor="upi" className="flex-1 cursor-pointer">
                              UPI
                            </Label>
                          </CardContent>
                        </Card>

                        <Card
                          className={`cursor-pointer ${formData.paymentMethod === 'netbanking' ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setFormData({ ...formData, paymentMethod: 'netbanking' })}
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <RadioGroupItem value="netbanking" id="netbanking" />
                            <Home className="w-5 h-5 text-gray-600" />
                            <Label htmlFor="netbanking" className="flex-1 cursor-pointer">
                              Net Banking
                            </Label>
                          </CardContent>
                        </Card>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Success Screen */}
            {step === 11 && policyNumber && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardContent className="py-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-12 h-12 text-white" />
                    </motion.div>

                    <h2 className="text-3xl mb-4">Your Life Insurance Policy is Active 🎉</h2>
                    <p className="text-gray-600 mb-8">
                      Your e-policy has been sent to your registered email
                    </p>

                    <Card className="bg-blue-50 border-blue-200 mb-8 max-w-md mx-auto">
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-600 mb-2">Policy Number</p>
                        <p className="text-2xl mb-4">{policyNumber}</p>
                        <Separator className="my-4" />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Coverage</span>
                            <span>₹{(formData.coverageAmount / 10000000).toFixed(1)} Cr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Annual Premium</span>
                            <span>₹{calculateTotalPremium().toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => navigate('/dashboard')} className="bg-blue-600">
                        <Home className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Policy
                      </Button>
                      <Button variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step !== 2 && !policyNumber && (
          <div className="max-w-3xl mx-auto mt-8 flex items-center justify-between">
            <div>
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => changeStep(step - 1)}
                  disabled={isProcessing}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={saveProgress}
                disabled={isProcessing}
              >
                <Save className="w-4 h-4 mr-2" />
                Save & Resume Later
              </Button>

              <Button
                onClick={handleNext}
                disabled={isProcessing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
              >
                {step === 11 ? 'Complete Payment' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Show AI Assistant Toggle */}
        {!showAIAssistant && (
          <Button
            onClick={() => setShowAIAssistant(true)}
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 hover:opacity-90 shadow-xl"
            size="icon"
          >
            <Bot className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
}

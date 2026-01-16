import { useState } from 'react';
import { ChevronRight, Check, Users, User, Baby, Shield, Heart, Eye, Pill, Activity, Plus, Info, ArrowLeft, ArrowRight, Star, Phone, Mail, Lock, UserPlus, CheckCircle, CreditCard, Download, Share2, Home, Award, Clock, Building2, Zap, FileText, AlertCircle, TrendingUp, Stethoscope, UserCheck, Bed, Upload, X, Camera } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/AuthContext';

interface Member {
  id: string;
  relation: string;
  name: string;
  age: string;
  gender: string;
}

interface MemberDocument {
  memberId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

const insurers = [
  { id: 'hdfc', name: 'HDFC ERGO Health', rating: 4.7, claimSettlement: 98.2, logo: '🏛️' },
  { id: 'star', name: 'Star Health', rating: 4.6, claimSettlement: 97.5, logo: '⭐' },
  { id: 'care', name: 'Care Health', rating: 4.5, claimSettlement: 96.8, logo: '🏥' },
  { id: 'max', name: 'Max Bupa Health', rating: 4.6, claimSettlement: 97.2, logo: '🏢' },
  { id: 'niva', name: 'Niva Bupa Health', rating: 4.5, claimSettlement: 96.5, logo: '🏢' },
  { id: 'royal', name: 'Royal Sundaram', rating: 4.4, claimSettlement: 95.8, logo: '🏦' }
];

const addOns = [
  { id: 'critical', name: 'Critical Illness Cover', price: 2500, icon: Heart, description: 'Lump sum on 36 critical illnesses' },
  { id: 'maternity', name: 'Maternity Cover', price: 3000, icon: Baby, description: 'Normal & C-section delivery' },
  { id: 'dental', name: 'Dental Care', price: 1200, icon: Pill, description: 'Dental procedures up to ₹50K' },
  { id: 'vision', name: 'Vision Care', price: 800, icon: Eye, description: 'Eye treatment & spectacles' },
  { id: 'wellness', name: 'Wellness Program', price: 1500, icon: Activity, description: 'Annual health check-ups' },
  { id: 'consumables', name: 'Consumables Cover', price: 1000, icon: Plus, description: 'Syringes, gloves, PPE kits' }
];

export default function HealthInsurance() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, register } = useAuth();
  const [step, setStep] = useState(1);
  const [policyNumber, setPolicyNumber] = useState('');
  
  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const [memberDocuments, setMemberDocuments] = useState<MemberDocument[]>([]);
  const [userKycDocuments, setUserKycDocuments] = useState<{[key: string]: any}>({});
  const [nomineeKycDocuments, setNomineeKycDocuments] = useState<{[key: string]: any}>({});

  const [formData, setFormData] = useState({
    // Step 1: Coverage Type
    coverageType: '', // self, family, senior
    
    // Step 2: Member Details
    members: [] as Member[],
    
    // Step 3: Document Upload (handled separately)
    
    // Step 4: Sum Insured & Medical History
    sumInsured: 500000,
    preExistingDiseases: [] as string[],
    familyHistory: [] as string[],
    
    // Step 4: Add-ons
    selectedAddOns: [] as string[],
    
    // Step 5: Selected Quote
    selectedInsurer: '',
    selectedQuote: {} as any,
    
    // Step 6: Contact Details
    phone: '',
    email: '',
    pincode: '',
    city: '',
    address: '',
    
    // Step 7: Nominee Details
    nomineeName: '',
    nomineeRelation: '',
    nomineeDOB: '',
    
    // Step 8: Medical Questions
    bmi: '',
    height: '',
    weight: '',
    lifestyle: '',
    smoke: '',
    alcohol: '',
    
    // Step 9: KYC - User
    userPanNumber: '',
    userAadhaarNumber: '',
    userAddress: '',
    userIncomeRange: '',
    
    // Step 9: KYC - Nominee
    nomineePanNumber: '',
    nomineeAadhaarNumber: '',
    nomineeAddress: '',
    
    // Step 10: Payment
    paymentMethod: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    upiId: ''
  });

  const steps = [
    { num: 1, title: 'Coverage Type', icon: Users },
    { num: 2, title: formData.coverageType === 'family' ? 'Members & Documents' : 'Documents', icon: Upload },
    { num: 3, title: 'Sum Insured', icon: Shield },
    { num: 4, title: 'Add-ons', icon: Plus },
    { num: 5, title: 'Medical Info', icon: Stethoscope },
    { num: 6, title: 'Review Quote', icon: FileText },
    { num: 7, title: 'Contact Info', icon: Phone },
    { num: 8, title: 'Nominee', icon: Heart },
    { num: 9, title: 'KYC', icon: Lock },
    { num: 10, title: 'Payment', icon: CreditCard },
    { num: 11, title: 'Confirmation', icon: CheckCircle }
  ];

  const calculateBasePremium = (sumInsured: number, insurerId: string, memberCount: number, avgAge: number) => {
    // Base rate per lakh per person per year
    const baseRate = 650;
    const sumInLakhs = sumInsured / 100000;
    
    // Age factor
    const ageFactor = avgAge < 25 ? 0.7 : avgAge < 35 ? 0.9 : avgAge < 45 ? 1.2 : avgAge < 55 ? 1.6 : 2.2;
    
    // Member factor (family floater discount)
    const memberFactor = memberCount === 1 ? 1 : memberCount === 2 ? 1.8 : memberCount === 3 ? 2.3 : 2.7;
    
    // Insurer variation
    const insurerIndex = insurers.findIndex(i => i.id === insurerId);
    const insurerVariation = 1 + (insurerIndex * 0.05 - 0.08); // -8% to +17%
    
    let premium = sumInLakhs * baseRate * ageFactor * memberFactor * insurerVariation;
    
    // Pre-existing disease loading
    if (formData.preExistingDiseases.length > 0 && !formData.preExistingDiseases.includes('None')) {
      premium *= 1.3;
    }
    
    return Math.round(premium);
  };

  const calculateTotalPremium = (basePremium: number) => {
    const addOnsCost = formData.selectedAddOns.reduce((sum, addonId) => {
      const addon = addOns.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    
    const gst = (basePremium + addOnsCost) * 0.18;
    return Math.round(basePremium + addOnsCost + gst);
  };

  const getQuote = () => {
    // SecureInsure - Your company
    const insurer = { 
      id: 'secureinsure', 
      name: 'SecureInsure', 
      logo: '🛡️', 
      rating: 4.8, 
      claimSettlement: 98 
    };

    const memberCount = formData.coverageType === 'self' || formData.coverageType === 'senior' ? 1 : formData.members.length || 1;
    const totalAge = formData.members.length > 0 
      ? formData.members.reduce((sum, m) => sum + parseInt(m.age || '30'), 0) 
      : 30;
    const avgAge = memberCount > 0 ? totalAge / memberCount : 30;

    let basePremium = calculateBasePremium(formData.sumInsured, 'hdfc', memberCount, avgAge);
    
    // Lifestyle loading - increase premium for risky behaviors
    let lifestyleLoading = 0;
    if (formData.smoke === 'yes') {
      lifestyleLoading += basePremium * 0.20; // 20% loading for smoking
    }
    if (formData.alcohol === 'Occasionally') {
      lifestyleLoading += basePremium * 0.10; // 10% loading for occasional drinking
    } else if (formData.alcohol === 'Regularly') {
      lifestyleLoading += basePremium * 0.15; // 15% loading for regular drinking
    }
    
    const premiumWithLoading = Math.round(basePremium + lifestyleLoading);
    
    const addOnsCost = formData.selectedAddOns.reduce((sum, addonId) => {
      const addon = addOns.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    
    const gst = Math.round((premiumWithLoading + addOnsCost) * 0.18);
    const totalPremium = premiumWithLoading + addOnsCost + gst;
    
    return {
      insurer,
      basePremium,
      lifestyleLoading: Math.round(lifestyleLoading),
      premiumAfterLoading: premiumWithLoading,
      addOnCost: addOnsCost,
      gst,
      totalPremium,
      monthlyPremium: Math.round(totalPremium / 12),
      sumInsured: formData.sumInsured,
      roomRent: 'Single AC Room',
      cashlessHospitals: 7500,
      copayment: 'No Copay',
      addOns: formData.selectedAddOns.length
    };
  };

  const handleAuthSubmit = async () => {
    try {
      if (authMode === 'login') {
        if (!authForm.email || !authForm.password) {
          toast.error('Please fill in all fields');
          return;
        }
        await login(authForm.email, authForm.password);
      } else {
        if (!authForm.name || !authForm.email || !authForm.password) {
          toast.error('Please fill in all fields');
          return;
        }
        await register(authForm.name, authForm.email, authForm.password);
      }
      setStep(7); // Move to contact details
    } catch (error) {
      toast.error('Authentication failed. Please try again.');
    }
  };

  const addMember = (relation: string) => {
    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      relation,
      name: '',
      age: '',
      gender: ''
    };
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  const removeMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id)
    }));
  };

  const updateMember = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map(m => 
        m.id === id ? { ...m, [field]: value } : m
      )
    }));
  };

  const handleDocumentUpload = (file: File | null, memberId: string, documentType: string) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const newDoc: MemberDocument = {
        memberId,
        documentType,
        fileName: file.name,
        fileUrl: reader.result as string,
        fileSize: file.size
      };
      setMemberDocuments(prev => [...prev, newDoc]);
      toast.success('Document uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (memberId: string, documentType: string) => {
    setMemberDocuments(prev => 
      prev.filter(d => !(d.memberId === memberId && d.documentType === documentType))
    );
    toast.success('Document removed');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUserKycUpload = (file: File | null, docType: string) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserKycDocuments(prev => ({
        ...prev,
        [docType]: {
          fileName: file.name,
          fileUrl: reader.result as string,
          fileSize: file.size
        }
      }));
      toast.success(`User ${docType} uploaded successfully`);
    };
    reader.readAsDataURL(file);
  };

  const handleNomineeKycUpload = (file: File | null, docType: string) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setNomineeKycDocuments(prev => ({
        ...prev,
        [docType]: {
          fileName: file.name,
          fileUrl: reader.result as string,
          fileSize: file.size
        }
      }));
      toast.success(`Nominee ${docType} uploaded successfully`);
    };
    reader.readAsDataURL(file);
  };

  const removeUserKycDocument = (docType: string) => {
    setUserKycDocuments(prev => {
      const updated = { ...prev };
      delete updated[docType];
      return updated;
    });
    toast.success('Document removed');
  };

  const removeNomineeKycDocument = (docType: string) => {
    setNomineeKycDocuments(prev => {
      const updated = { ...prev };
      delete updated[docType];
      return updated;
    });
    toast.success('Document removed');
  };

  const handleNext = () => {
    // Validation
    if (step === 1 && !formData.coverageType) {
      toast.error('Please select coverage type');
      return;
    }
    
    if (step === 2) {
      // For family coverage, validate members and their documents
      if (formData.coverageType === 'family') {
        if (formData.members.length === 0) {
          toast.error('Please add at least one family member');
          return;
        }
        const invalidMembers = formData.members.filter(m => !m.age || !m.gender);
        if (invalidMembers.length > 0) {
          toast.error('Please fill all member details');
          return;
        }
        // Check if all members have required documents
        const requiredDocs = ['photo-id', 'medical-reports'];
        for (const member of formData.members) {
          for (const docType of requiredDocs) {
            const hasDoc = memberDocuments.some(d => d.memberId === member.id && d.documentType === docType);
            if (!hasDoc) {
              toast.error(`Please upload ${docType === 'photo-id' ? 'Photo ID' : 'Medical Reports'} for ${member.relation}`);
              return;
            }
          }
        }
      } else {
        // For individual and senior, validate basic documents
        const hasPhotoId = memberDocuments.some(d => d.documentType === 'photo-id');
        const hasMedicalReports = memberDocuments.some(d => d.documentType === 'medical-reports');
        
        if (!hasPhotoId) {
          toast.error('Please upload Photo ID Proof');
          return;
        }
        if (!hasMedicalReports) {
          toast.error('Please upload Medical Reports');
          return;
        }
      }
    }
    
    if (step === 3 && !formData.sumInsured) {
      toast.error('Please select sum insured');
      return;
    }
    
    if (step === 5) {
      if (!formData.height || !formData.weight) {
        toast.error('Please provide height and weight');
        return;
      }
    }
    
    if (step === 6) {
      // Automatically accept the quote for SecureInsure
      if (!formData.selectedInsurer) {
        setFormData({ ...formData, selectedInsurer: 'secureinsure' });
      }
      // Check authentication
      if (!isAuthenticated) {
        // Show auth modal
        toast.info('Please login to continue');
        return;
      }
    }
    
    if (step === 7) {
      if (!formData.phone || !formData.email || !formData.pincode) {
        toast.error('Please fill all contact details');
        return;
      }
    }
    
    if (step === 8 && !formData.nomineeName) {
      toast.error('Please provide nominee details');
      return;
    }
    
    if (step === 9) {
      // Validate User KYC
      if (!formData.userPanNumber) {
        toast.error('User PAN number is mandatory');
        return;
      }
      if (!userKycDocuments['pan-card']) {
        toast.error('Please upload User PAN Card');
        return;
      }
      if (!userKycDocuments['aadhaar-card']) {
        toast.error('Please upload User Aadhaar Card');
        return;
      }
      if (!userKycDocuments['photo']) {
        toast.error('Please upload User Photo');
        return;
      }
      
      // Validate Nominee KYC
      if (!formData.nomineePanNumber) {
        toast.error('Nominee PAN number is mandatory');
        return;
      }
      if (!nomineeKycDocuments['pan-card']) {
        toast.error('Please upload Nominee PAN Card');
        return;
      }
      if (!nomineeKycDocuments['aadhaar-card']) {
        toast.error('Please upload Nominee Aadhaar Card');
        return;
      }
      if (!nomineeKycDocuments['photo']) {
        toast.error('Please upload Nominee Photo');
        return;
      }
    }
    
    if (step === 10 && !formData.paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    setStep(step + 1);
  };

  const handleSubmit = () => {
    const newPolicyNumber = `HEALTH${Date.now()}`;
    setPolicyNumber(newPolicyNumber);
    toast.success('Payment processed successfully!');
    setStep(11);
  };

  const toggleAddOn = (addonId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.includes(addonId)
        ? prev.selectedAddOns.filter(id => id !== addonId)
        : [...prev.selectedAddOns, addonId]
    }));
  };

  const selectPlan = (insurerId: string) => {
    const quotes = getQuotes();
    const selectedQuote = quotes.find(q => q.insurer.id === insurerId);
    if (selectedQuote) {
      setFormData(prev => ({
        ...prev,
        selectedInsurer: insurerId,
        selectedQuote: selectedQuote
      }));
    }
  };

  return (
    <div className="pt-[70px] min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl mb-3">Health Insurance</h1>
            <p className="text-xl text-blue-100">Comprehensive health coverage for you and your family</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="max-w-5xl mx-auto">
            {/* Progress Percentage Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Step {step} of {steps.length}
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {Math.round((step / steps.length) * 100)}% Complete
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / steps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
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
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          rotate: isCompleted ? 360 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className="relative z-10 mb-3"
                      >
                        <div
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                            ${isCompleted ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30' : ''}
                            ${isActive ? 'bg-gradient-to-br from-blue-600 to-cyan-500 shadow-xl shadow-blue-500/40 ring-4 ring-blue-100' : ''}
                            ${isPending ? 'bg-white border-2 border-gray-300' : ''}
                          `}
                        >
                          {isCompleted ? (
                            <Check className="w-6 h-6 text-white" strokeWidth={3} />
                          ) : (
                            <s.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          )}
                        </div>
                        
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-blue-600"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.div>

                      <div className="text-center px-1">
                        <div className={`
                          text-xs transition-all duration-300
                          ${isActive ? 'text-blue-600 font-semibold' : ''}
                          ${isCompleted ? 'text-green-600 font-medium' : ''}
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
                            className="h-full bg-gradient-to-r from-green-500 to-blue-600"
                            initial={{ width: 0 }}
                            animate={{ 
                              width: step > s.num ? '100%' : '0%' 
                            }}
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

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Coverage Type */}
            {step === 1 && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl mb-2">Who do you want to insure?</h2>
                  <p className="text-muted-foreground">Select the type of coverage that suits your needs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { value: 'self', title: 'Individual', icon: User, desc: 'For self only', members: '1 Adult', popular: false },
                    { value: 'family', title: 'Family Floater', icon: Users, desc: 'Self + Spouse + Kids', members: 'Up to 6', popular: true },
                    { value: 'senior', title: 'Senior Citizen', icon: Baby, desc: 'For parents', members: 'Parents', popular: false }
                  ].map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all hover:shadow-xl relative ${
                        formData.coverageType === option.value ? 'ring-2 ring-blue-600 bg-blue-50' : ''
                      } ${option.popular ? 'border-blue-600 border-2' : ''}`}
                      onClick={() => setFormData({...formData, coverageType: option.value, members: []})}
                    >
                      {option.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600">Most Popular</Badge>
                        </div>
                      )}
                      <CardContent className="p-8 text-center">
                        <option.icon className={`w-16 h-16 mx-auto mb-4 ${
                          formData.coverageType === option.value ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <h3 className="text-xl mb-2">{option.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{option.desc}</p>
                        <Badge variant="secondary">{option.members}</Badge>
                        {formData.coverageType === option.value && (
                          <div className="mt-4">
                            <Check className="w-6 h-6 text-blue-600 mx-auto" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {formData.coverageType && (
                  <Alert className="mt-8 bg-blue-50 border-blue-200 max-w-2xl mx-auto">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      <strong>Family Floater:</strong> All family members share one sum insured. More cost-effective than individual policies.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 2: Document Upload - Dynamic based on coverage type */}
            {step === 2 && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Individual Coverage */}
                {formData.coverageType === 'self' && (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl mb-2">Upload Your Documents</h2>
                      <p className="text-muted-foreground">Upload your identity and health documents</p>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription>
                        <strong>Document Guidelines:</strong> Upload clear, legible copies. JPG, PNG or PDF format. Maximum 10MB per file.
                      </AlertDescription>
                    </Alert>

                    {/* Photo ID Upload */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              Photo ID Proof
                            </CardTitle>
                            <CardDescription>Aadhaar, PAN, Passport, Driving License</CardDescription>
                          </div>
                          {memberDocuments.some(d => d.documentType === 'photo-id') && (
                            <Badge className="bg-green-500">
                              <Check className="w-3 h-3 mr-1" />
                              Uploaded
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload a clear photo or scan of your ID proof
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('photo-id-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>
                          <input
                            id="photo-id-upload"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDocumentUpload(file, 'primary', 'photo-id');
                            }}
                          />
                        </div>

                        {memberDocuments.filter(d => d.documentType === 'photo-id').map((doc) => (
                          <div key={doc.fileName} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {doc.fileUrl.startsWith('data:image') ? (
                                <img src={doc.fileUrl} alt={doc.fileName} className="w-12 h-12 object-cover rounded" />
                              ) : (
                                <FileText className="w-12 h-12 text-gray-400" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.fileName}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument('primary', 'photo-id')}
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Medical Reports Upload */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              Medical Reports
                            </CardTitle>
                            <CardDescription>Recent health check-up reports, prescriptions (if any)</CardDescription>
                          </div>
                          {memberDocuments.some(d => d.documentType === 'medical-reports') && (
                            <Badge className="bg-green-500">
                              <Check className="w-3 h-3 mr-1" />
                              Uploaded
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload your recent health check-up reports or medical history
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('medical-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>
                          <input
                            id="medical-upload"
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDocumentUpload(file, 'primary', 'medical-reports');
                            }}
                          />
                        </div>

                        {memberDocuments.filter(d => d.documentType === 'medical-reports').map((doc) => (
                          <div key={doc.fileName} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {doc.fileUrl.startsWith('data:image') ? (
                                <img src={doc.fileUrl} alt={doc.fileName} className="w-12 h-12 object-cover rounded" />
                              ) : (
                                <FileText className="w-12 h-12 text-gray-400" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.fileName}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument('primary', 'medical-reports')}
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Family Coverage - Members + Documents */}
                {formData.coverageType === 'family' && (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl mb-2">Add Family Members & Upload Documents</h2>
                      <p className="text-muted-foreground">Add all members and upload their documents</p>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription>
                        <strong>Document Guidelines:</strong> Upload Photo ID and Medical Reports for each family member. JPG, PNG or PDF format. Maximum 10MB per file.
                      </AlertDescription>
                    </Alert>

                    {/* Add Member Buttons */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Who do you want to cover?</CardTitle>
                        <CardDescription>Click to add members (ages as of today)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { relation: 'Self', icon: User },
                            { relation: 'Spouse', icon: Heart },
                            { relation: 'Son', icon: User },
                            { relation: 'Daughter', icon: User },
                            { relation: 'Father', icon: User },
                            { relation: 'Mother', icon: User },
                            { relation: 'Father-in-law', icon: User },
                            { relation: 'Mother-in-law', icon: User }
                          ].map((rel) => {
                            const Icon = rel.icon;
                            const isAdded = formData.members.some(m => m.relation === rel.relation);
                            return (
                              <Button
                                key={rel.relation}
                                type="button"
                                variant={isAdded ? 'default' : 'outline'}
                                className="h-auto py-4"
                                onClick={() => !isAdded && addMember(rel.relation)}
                                disabled={isAdded}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <Icon className="w-5 h-5" />
                                  <span className="text-sm">{rel.relation}</span>
                                  {isAdded && <Check className="w-4 h-4" />}
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Member Details + Documents */}
                    {formData.members.map((member) => {
                      const memberDocs = memberDocuments.filter(d => d.memberId === member.id);
                      const hasPhotoId = memberDocs.some(d => d.documentType === 'photo-id');
                      const hasMedicalReports = memberDocs.some(d => d.documentType === 'medical-reports');
                      
                      return (
                        <Card key={member.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <User className="w-5 h-5 text-blue-600" />
                                  {member.relation}
                                </CardTitle>
                                {hasPhotoId && hasMedicalReports && member.age && member.gender && (
                                  <Badge className="bg-green-500 mt-1">
                                    <Check className="w-3 h-3 mr-1" />
                                    Complete
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMember(member.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Member Basic Details */}
                            <div>
                              <h4 className="font-semibold mb-3">Basic Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label>Age *</Label>
                                  <Input
                                    type="number"
                                    placeholder="Age in years"
                                    value={member.age}
                                    onChange={(e) => updateMember(member.id, 'age', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Gender *</Label>
                                  <Select value={member.gender} onValueChange={(value) => updateMember(member.id, 'gender', value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="male">Male</SelectItem>
                                      <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Name (Optional)</Label>
                                  <Input
                                    placeholder="Full name"
                                    value={member.name}
                                    onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Documents Upload */}
                            <div>
                              <h4 className="font-semibold mb-3">Upload Documents</h4>
                              <div className="space-y-4">
                                {/* Photo ID */}
                                <div className="border rounded-lg p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3 flex-1">
                                      <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium">Photo ID Proof</h4>
                                          <Badge variant="destructive" className="text-xs">Required</Badge>
                                          {hasPhotoId && (
                                            <Badge className="bg-green-500 text-xs">
                                              <Check className="w-3 h-3 mr-1" />
                                              Uploaded
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">Aadhaar, PAN, Passport, DL</p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => document.getElementById(`photo-id-${member.id}`)?.click()}
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload
                                    </Button>
                                    <input
                                      id={`photo-id-${member.id}`}
                                      type="file"
                                      accept="image/*,.pdf"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleDocumentUpload(file, member.id, 'photo-id');
                                      }}
                                    />
                                  </div>

                                  {memberDocs.filter(d => d.documentType === 'photo-id').map((doc) => (
                                    <div key={doc.fileName} className="flex items-center justify-between bg-gray-50 p-2 rounded mt-2">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {doc.fileUrl.startsWith('data:image') ? (
                                          <img src={doc.fileUrl} alt={doc.fileName} className="w-10 h-10 object-cover rounded" />
                                        ) : (
                                          <FileText className="w-10 h-10 text-gray-400" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{doc.fileName}</p>
                                          <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeDocument(member.id, 'photo-id')}
                                      >
                                        <X className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>

                                {/* Medical Reports */}
                                <div className="border rounded-lg p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3 flex-1">
                                      <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium">Medical Reports</h4>
                                          <Badge variant="destructive" className="text-xs">Required</Badge>
                                          {hasMedicalReports && (
                                            <Badge className="bg-green-500 text-xs">
                                              <Check className="w-3 h-3 mr-1" />
                                              Uploaded
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">Health check-ups, prescriptions</p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => document.getElementById(`medical-${member.id}`)?.click()}
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload
                                    </Button>
                                    <input
                                      id={`medical-${member.id}`}
                                      type="file"
                                      multiple
                                      accept="image/*,.pdf"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleDocumentUpload(file, member.id, 'medical-reports');
                                      }}
                                    />
                                  </div>

                                  {memberDocs.filter(d => d.documentType === 'medical-reports').map((doc) => (
                                    <div key={doc.fileName} className="flex items-center justify-between bg-gray-50 p-2 rounded mt-2">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {doc.fileUrl.startsWith('data:image') ? (
                                          <img src={doc.fileUrl} alt={doc.fileName} className="w-10 h-10 object-cover rounded" />
                                        ) : (
                                          <FileText className="w-10 h-10 text-gray-400" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{doc.fileName}</p>
                                          <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeDocument(member.id, 'medical-reports')}
                                      >
                                        <X className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {formData.members.length === 0 && (
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription>
                          Please add at least one family member to continue
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}

                {/* Senior Citizen Coverage */}
                {formData.coverageType === 'senior' && (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl mb-2">Upload Senior Citizen Documents</h2>
                      <p className="text-muted-foreground">Upload identity and health documents for the senior citizen</p>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription>
                        <strong>Document Guidelines:</strong> Upload clear, legible copies. JPG, PNG or PDF format. Maximum 10MB per file.
                      </AlertDescription>
                    </Alert>

                    {/* Photo ID Upload */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              Photo ID Proof
                            </CardTitle>
                            <CardDescription>Aadhaar, PAN, Passport, Driving License</CardDescription>
                          </div>
                          {memberDocuments.some(d => d.documentType === 'photo-id') && (
                            <Badge className="bg-green-500">
                              <Check className="w-3 h-3 mr-1" />
                              Uploaded
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload a clear photo or scan of senior citizen's ID proof
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('senior-photo-id')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>
                          <input
                            id="senior-photo-id"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDocumentUpload(file, 'senior', 'photo-id');
                            }}
                          />
                        </div>

                        {memberDocuments.filter(d => d.documentType === 'photo-id').map((doc) => (
                          <div key={doc.fileName} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {doc.fileUrl.startsWith('data:image') ? (
                                <img src={doc.fileUrl} alt={doc.fileName} className="w-12 h-12 object-cover rounded" />
                              ) : (
                                <FileText className="w-12 h-12 text-gray-400" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.fileName}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument('senior', 'photo-id')}
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Medical Reports Upload */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              Medical Reports & Health Records
                            </CardTitle>
                            <CardDescription>Recent health check-up reports, prescriptions, medical history</CardDescription>
                          </div>
                          {memberDocuments.some(d => d.documentType === 'medical-reports') && (
                            <Badge className="bg-green-500">
                              <Check className="w-3 h-3 mr-1" />
                              Uploaded
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload recent health check-up reports and medical history
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('senior-medical')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>
                          <input
                            id="senior-medical"
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDocumentUpload(file, 'senior', 'medical-reports');
                            }}
                          />
                        </div>

                        {memberDocuments.filter(d => d.documentType === 'medical-reports').map((doc) => (
                          <div key={doc.fileName} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {doc.fileUrl.startsWith('data:image') ? (
                                <img src={doc.fileUrl} alt={doc.fileName} className="w-12 h-12 object-cover rounded" />
                              ) : (
                                <FileText className="w-12 h-12 text-gray-400" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.fileName}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument('senior', 'medical-reports')}
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Alert className="bg-amber-50 border-amber-200">
                      <Info className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        <strong>Senior Citizen Plans:</strong> Comprehensive medical reports help in accurate risk assessment and faster claim processing.
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong>Good to know:</strong> These documents help us verify identity and assess health profile for accurate premium calculation.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 3: Sum Insured & Medical History */}
            {step === 3 && (
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl mb-2">Choose Sum Insured</h2>
                  <p className="text-muted-foreground">Select coverage amount for your family</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Sum Insured Amount</CardTitle>
                    <CardDescription>Total coverage for all family members combined</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold text-blue-600 mb-2">
                        ₹{(formData.sumInsured / 100000).toFixed(0)} Lakhs
                      </div>
                      <p className="text-sm text-muted-foreground">Sum Insured</p>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {[300000, 500000, 1000000, 1500000, 2500000, 5000000, 7500000, 10000000, 15000000, 25000000].map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={formData.sumInsured === amount ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFormData({...formData, sumInsured: amount})}
                        >
                          ₹{amount >= 100000 ? `${amount / 100000}L` : `${amount / 1000}K`}
                        </Button>
                      ))}
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm">
                        <strong>Recommended:</strong> ₹5L for individuals, ₹10L+ for families. Higher sum insured ensures better coverage.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Medical History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pre-existing Diseases (If Any)</CardTitle>
                    <CardDescription>Accurate disclosure ensures smooth claim settlement</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['None', 'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Thyroid', 'Kidney Disease', 'Cancer', 'Arthritis'].map((disease) => (
                        <div key={disease} className="flex items-center space-x-2">
                          <Checkbox
                            id={disease}
                            checked={formData.preExistingDiseases.includes(disease)}
                            onCheckedChange={(checked) => {
                              if (disease === 'None') {
                                setFormData({...formData, preExistingDiseases: checked ? ['None'] : []});
                              } else {
                                setFormData({
                                  ...formData,
                                  preExistingDiseases: checked 
                                    ? [...formData.preExistingDiseases.filter(d => d !== 'None'), disease]
                                    : formData.preExistingDiseases.filter(d => d !== disease)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={disease} className="cursor-pointer text-sm">{disease}</Label>
                        </div>
                      ))}
                    </div>

                    {formData.preExistingDiseases.length > 0 && !formData.preExistingDiseases.includes('None') && (
                      <Alert className="bg-orange-50 border-orange-200">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-sm">
                          Pre-existing diseases have a waiting period of 2-4 years. Premium may be slightly higher.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Add-ons */}
            {step === 4 && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl mb-2">Customize Your Coverage</h2>
                  <p className="text-muted-foreground">Add riders to enhance your health protection</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {addOns.map((addon) => {
                    const Icon = addon.icon;
                    const isSelected = formData.selectedAddOns.includes(addon.id);
                    
                    return (
                      <Card
                        key={addon.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          isSelected ? 'ring-2 ring-blue-600 bg-blue-50' : ''
                        }`}
                        onClick={() => toggleAddOn(addon.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold">{addon.name}</h3>
                                <Checkbox checked={isSelected} />
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{addon.description}</p>
                              <p className="text-blue-600 font-semibold">+₹{addon.price}/year</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong>Selected Add-ons:</strong> {formData.selectedAddOns.length === 0 ? 'None (You can add them anytime during policy term)' : `${formData.selectedAddOns.length} add-on(s) selected`}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 5: Medical Information */}
            {step === 5 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical & Lifestyle Information</CardTitle>
                    <CardDescription>For accurate premium calculation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm) *</Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="e.g., 170"
                          value={formData.height}
                          onChange={(e) => {
                            setFormData({...formData, height: e.target.value});
                            if (formData.weight && e.target.value) {
                              const bmi = (parseInt(formData.weight) / Math.pow(parseInt(e.target.value) / 100, 2)).toFixed(1);
                              setFormData(prev => ({...prev, bmi}));
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="e.g., 70"
                          value={formData.weight}
                          onChange={(e) => {
                            setFormData({...formData, weight: e.target.value});
                            if (formData.height && e.target.value) {
                              const bmi = (parseInt(e.target.value) / Math.pow(parseInt(formData.height) / 100, 2)).toFixed(1);
                              setFormData(prev => ({...prev, bmi}));
                            }
                          }}
                        />
                      </div>
                    </div>

                    {formData.bmi && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm">
                          Your BMI: <strong>{formData.bmi}</strong> - {parseFloat(formData.bmi) < 18.5 ? 'Underweight' : parseFloat(formData.bmi) < 25 ? 'Normal' : parseFloat(formData.bmi) < 30 ? 'Overweight' : 'Obese'}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label>Do you smoke or use tobacco?</Label>
                      <RadioGroup value={formData.smoke} onValueChange={(value) => setFormData({...formData, smoke: value})}>
                        <div className="grid grid-cols-2 gap-4">
                          <Card className={`cursor-pointer ${formData.smoke === 'no' ? 'ring-2 ring-blue-600' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="no" id="smoke-no" />
                                <Label htmlFor="smoke-no" className="cursor-pointer flex-1">No</Label>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className={`cursor-pointer ${formData.smoke === 'yes' ? 'ring-2 ring-blue-600' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="yes" id="smoke-yes" />
                                <Label htmlFor="smoke-yes" className="cursor-pointer flex-1">Yes</Label>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Do you consume alcohol?</Label>
                      <RadioGroup value={formData.alcohol} onValueChange={(value) => setFormData({...formData, alcohol: value})}>
                        <div className="grid grid-cols-3 gap-3">
                          {['Never', 'Occasionally', 'Regularly'].map((option) => (
                            <Card key={option} className={`cursor-pointer ${formData.alcohol === option ? 'ring-2 ring-blue-600' : ''}`}>
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value={option} id={`alcohol-${option}`} />
                                  <Label htmlFor={`alcohol-${option}`} className="cursor-pointer text-sm">{option}</Label>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    {(formData.smoke === 'yes' || formData.alcohol === 'Occasionally' || formData.alcohol === 'Regularly') && (
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-sm">
                          <strong>Note:</strong> Smoking and alcohol consumption may affect your premium. Your quote will reflect lifestyle-based adjustments.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 6: Review Quote */}
            {step === 6 && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl mb-2">Review Your Quote</h2>
                  <p className="text-muted-foreground">Here's your personalized health insurance quote</p>
                </div>

                {(() => {
                  const quote = getQuote();
                  return (
                    <>
                      {/* Company Info */}
                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg">
                                {quote.insurer.logo}
                              </div>
                              <div>
                                <h3 className="text-2xl font-semibold">{quote.insurer.name}</h3>
                                <div className="flex items-center gap-4 mt-1">
                                  <div className="flex items-center gap-1 text-sm">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span>{quote.insurer.rating} Rating</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>{quote.insurer.claimSettlement}% Claim Settlement</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-green-500 text-lg px-4 py-2">Trusted Partner</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Coverage Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            Coverage Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Coverage Type</p>
                              <p className="font-semibold capitalize">{formData.coverageType === 'self' ? 'Individual' : formData.coverageType === 'senior' ? 'Senior Citizen' : 'Family'}</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Sum Insured</p>
                              <p className="font-semibold">₹{(quote.sumInsured / 100000).toFixed(0)} Lakh</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Members</p>
                              <p className="font-semibold">{formData.coverageType === 'family' ? formData.members.length : '1'}</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Add-ons</p>
                              <p className="font-semibold">{formData.selectedAddOns.length}</p>
                            </div>
                          </div>

                          {formData.coverageType === 'family' && formData.members.length > 0 && (
                            <div className="pt-4 border-t">
                              <h4 className="font-semibold mb-3">Covered Members</h4>
                              <div className="flex flex-wrap gap-2">
                                {formData.members.map((member) => (
                                  <Badge key={member.id} variant="secondary" className="px-3 py-1">
                                    {member.relation} ({member.age}y, {member.gender})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {formData.selectedAddOns.length > 0 && (
                            <div className="pt-4 border-t">
                              <h4 className="font-semibold mb-3">Selected Add-ons</h4>
                              <div className="space-y-2">
                                {formData.selectedAddOns.map((addon) => (
                                  <div key={addon} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="capitalize">{addon.replace('-', ' ')}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Benefits */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-blue-600" />
                            Key Benefits
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                              <div>
                                <p className="font-medium">Cashless Treatment</p>
                                <p className="text-sm text-muted-foreground">At {quote.cashlessHospitals}+ network hospitals</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                              <div>
                                <p className="font-medium">Room Rent</p>
                                <p className="text-sm text-muted-foreground">{quote.roomRent}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                              <div>
                                <p className="font-medium">No Co-payment</p>
                                <p className="text-sm text-muted-foreground">100% claim coverage</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                              <div>
                                <p className="font-medium">Pre & Post Hospitalization</p>
                                <p className="text-sm text-muted-foreground">60 days pre, 90 days post</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                              <div>
                                <p className="font-medium">Day Care Procedures</p>
                                <p className="text-sm text-muted-foreground">400+ procedures covered</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                              <div>
                                <p className="font-medium">Ambulance Cover</p>
                                <p className="text-sm text-muted-foreground">Up to ₹3,000 per claim</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Premium Breakdown */}
                      <Card className="border-blue-200">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
                          <CardTitle>Premium Breakdown</CardTitle>
                          <CardDescription className="text-blue-100">Your personalized quote</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Base Premium</span>
                            <span className="font-medium">₹{quote.basePremium.toLocaleString()}</span>
                          </div>
                          
                          {quote.lifestyleLoading > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground text-amber-600">
                                Lifestyle Loading
                                {(formData.smoke === 'yes' || formData.alcohol === 'Occasionally' || formData.alcohol === 'Regularly') && (
                                  <span className="text-xs block">
                                    {formData.smoke === 'yes' && '(Smoking) '}
                                    {formData.alcohol === 'Occasionally' && '(Occasional Alcohol) '}
                                    {formData.alcohol === 'Regularly' && '(Regular Alcohol)'}
                                  </span>
                                )}
                              </span>
                              <span className="font-medium text-amber-600">+₹{quote.lifestyleLoading.toLocaleString()}</span>
                            </div>
                          )}
                          
                          {quote.addOnCost > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Add-ons Cost ({formData.selectedAddOns.length})</span>
                              <span className="font-medium">₹{quote.addOnCost.toLocaleString()}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">GST (18%)</span>
                            <span className="font-medium">₹{quote.gst.toLocaleString()}</span>
                          </div>

                          <Separator />

                          <div className="flex items-center justify-between pt-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Annual Premium</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Or ₹{quote.monthlyPremium.toLocaleString()}/month
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-blue-600">
                                ₹{quote.totalPremium.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <Alert className="bg-green-50 border-green-200 mt-4">
                            <Info className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-sm">
                              <strong>Tax Benefit:</strong> Save up to ₹25,000 tax under Section 80D
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}

                {formData.selectedInsurer && !isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <Card className="max-w-2xl mx-auto">
                      <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock className="w-8 h-8 text-blue-600" />
                        </div>
                        <CardTitle>Login to Continue</CardTitle>
                        <CardDescription>Save your progress and complete purchase</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                          </TabsList>

                          <TabsContent value="login" className="space-y-4 mt-6">
                            <div className="space-y-2">
                              <Label htmlFor="login-email">Email Address *</Label>
                              <Input
                                id="login-email"
                                type="email"
                                placeholder="your@email.com"
                                value={authForm.email}
                                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="login-password">Password *</Label>
                              <Input
                                id="login-password"
                                type="password"
                                placeholder="Enter your password"
                                value={authForm.password}
                                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                              />
                            </div>
                            <Button 
                              onClick={handleAuthSubmit}
                              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
                            >
                              Login & Continue
                            </Button>
                          </TabsContent>

                          <TabsContent value="register" className="space-y-4 mt-6">
                            <div className="space-y-2">
                              <Label htmlFor="register-name">Full Name *</Label>
                              <Input
                                id="register-name"
                                placeholder="Enter your full name"
                                value={authForm.name}
                                onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="register-email">Email Address *</Label>
                              <Input
                                id="register-email"
                                type="email"
                                placeholder="your@email.com"
                                value={authForm.email}
                                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="register-password">Password *</Label>
                              <Input
                                id="register-password"
                                type="password"
                                placeholder="Create a strong password"
                                value={authForm.password}
                                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                              />
                            </div>
                            <Button 
                              onClick={handleAuthSubmit}
                              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Register & Continue
                            </Button>
                          </TabsContent>
                        </Tabs>

                        <div className="relative">
                          <Separator />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-white px-2 text-xs text-muted-foreground">Or</span>
                          </div>
                        </div>

                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setStep(6);
                            toast.info('Continuing as guest');
                          }}
                        >
                          Continue as Guest
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 7: Contact Information */}
            {step === 7 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Where should we send your policy documents?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Mobile Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          placeholder="6-digit pincode"
                          value={formData.pincode}
                          onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                          maxLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="Your city"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address (Optional)</Label>
                      <Input
                        id="address"
                        placeholder="Complete address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm">
                        Policy document and renewal reminders will be sent to this email and mobile number.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            )}



            {/* Step 8: Nominee Details */}
            {step === 8 && (
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Nominee Information</CardTitle>
                    <CardDescription>Who should receive the policy benefits?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm">
                        A nominee is the person who will manage claims in case of hospitalization of insured members.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="nomineeName">Nominee Name *</Label>
                      <Input
                        id="nomineeName"
                        placeholder="Full name of nominee"
                        value={formData.nomineeName}
                        onChange={(e) => setFormData({...formData, nomineeName: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomineeRelation">Relationship *</Label>
                        <Select value={formData.nomineeRelation} onValueChange={(value) => setFormData({...formData, nomineeRelation: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nomineDOB">Nominee Date of Birth</Label>
                        <Input
                          id="nomineDOB"
                          type="date"
                          value={formData.nomineDOB}
                          onChange={(e) => setFormData({...formData, nomineDOB: e.target.value})}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 9: KYC Documents */}
            {step === 9 && (
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl mb-2">KYC & Identity Verification</h2>
                  <p className="text-muted-foreground">Complete KYC for both User and Nominee (IRDAI Mandatory)</p>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    <strong>IRDAI Compliance:</strong> KYC is mandatory for both policyholder and nominee as per IRDAI guidelines. All information is encrypted and secure.
                  </AlertDescription>
                </Alert>

                {/* USER KYC SECTION */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-600">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl text-blue-600">User KYC Details</h3>
                      <p className="text-sm text-muted-foreground">Primary Policyholder Verification</p>
                    </div>
                  </div>

                  <Card className="border-blue-200 shadow-md">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-600" />
                        User Identity Documents
                      </CardTitle>
                      <CardDescription>Upload clear, legible copies (JPG, PNG, or PDF)</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {/* User PAN Details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="userPanNumber" className="text-base">PAN Number *</Label>
                            <Input
                              id="userPanNumber"
                              placeholder="ABCDE1234F"
                              value={formData.userPanNumber}
                              onChange={(e) => setFormData({...formData, userPanNumber: e.target.value.toUpperCase()})}
                              className="uppercase"
                              maxLength={10}
                            />
                            <p className="text-xs text-muted-foreground">Enter your 10-digit PAN number</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="userAadhaarNumber" className="text-base">Aadhaar Number *</Label>
                            <Input
                              id="userAadhaarNumber"
                              placeholder="XXXX XXXX XXXX"
                              value={formData.userAadhaarNumber}
                              onChange={(e) => setFormData({...formData, userAadhaarNumber: e.target.value})}
                              maxLength={12}
                            />
                            <p className="text-xs text-muted-foreground">12-digit Aadhaar number</p>
                          </div>
                        </div>

                        {/* PAN Card Upload */}
                        <div className="space-y-3">
                          <Label className="text-base flex items-center gap-2">
                            PAN Card Copy *
                            {userKycDocuments['pan-card'] && (
                              <Badge className="bg-green-500">
                                <Check className="w-3 h-3 mr-1" />
                                Uploaded
                              </Badge>
                            )}
                          </Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-muted-foreground mb-3">
                              Upload a clear copy of your PAN Card
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('user-pan-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                            <input
                              id="user-pan-upload"
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUserKycUpload(file, 'pan-card');
                              }}
                            />
                          </div>
                          {userKycDocuments['pan-card'] && (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {userKycDocuments['pan-card'].fileUrl.startsWith('data:image') ? (
                                  <img src={userKycDocuments['pan-card'].fileUrl} alt="PAN Card" className="w-12 h-12 object-cover rounded" />
                                ) : (
                                  <FileText className="w-12 h-12 text-green-600" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{userKycDocuments['pan-card'].fileName}</p>
                                  <p className="text-xs text-muted-foreground">{formatFileSize(userKycDocuments['pan-card'].fileSize)}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeUserKycDocument('pan-card')}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Aadhaar Card Upload */}
                        <div className="space-y-3">
                          <Label className="text-base flex items-center gap-2">
                            Aadhaar Card Copy *
                            {userKycDocuments['aadhaar-card'] && (
                              <Badge className="bg-green-500">
                                <Check className="w-3 h-3 mr-1" />
                                Uploaded
                              </Badge>
                            )}
                          </Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-muted-foreground mb-3">
                              Upload both sides of your Aadhaar Card
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('user-aadhaar-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                            <input
                              id="user-aadhaar-upload"
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUserKycUpload(file, 'aadhaar-card');
                              }}
                            />
                          </div>
                          {userKycDocuments['aadhaar-card'] && (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {userKycDocuments['aadhaar-card'].fileUrl.startsWith('data:image') ? (
                                  <img src={userKycDocuments['aadhaar-card'].fileUrl} alt="Aadhaar Card" className="w-12 h-12 object-cover rounded" />
                                ) : (
                                  <FileText className="w-12 h-12 text-green-600" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{userKycDocuments['aadhaar-card'].fileName}</p>
                                  <p className="text-xs text-muted-foreground">{formatFileSize(userKycDocuments['aadhaar-card'].fileSize)}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeUserKycDocument('aadhaar-card')}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* User Photo Upload */}
                        <div className="space-y-3">
                          <Label className="text-base flex items-center gap-2">
                            Recent Photograph *
                            {userKycDocuments['photo'] && (
                              <Badge className="bg-green-500">
                                <Check className="w-3 h-3 mr-1" />
                                Uploaded
                              </Badge>
                            )}
                          </Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <Camera className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-muted-foreground mb-3">
                              Upload a recent passport-size photograph
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('user-photo-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                            <input
                              id="user-photo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUserKycUpload(file, 'photo');
                              }}
                            />
                          </div>
                          {userKycDocuments['photo'] && (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <img src={userKycDocuments['photo'].fileUrl} alt="Photo" className="w-12 h-12 object-cover rounded" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{userKycDocuments['photo'].fileName}</p>
                                  <p className="text-xs text-muted-foreground">{formatFileSize(userKycDocuments['photo'].fileSize)}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeUserKycDocument('photo')}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Address Proof Upload (Optional) */}
                        <div className="space-y-3">
                          <Label className="text-base flex items-center gap-2">
                            Address Proof (Optional)
                            {userKycDocuments['address-proof'] && (
                              <Badge className="bg-green-500">
                                <Check className="w-3 h-3 mr-1" />
                                Uploaded
                              </Badge>
                            )}
                          </Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <Home className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-muted-foreground mb-3">
                              Utility bill, Bank statement, Rental agreement
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('user-address-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                            <input
                              id="user-address-upload"
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUserKycUpload(file, 'address-proof');
                              }}
                            />
                          </div>
                          {userKycDocuments['address-proof'] && (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {userKycDocuments['address-proof'].fileUrl.startsWith('data:image') ? (
                                  <img src={userKycDocuments['address-proof'].fileUrl} alt="Address Proof" className="w-12 h-12 object-cover rounded" />
                                ) : (
                                  <FileText className="w-12 h-12 text-green-600" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{userKycDocuments['address-proof'].fileName}</p>
                                  <p className="text-xs text-muted-foreground">{formatFileSize(userKycDocuments['address-proof'].fileSize)}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeUserKycDocument('address-proof')}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Additional Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="userAddress">Residential Address</Label>
                            <Input
                              id="userAddress"
                              placeholder="Complete address with pincode"
                              value={formData.userAddress}
                              onChange={(e) => setFormData({...formData, userAddress: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="userIncomeRange">Annual Income Range (Optional)</Label>
                            <Select value={formData.userIncomeRange} onValueChange={(value) => setFormData({...formData, userIncomeRange: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select income range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0-3">₹0 - 3 Lakhs</SelectItem>
                                <SelectItem value="3-5">₹3 - 5 Lakhs</SelectItem>
                                <SelectItem value="5-10">₹5 - 10 Lakhs</SelectItem>
                                <SelectItem value="10-25">₹10 - 25 Lakhs</SelectItem>
                                <SelectItem value="25+">₹25+ Lakhs</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* NOMINEE KYC SECTION */}
                <div className="space-y-6 pt-8">
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-green-600">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl text-green-600">Nominee KYC Details</h3>
                      <p className="text-sm text-muted-foreground">Nominee Verification - {formData.nomineeName || 'Not Set'}</p>
                    </div>
                  </div>

                  <Card className="border-green-200 shadow-md">
                    <CardHeader className="bg-green-50">
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-green-600" />
                        Nominee Identity Documents
                      </CardTitle>
                      <CardDescription>Upload clear, legible copies (JPG, PNG, or PDF)</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {/* Nominee PAN Details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nomineePanNumber" className="text-base">PAN Number *</Label>
                            <Input
                              id="nomineePanNumber"
                              placeholder="ABCDE1234F"
                              value={formData.nomineePanNumber}
                              onChange={(e) => setFormData({...formData, nomineePanNumber: e.target.value.toUpperCase()})}
                              className="uppercase"
                              maxLength={10}
                            />
                            <p className="text-xs text-muted-foreground">Nominee's 10-digit PAN number</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nomineeAadhaarNumber" className="text-base">Aadhaar Number *</Label>
                            <Input
                              id="nomineeAadhaarNumber"
                              placeholder="XXXX XXXX XXXX"
                              value={formData.nomineeAadhaarNumber}
                              onChange={(e) => setFormData({...formData, nomineeAadhaarNumber: e.target.value})}
                              maxLength={12}
                            />
                            <p className="text-xs text-muted-foreground">Nominee's 12-digit Aadhaar number</p>
                          </div>
                        </div>

                        {/* PAN Card Upload */}
                        <div className="space-y-3">
                          <Label className="text-base flex items-center gap-2">
                            PAN Card Copy *
                            {nomineeKycDocuments['pan-card'] && (
                              <Badge className="bg-green-500">
                                <Check className="w-3 h-3 mr-1" />
                                Uploaded
                              </Badge>
                            )}
                          </Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-muted-foreground mb-3">
                              Upload a clear copy of nominee's PAN Card
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('nominee-pan-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                            <input
                              id="nominee-pan-upload"
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleNomineeKycUpload(file, 'pan-card');
                              }}
                            />
                          </div>
                          {nomineeKycDocuments['pan-card'] && (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {nomineeKycDocuments['pan-card'].fileUrl.startsWith('data:image') ? (
                                  <img src={nomineeKycDocuments['pan-card'].fileUrl} alt="PAN Card" className="w-12 h-12 object-cover rounded" />
                                ) : (
                                  <FileText className="w-12 h-12 text-green-600" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{nomineeKycDocuments['pan-card'].fileName}</p>
                                  <p className="text-xs text-muted-foreground">{formatFileSize(nomineeKycDocuments['pan-card'].fileSize)}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNomineeKycDocument('pan-card')}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Aadhaar Card Upload */}
                        <div className="space-y-3">
                          <Label className="text-base flex items-center gap-2">
                            Aadhaar Card Copy *
                            {nomineeKycDocuments['aadhaar-card'] && (
                              <Badge className="bg-green-500">
                                <Check className="w-3 h-3 mr-1" />
                                Uploaded
                              </Badge>
                            )}
                          </Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-muted-foreground mb-3">
                              Upload both sides of nominee's Aadhaar Card
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('nominee-aadhaar-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                            <input
                              id="nominee-aadhaar-upload"
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleNomineeKycUpload(file, 'aadhaar-card');
                              }}
                            />
                          </div>
                          {nomineeKycDocuments['aadhaar-card'] && (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {nomineeKycDocuments['aadhaar-card'].fileUrl.startsWith('data:image') ? (
                                  <img src={nomineeKycDocuments['aadhaar-card'].fileUrl} alt="Aadhaar Card" className="w-12 h-12 object-cover rounded" />
                                ) : (
                                  <FileText className="w-12 h-12 text-green-600" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{nomineeKycDocuments['aadhaar-card'].fileName}</p>
                                  <p className="text-xs text-muted-foreground">{formatFileSize(nomineeKycDocuments['aadhaar-card'].fileSize)}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNomineeKycDocument('aadhaar-card')}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Nominee Photo Upload */}
                        <div className="space-y-3">
                          <Label className="text-base flex items-center gap-2">
                            Recent Photograph *
                            {nomineeKycDocuments['photo'] && (
                              <Badge className="bg-green-500">
                                <Check className="w-3 h-3 mr-1" />
                                Uploaded
                              </Badge>
                            )}
                          </Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                            <Camera className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-muted-foreground mb-3">
                              Upload a recent passport-size photograph of nominee
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('nominee-photo-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                            <input
                              id="nominee-photo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleNomineeKycUpload(file, 'photo');
                              }}
                            />
                          </div>
                          {nomineeKycDocuments['photo'] && (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <img src={nomineeKycDocuments['photo'].fileUrl} alt="Photo" className="w-12 h-12 object-cover rounded" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{nomineeKycDocuments['photo'].fileName}</p>
                                  <p className="text-xs text-muted-foreground">{formatFileSize(nomineeKycDocuments['photo'].fileSize)}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNomineeKycDocument('photo')}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Address Proof Upload (Optional) */}
                        <div className="space-y-3">
                          <Label className="text-base flex items-center gap-2">
                            Address Proof (Optional)
                            {nomineeKycDocuments['address-proof'] && (
                              <Badge className="bg-green-500">
                                <Check className="w-3 h-3 mr-1" />
                                Uploaded
                              </Badge>
                            )}
                          </Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                            <Home className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-muted-foreground mb-3">
                              Utility bill, Bank statement, Rental agreement
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('nominee-address-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                            <input
                              id="nominee-address-upload"
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleNomineeKycUpload(file, 'address-proof');
                              }}
                            />
                          </div>
                          {nomineeKycDocuments['address-proof'] && (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {nomineeKycDocuments['address-proof'].fileUrl.startsWith('data:image') ? (
                                  <img src={nomineeKycDocuments['address-proof'].fileUrl} alt="Address Proof" className="w-12 h-12 object-cover rounded" />
                                ) : (
                                  <FileText className="w-12 h-12 text-green-600" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{nomineeKycDocuments['address-proof'].fileName}</p>
                                  <p className="text-xs text-muted-foreground">{formatFileSize(nomineeKycDocuments['address-proof'].fileSize)}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNomineeKycDocument('address-proof')}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Nominee Address */}
                        <div className="space-y-2 pt-4">
                          <Label htmlFor="nomineeAddress">Nominee Residential Address</Label>
                          <Input
                            id="nomineeAddress"
                            placeholder="Complete address with pincode"
                            value={formData.nomineeAddress}
                            onChange={(e) => setFormData({...formData, nomineeAddress: e.target.value})}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom Alert */}
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    <strong>Important:</strong> All uploaded documents will be verified within 24-48 hours. Incorrect or unclear documents may delay policy issuance.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 10: Payment */}
            {step === 10 && (
              <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Choose your preferred payment method</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Premium Summary */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-blue-100 mb-1">Total Annual Premium</p>
                          <div className="text-4xl font-bold">
                            ₹{formData.selectedQuote.totalPremium?.toLocaleString() || '0'}
                          </div>
                          <p className="text-sm text-blue-100 mt-2">
                            ₹{(formData.sumInsured / 100000).toFixed(0)}L cover • {formData.members.length} members
                          </p>
                        </div>
                        <Shield className="w-16 h-16 text-blue-200" />
                      </div>
                      <div className="space-y-2 text-sm border-t border-blue-300 pt-4 text-blue-100">
                        <div className="flex justify-between">
                          <span>Base Premium</span>
                          <span>₹{formData.selectedQuote.basePremium?.toLocaleString() || '0'}</span>
                        </div>
                        {formData.selectedAddOns.length > 0 && (
                          <div className="flex justify-between">
                            <span>Add-ons ({formData.selectedAddOns.length})</span>
                            <span>₹{formData.selectedAddOns.reduce((sum, id) => {
                              const addon = addOns.find(a => a.id === id);
                              return sum + (addon?.price || 0);
                            }, 0).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>GST (18%)</span>
                          <span>Included</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-4">
                      <Label>Select Payment Method *</Label>
                      <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                        <div className="space-y-3">
                          <Card className={`cursor-pointer ${formData.paymentMethod === 'card' ? 'ring-2 ring-blue-600' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="card" id="payment-card" />
                                <Label htmlFor="payment-card" className="flex items-center gap-3 cursor-pointer flex-1">
                                  <CreditCard className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <div className="font-semibold">Credit / Debit Card</div>
                                    <div className="text-sm text-muted-foreground">All major cards accepted</div>
                                  </div>
                                </Label>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className={`cursor-pointer ${formData.paymentMethod === 'upi' ? 'ring-2 ring-blue-600' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="upi" id="payment-upi" />
                                <Label htmlFor="payment-upi" className="flex items-center gap-3 cursor-pointer flex-1">
                                  <Zap className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <div className="font-semibold">UPI</div>
                                    <div className="text-sm text-muted-foreground">Google Pay, PhonePe, Paytm</div>
                                  </div>
                                </Label>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className={`cursor-pointer ${formData.paymentMethod === 'netbanking' ? 'ring-2 ring-blue-600' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="netbanking" id="payment-netbanking" />
                                <Label htmlFor="payment-netbanking" className="flex items-center gap-3 cursor-pointer flex-1">
                                  <Building2 className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <div className="font-semibold">Net Banking</div>
                                    <div className="text-sm text-muted-foreground">All major banks</div>
                                  </div>
                                </Label>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Card Details Form */}
                    {formData.paymentMethod === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 border-t pt-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                            maxLength={16}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardExpiry">Expiry Date</Label>
                            <Input
                              id="cardExpiry"
                              placeholder="MM/YY"
                              value={formData.cardExpiry}
                              onChange={(e) => setFormData({...formData, cardExpiry: e.target.value})}
                              maxLength={5}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardCVV">CVV</Label>
                            <Input
                              id="cardCVV"
                              type="password"
                              placeholder="123"
                              value={formData.cardCVV}
                              onChange={(e) => setFormData({...formData, cardCVV: e.target.value})}
                              maxLength={3}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* UPI Form */}
                    {formData.paymentMethod === 'upi' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 border-t pt-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="upiId">UPI ID</Label>
                          <Input
                            id="upiId"
                            placeholder="yourname@upi"
                            value={formData.upiId}
                            onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Terms & Conditions */}
                    <div className="border-t pt-4">
                      <div className="flex items-start gap-3">
                        <Checkbox id="terms" />
                        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                          I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</a> and confirm that all health information provided is accurate and complete.
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 11: Confirmation */}
            {step === 11 && (
              <div className="max-w-3xl mx-auto">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center mb-8"
                >
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                  <h1 className="text-4xl mb-3">Congratulations!</h1>
                  <p className="text-xl text-muted-foreground">Your health insurance policy is now active</p>
                </motion.div>

                <Card className="mb-6">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
                    <CardTitle>Policy Details</CardTitle>
                    <CardDescription className="text-blue-100">Your family is now protected</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-muted-foreground">Policy Number</Label>
                        <p className="text-xl font-semibold">{policyNumber}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Insurer</Label>
                        <p className="text-xl font-semibold">
                          {insurers.find(i => i.id === formData.selectedInsurer)?.name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Sum Insured</Label>
                        <p className="font-semibold">₹{(formData.sumInsured / 100000).toFixed(0)} Lakhs</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Members Covered</Label>
                        <p className="font-semibold">{formData.members.length} Members</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Policy Period</Label>
                        <p className="font-semibold">1 Year</p>
                        <p className="text-sm text-muted-foreground">
                          Valid till {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Annual Premium</Label>
                        <p className="text-xl font-semibold text-blue-600">
                          ₹{formData.selectedQuote.totalPremium?.toLocaleString()}
                        </p>
                      </div>
                      {formData.selectedAddOns.length > 0 && (
                        <div className="md:col-span-2">
                          <Label className="text-muted-foreground">Add-ons Included</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.selectedAddOns.map(addonId => {
                              const addon = addOns.find(a => a.id === addonId);
                              return addon ? (
                                <Badge key={addonId} variant="secondary">{addon.name}</Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator className="my-6" />

                    <div className="flex flex-col md:flex-row gap-3">
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download Policy
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Policy
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong>What's Next?</strong> Policy document has been sent to {formData.email}. You can access it anytime from your dashboard. Free health check-up available after 1 year.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Buy Another Policy
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 11 && (
          <div className="flex items-center justify-between max-w-4xl mx-auto mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            
            {step < 10 ? (
              <Button
                onClick={handleNext}
                className="ml-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : step === 10 ? (
              <Button
                onClick={handleSubmit}
                className="ml-auto bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
              >
                Complete Payment
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : null}
          </div>
        )}

        {/* Help Section */}
        {step < 11 && (
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Need Help?</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Our health insurance experts are available 24/7. Call us at <strong>1800-123-4567</strong> or email <strong>health@secureinsure.com</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-white">
                        <Clock className="w-3 h-3 mr-1" />
                        24/7 Support
                      </Badge>
                      <Badge variant="secondary" className="bg-white">
                        <Shield className="w-3 h-3 mr-1" />
                        IRDAI Approved
                      </Badge>
                      <Badge variant="secondary" className="bg-white">
                        <Award className="w-3 h-3 mr-1" />
                        Cashless at 10,000+ Hospitals
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

import { useState } from 'react';
import { ChevronRight, Check, Car, Shield, Wrench, MapPin, Calendar, DollarSign, Plus, Info, ArrowLeft, ArrowRight, Star, Zap, CreditCard, User, FileText, Upload, Building2, Phone, Mail, CheckCircle, Download, Share2, Home, TrendingUp, Award, Clock, X, Lock, UserPlus, Camera } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/AuthContext';

const carBrands = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'Kia', 'Volkswagen', 'Ford', 'Renault'];

const carModels: { [key: string]: string[] } = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'WagonR', 'Dzire', 'Brezza', 'Ertiga', 'Alto'],
  'Hyundai': ['Creta', 'i20', 'Venue', 'Verna', 'Grand i10 Nios', 'Elantra'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Punch', 'Tiago', 'Tigor'],
  'Mahindra': ['XUV700', 'Scorpio', 'Thar', 'XUV300', 'Bolero'],
  'Honda': ['City', 'Amaze', 'Jazz', 'WR-V', 'Civic'],
  'Toyota': ['Fortuner', 'Innova Crysta', 'Urban Cruiser', 'Glanza'],
  'Kia': ['Seltos', 'Sonet', 'Carens', 'Carnival'],
  'Volkswagen': ['Polo', 'Vento', 'Taigun', 'Tiguan'],
  'Ford': ['EcoSport', 'Figo', 'Aspire', 'Endeavour'],
  'Renault': ['Kwid', 'Triber', 'Kiger', 'Duster']
};

const insurers = [
  { id: 'icici', name: 'ICICI Lombard', rating: 4.6, claimSettlement: 96.5, logo: '🏦' },
  { id: 'hdfc', name: 'HDFC ERGO', rating: 4.5, claimSettlement: 95.2, logo: '🏛️' },
  { id: 'bajaj', name: 'Bajaj Allianz', rating: 4.4, claimSettlement: 94.8, logo: '🏢' },
  { id: 'tata', name: 'Tata AIG', rating: 4.3, claimSettlement: 93.5, logo: '🏭' },
  { id: 'sbi', name: 'SBI General', rating: 4.2, claimSettlement: 92.8, logo: '🏦' },
  { id: 'reliance', name: 'Reliance General', rating: 4.3, claimSettlement: 93.2, logo: '🏢' }
];

const coverageTypes = [
  {
    id: 'third-party',
    name: 'Third Party Only',
    description: 'Mandatory legal liability coverage',
    features: ['Legal requirement met', 'Covers third-party damage', 'Injury liability coverage', 'Death liability coverage'],
    icon: Shield,
    popular: false
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    description: 'Complete protection for your vehicle',
    features: ['Own damage cover', 'Third-party liability', 'Theft protection', 'Natural calamities', 'Fire coverage', 'Personal accident cover'],
    icon: Car,
    popular: true
  },
  {
    id: 'standalone-od',
    name: 'Own Damage Only',
    description: 'Coverage for your vehicle damage',
    features: ['Own vehicle damage', 'Theft protection', 'Natural calamities', 'Fire & explosion', 'Riot & strike damage'],
    icon: Wrench,
    popular: false
  }
];

const addOns = [
  { id: 'zero-dep', name: 'Zero Depreciation', price: 2500, icon: Star, description: 'No depreciation on claim amount' },
  { id: 'roadside', name: 'Roadside Assistance', price: 800, icon: Wrench, description: '24/7 emergency support' },
  { id: 'engine', name: 'Engine Protection', price: 1500, icon: Zap, description: 'Cover for engine & gearbox' },
  { id: 'ncb', name: 'NCB Protection', price: 600, icon: Shield, description: 'Protect your no-claim bonus' },
  { id: 'return', name: 'Return to Invoice', price: 1200, icon: DollarSign, description: 'Get invoice value on total loss' },
  { id: 'consumables', name: 'Consumables Cover', price: 700, icon: Plus, description: 'Nuts, bolts, oil, etc.' },
  { id: 'tyre', name: 'Tyre Protection', price: 500, icon: Car, description: 'Cover for tyre damage' },
  { id: 'key', name: 'Key Replacement', price: 400, icon: Shield, description: 'Lost or stolen key replacement' }
];

export default function CarInsurance() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, register } = useAuth();
  const [step, setStep] = useState(1);
  const [isNewCar, setIsNewCar] = useState<boolean | null>(null);
  const [policyNumber, setPolicyNumber] = useState('');
  const [showAuthStep, setShowAuthStep] = useState(false);
  
  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  // Document uploads
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    aadhaarPhoto?: { name: string; url: string };
    licensePhoto?: { name: string; url: string };
    rcPhoto?: { name: string; url: string };
  }>({});
  
  const [formData, setFormData] = useState({
    // Step 1: Vehicle Identification
    registrationNumber: '',
    isNewVehicle: 'false',
    
    // Step 2: Vehicle Details
    brand: '',
    model: '',
    variant: '',
    yearOfPurchase: '',
    fuelType: '',
    engineCC: '',
    rto: '',
    
    // Previous Insurance
    previousInsurer: '',
    previousPolicyNumber: '',
    policyExpiryDate: '',
    ncbPercentage: '0',
    claimsMade: 'no',
    
    // Step 4: Document Details
    aadhaarNumber: '',
    licenseNumber: '',
    rcNumber: '',
    
    // Step 5: Coverage & IDV
    idv: 500000,
    selectedCoverage: '',
    
    // Step 6: Add-ons
    selectedAddOns: [] as string[],
    
    // Step 7: Selected Insurer & Plan
    selectedInsurer: '',
    selectedPlan: {} as any,
    
    // Step 8: Policy Holder Details (KYC)
    nomineName: '',
    nomineRelation: '',
    nomineDOB: '',
    panNumber: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    
    // Step 9: Payment
    paymentMethod: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    upiId: ''
  });

  const steps = [
    { num: 1, title: 'Identify Vehicle', icon: Car },
    { num: 2, title: 'Login/Register', icon: Lock },
    { num: 3, title: 'Vehicle Details', icon: Car },
    { num: 4, title: 'Documents', icon: Upload },
    { num: 5, title: 'Coverage & IDV', icon: Shield },
    { num: 6, title: 'Add-ons', icon: Plus },
    { num: 7, title: 'Compare & Select', icon: TrendingUp },
    { num: 8, title: 'Policy Holder', icon: FileText },
    { num: 9, title: 'Payment', icon: CreditCard },
    { num: 10, title: 'Confirmation', icon: CheckCircle }
  ];

  const calculateBasePremium = (coverageType: string, insurerId: string) => {
    const basePrices: { [key: string]: number } = {
      'third-party': 2500,
      'comprehensive': 8500,
      'standalone-od': 6000
    };
    
    let premium = basePrices[coverageType] || 0;
    
    // IDV factor
    const idvFactor = formData.idv / 500000;
    premium *= idvFactor;
    
    // NCB discount
    const ncbDiscount = parseInt(formData.ncbPercentage) / 100;
    premium *= (1 - ncbDiscount);
    
    // Claims history
    if (formData.claimsMade === 'yes') {
      premium *= 1.2;
    }
    
    // Fuel type
    if (formData.fuelType === 'diesel') {
      premium *= 1.1;
    } else if (formData.fuelType === 'electric') {
      premium *= 0.9;
    }
    
    // Insurer variation (slight price differences)
    const insurerIndex = insurers.findIndex(i => i.id === insurerId);
    const variation = 1 + (insurerIndex * 0.03 - 0.05); // -5% to +10%
    premium *= variation;
    
    return Math.round(premium);
  };

  const calculateTotalPremium = (basePremium: number) => {
    const addOnsCost = formData.selectedAddOns.reduce((sum, addonId) => {
      const addon = addOns.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    
    const gst = (basePremium + addOnsCost) * 0.18; // 18% GST
    return Math.round(basePremium + addOnsCost + gst);
  };

  const getQuotes = () => {
    if (!formData.selectedCoverage) return [];
    
    return insurers.map(insurer => {
      const basePremium = calculateBasePremium(formData.selectedCoverage, insurer.id);
      const totalPremium = calculateTotalPremium(basePremium);
      const coverage = coverageTypes.find(c => c.id === formData.selectedCoverage);
      
      return {
        insurer,
        basePremium,
        totalPremium,
        coverage: coverage?.name || '',
        features: coverage?.features || [],
        addOns: formData.selectedAddOns.length,
        savings: Math.round(Math.random() * 3000) // Mock savings
      };
    });
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
      setShowAuthStep(false);
      setStep(3); // Move to vehicle details step
    } catch (error) {
      toast.error('Authentication failed. Please try again.');
    }
  };

  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!isNewCar && !formData.registrationNumber) {
        toast.error('Please enter vehicle registration number or select new car');
        return;
      }
      // Check if user is authenticated
      if (!isAuthenticated) {
        setShowAuthStep(true);
        setStep(2);
        return;
      } else {
        setStep(3); // Skip auth step if already logged in
        return;
      }
    }
    
    if (step === 2) {
      // Auth step - handled by handleAuthSubmit
      return;
    }
    
    if (step === 3) {
      if (!formData.brand || !formData.yearOfPurchase || !formData.fuelType) {
        toast.error('Please fill all required vehicle details');
        return;
      }
    }
    
    if (step === 4) {
      if (!formData.aadhaarNumber || !formData.licenseNumber || !formData.rcNumber) {
        toast.error('Please fill all document numbers');
        return;
      }
      if (!uploadedDocuments.aadhaarPhoto || !uploadedDocuments.licensePhoto || !uploadedDocuments.rcPhoto) {
        toast.error('Please upload all required documents');
        return;
      }
    }
    
    if (step === 5 && !formData.selectedCoverage) {
      toast.error('Please select a coverage type');
      return;
    }
    
    if (step === 7 && !formData.selectedInsurer) {
      toast.error('Please select an insurance plan');
      return;
    }
    
    if (step === 8) {
      if (!formData.nomineName || !formData.nomineRelation || !formData.panNumber || !formData.ownerName || !formData.ownerPhone || !formData.ownerEmail) {
        toast.error('Please fill all required policy holder details');
        return;
      }
    }
    
    if (step === 9 && !formData.paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    setStep(step + 1);
  };

  const handleSubmit = () => {
    // Generate policy number
    const newPolicyNumber = `POL${Date.now()}`;
    setPolicyNumber(newPolicyNumber);
    toast.success('Payment processed successfully!');
    setStep(10);
  };

  const handleDocumentUpload = (file: File | null, docType: 'aadhaar' | 'license' | 'rc') => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedDocuments(prev => ({
        ...prev,
        [`${docType}Photo`]: {
          name: file.name,
          url: reader.result as string
        }
      }));
      toast.success(`${docType === 'aadhaar' ? 'Aadhaar' : docType === 'license' ? 'License' : 'RC'} uploaded successfully`);
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (docType: 'aadhaar' | 'license' | 'rc') => {
    setUploadedDocuments(prev => {
      const updated = { ...prev };
      delete updated[`${docType}Photo` as keyof typeof updated];
      return updated;
    });
    toast.success('Document removed');
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
        selectedPlan: selectedQuote
      }));
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  return (
    <div className="pt-[70px] min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl mb-3">Car Insurance</h1>
            <p className="text-xl text-orange-100">Comprehensive coverage for your vehicle - Complete purchase in 8 easy steps</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Progress Steps - Modern Design */}
        <div className="mb-12">
          <div className="max-w-5xl mx-auto">
            {/* Progress Percentage Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Step {step} of {steps.length}
                </span>
                <span className="text-sm font-semibold text-orange-600">
                  {Math.round((step / steps.length) * 100)}% Complete
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400"
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
                      {/* Step Circle */}
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
                            w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
                            ${isCompleted ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30' : ''}
                            ${isActive ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-xl shadow-orange-500/40 ring-4 ring-orange-100' : ''}
                            ${isPending ? 'bg-white border-2 border-gray-300' : ''}
                          `}
                        >
                          {isCompleted ? (
                            <Check className="w-7 h-7 text-white" strokeWidth={3} />
                          ) : (
                            <s.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          )}
                        </div>
                        
                        {/* Active Pulse Effect */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-orange-500"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.div>

                      {/* Step Label */}
                      <div className="text-center px-1">
                        <div className={`
                          text-xs font-medium transition-all duration-300
                          ${isActive ? 'text-orange-600 font-semibold' : ''}
                          ${isCompleted ? 'text-green-600' : ''}
                          ${isPending ? 'text-gray-500' : ''}
                        `}>
                          {s.title}
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1"
                          >
                            <Badge className="bg-orange-500 text-xs px-2 py-0">Active</Badge>
                          </motion.div>
                        )}
                      </div>

                      {/* Connector Line - positioned between steps */}
                      {idx < steps.length - 1 && (
                        <div 
                          className="absolute top-7 left-1/2 h-0.5 bg-gray-300"
                          style={{
                            width: `calc(100% / ${steps.length})`,
                            transform: 'translateX(-50%)',
                            marginLeft: `calc(100% / ${steps.length} / 2)`
                          }}
                        >
                          <motion.div
                            className="h-full bg-gradient-to-r from-green-500 to-orange-500"
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
            {/* Step 1: Vehicle Registration Number */}
            {step === 1 && (
              <div className="max-w-md mx-auto">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center mb-8"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Car className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl mb-2">Get Car Insurance</h2>
                  <p className="text-muted-foreground">Enter your vehicle details to get started</p>
                </motion.div>

                <Card className="shadow-xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="regNo" className="text-base">Vehicle Registration Number</Label>
                        <Input
                          id="regNo"
                          placeholder="e.g., MH01AB1234"
                          value={formData.registrationNumber}
                          onChange={(e) => setFormData({...formData, registrationNumber: e.target.value.toUpperCase()})}
                          className="uppercase text-lg h-12 text-center tracking-wider"
                          autoFocus
                        />
                        <p className="text-sm text-muted-foreground text-center">
                          Enter your vehicle number to auto-fetch details
                        </p>
                      </div>

                      {formData.registrationNumber && formData.registrationNumber.length >= 8 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Alert className="bg-green-50 border-green-200">
                            <Check className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-sm text-green-700">
                              Valid registration number format
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="newCar" 
                          checked={isNewCar === true}
                          onCheckedChange={(checked) => {
                            setIsNewCar(checked as boolean);
                            if (checked) {
                              setFormData({...formData, isNewVehicle: 'true', registrationNumber: ''});
                            } else {
                              setFormData({...formData, isNewVehicle: 'false'});
                            }
                          }}
                        />
                        <Label htmlFor="newCar" className="cursor-pointer">
                          This is a brand new car (not yet registered)
                        </Label>
                      </div>

                      {isNewCar && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <Alert className="bg-blue-50 border-blue-200">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-sm">
                              You'll provide your vehicle details manually in the next step
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </div>

                    <Button
                      onClick={handleNext}
                      className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90"
                      disabled={!isNewCar && !formData.registrationNumber}
                    >
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <div className="text-center pt-4">
                      <p className="text-xs text-muted-foreground">
                        By continuing, you agree to our{' '}
                        <a href="/terms" className="text-orange-500 hover:underline">Terms & Conditions</a>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">2 Min Process</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                      <Shield className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Secure & Safe</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Best Prices</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Login/Register */}
            {step === 2 && (
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-orange-500" />
                    </div>
                    <CardTitle>Login to Continue</CardTitle>
                    <CardDescription>
                      {isNewCar ? 'Register your new vehicle' : 'Access your existing policy details'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert className="bg-orange-50 border-orange-200">
                      <Info className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-sm">
                        Login to save your progress and access exclusive features like instant policy updates and claim tracking.
                      </AlertDescription>
                    </Alert>

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
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="remember" />
                            <Label htmlFor="remember" className="cursor-pointer">Remember me</Label>
                          </div>
                          <a href="#" className="text-orange-500 hover:underline">Forgot password?</a>
                        </div>
                        <Button 
                          onClick={handleAuthSubmit}
                          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90"
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
                          <Label htmlFor="register-phone">Phone Number</Label>
                          <Input
                            id="register-phone"
                            type="tel"
                            placeholder="10-digit mobile number"
                            value={authForm.phone}
                            onChange={(e) => setAuthForm({...authForm, phone: e.target.value})}
                            maxLength={10}
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
                        <div className="flex items-start space-x-2">
                          <Checkbox id="terms" />
                          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                            I agree to the Terms & Conditions and Privacy Policy
                          </Label>
                        </div>
                        <Button 
                          onClick={handleAuthSubmit}
                          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Register & Continue
                        </Button>
                      </TabsContent>
                    </Tabs>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowAuthStep(false);
                        setStep(3);
                        toast.info('Continuing as guest. You can login later to save your policy.');
                      }}
                    >
                      Continue as Guest
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Vehicle Details Only */}
            {step === 3 && (
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Information</CardTitle>
                    <CardDescription>Tell us about your vehicle</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Car Brand *</Label>
                        <Select value={formData.brand} onValueChange={(value) => setFormData({...formData, brand: value, model: ''})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {carBrands.map(brand => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="model">Model *</Label>
                        <Select value={formData.model} onValueChange={(value) => setFormData({...formData, model: value})} disabled={!formData.brand}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.brand && carModels[formData.brand]?.map(model => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="variant">Variant</Label>
                        <Input
                          id="variant"
                          placeholder="e.g., VXI, SX, ZX+"
                          value={formData.variant}
                          onChange={(e) => setFormData({...formData, variant: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="year">Year of Purchase *</Label>
                        <Select value={formData.yearOfPurchase} onValueChange={(value) => setFormData({...formData, yearOfPurchase: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map(year => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fuel">Fuel Type *</Label>
                        <Select value={formData.fuelType} onValueChange={(value) => setFormData({...formData, fuelType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="petrol">Petrol</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="cng">CNG</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="engineCC">Engine CC / Battery Capacity</Label>
                        <Input
                          id="engineCC"
                          placeholder={formData.fuelType === 'electric' ? 'kWh' : 'CC'}
                          value={formData.engineCC}
                          onChange={(e) => setFormData({...formData, engineCC: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rto">RTO Code</Label>
                        <Input
                          id="rto"
                          placeholder="e.g., MH01, DL01"
                          value={formData.rto}
                          onChange={(e) => setFormData({...formData, rto: e.target.value.toUpperCase()})}
                          className="uppercase"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!isNewCar && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Previous Insurance Details</CardTitle>
                      <CardDescription>Help us calculate your No Claim Bonus and premium</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="prevInsurer">Previous Insurer</Label>
                          <Select value={formData.previousInsurer} onValueChange={(value) => setFormData({...formData, previousInsurer: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select or skip" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Previous Insurance</SelectItem>
                              {insurers.map(ins => (
                                <SelectItem key={ins.id} value={ins.id}>{ins.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="prevPolicyNo">Previous Policy Number</Label>
                          <Input
                            id="prevPolicyNo"
                            placeholder="Enter policy number"
                            value={formData.previousPolicyNumber}
                            onChange={(e) => setFormData({...formData, previousPolicyNumber: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ncb">No Claim Bonus (NCB)</Label>
                        <Select value={formData.ncbPercentage} onValueChange={(value) => setFormData({...formData, ncbPercentage: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0% - New / Claimed</SelectItem>
                            <SelectItem value="20">20% - 1 Year NCB</SelectItem>
                            <SelectItem value="25">25% - 2 Years NCB</SelectItem>
                            <SelectItem value="35">35% - 3 Years NCB</SelectItem>
                            <SelectItem value="45">45% - 4 Years NCB</SelectItem>
                            <SelectItem value="50">50% - 5+ Years NCB</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.ncbPercentage !== '0' && (
                          <p className="text-sm text-green-600">Great! You'll get {formData.ncbPercentage}% discount on premium</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Have you made any claims in the last year?</Label>
                        <RadioGroup value={formData.claimsMade} onValueChange={(value) => setFormData({...formData, claimsMade: value})}>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="claims-no" />
                              <Label htmlFor="claims-no">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="claims-yes" />
                              <Label htmlFor="claims-yes">Yes</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 4: Document Submission */}
            {step === 4 && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl mb-2">Upload Required Documents</h2>
                  <p className="text-muted-foreground">Please provide clear photos of your documents for verification</p>
                </div>

                {/* Aadhaar Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      Aadhaar Card
                    </CardTitle>
                    <CardDescription>Enter your Aadhaar number and upload a clear photo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                      <Input
                        id="aadhaarNumber"
                        placeholder="XXXX XXXX XXXX"
                        value={formData.aadhaarNumber}
                        onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})}
                        maxLength={12}
                      />
                    </div>

                    {!uploadedDocuments.aadhaarPhoto ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                        <p className="mb-3 text-sm text-muted-foreground">Upload Aadhaar Card Photo</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('aadhaar-upload')?.click()}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        <input
                          id="aadhaar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload(e.target.files?.[0] || null, 'aadhaar')}
                        />
                      </div>
                    ) : (
                      <div className="relative border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={uploadedDocuments.aadhaarPhoto.url}
                            alt="Aadhaar"
                            className="w-32 h-20 object-cover rounded border"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{uploadedDocuments.aadhaarPhoto.name}</p>
                            <Badge className="mt-2 bg-green-500">Uploaded</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDocument('aadhaar')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Driving License */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      Driving License
                    </CardTitle>
                    <CardDescription>Enter your license number and upload a clear photo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">Driving License Number *</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="Enter DL number"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({...formData, licenseNumber: e.target.value.toUpperCase()})}
                        className="uppercase"
                      />
                    </div>

                    {!uploadedDocuments.licensePhoto ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                        <p className="mb-3 text-sm text-muted-foreground">Upload Driving License Photo</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('license-upload')?.click()}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        <input
                          id="license-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload(e.target.files?.[0] || null, 'license')}
                        />
                      </div>
                    ) : (
                      <div className="relative border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={uploadedDocuments.licensePhoto.url}
                            alt="License"
                            className="w-32 h-20 object-cover rounded border"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{uploadedDocuments.licensePhoto.name}</p>
                            <Badge className="mt-2 bg-green-500">Uploaded</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDocument('license')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Vehicle RC */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      Vehicle Registration Certificate (RC)
                    </CardTitle>
                    <CardDescription>Enter your RC number and upload a clear photo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rcNumber">RC Number *</Label>
                      <Input
                        id="rcNumber"
                        placeholder="Enter RC number"
                        value={formData.rcNumber}
                        onChange={(e) => setFormData({...formData, rcNumber: e.target.value.toUpperCase()})}
                        className="uppercase"
                      />
                    </div>

                    {!uploadedDocuments.rcPhoto ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                        <p className="mb-3 text-sm text-muted-foreground">Upload RC Book Photo</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('rc-upload')?.click()}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        <input
                          id="rc-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload(e.target.files?.[0] || null, 'rc')}
                        />
                      </div>
                    ) : (
                      <div className="relative border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={uploadedDocuments.rcPhoto.url}
                            alt="RC"
                            className="w-32 h-20 object-cover rounded border"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{uploadedDocuments.rcPhoto.name}</p>
                            <Badge className="mt-2 bg-green-500">Uploaded</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDocument('rc')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    <strong>Document Guidelines:</strong> Please ensure all documents are clear and readable. Supported formats: JPG, PNG (Max 5MB per file). All documents are securely encrypted.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 5: Coverage Type & IDV */}
            {step === 5 && (
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl mb-2">Choose Your Coverage Type</h2>
                  <p className="text-muted-foreground">Select the type of insurance that best suits your needs</p>
                </div>

                {/* Coverage Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {coverageTypes.map((coverage) => {
                    const Icon = coverage.icon;
                    return (
                      <Card
                        key={coverage.id}
                        className={`cursor-pointer transition-all hover:shadow-xl relative ${
                          formData.selectedCoverage === coverage.id ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                        } ${coverage.popular ? 'border-orange-500 border-2' : ''}`}
                        onClick={() => setFormData({...formData, selectedCoverage: coverage.id})}
                      >
                        {coverage.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-gradient-to-r from-orange-500 to-amber-500">Recommended</Badge>
                          </div>
                        )}
                        
                        <CardHeader>
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-6 h-6 text-orange-600" />
                            </div>
                            {formData.selectedCoverage === coverage.id && (
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <CardTitle className="text-xl mb-2">{coverage.name}</CardTitle>
                          <CardDescription className="mt-2">{coverage.description}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="border-t pt-4">
                            <h4 className="text-sm mb-3">Coverage Includes:</h4>
                            <ul className="space-y-2">
                              {coverage.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* IDV Selection */}
                {formData.selectedCoverage && formData.selectedCoverage !== 'third-party' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Set Your Car's Insured Declared Value (IDV)</CardTitle>
                        <CardDescription>
                          IDV is the current market value of your car. This is the maximum amount you'll receive if your car is stolen or damaged beyond repair.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="text-center mb-6">
                          <div className="text-5xl font-bold text-orange-600 mb-2">
                            ₹{formData.idv.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">Insured Declared Value</p>
                        </div>

                        <Slider
                          value={[formData.idv]}
                          onValueChange={([value]) => setFormData({...formData, idv: value})}
                          min={100000}
                          max={5000000}
                          step={50000}
                          className="w-full"
                        />

                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>₹1,00,000</span>
                          <span>₹50,00,000</span>
                        </div>

                        <Alert className="bg-amber-50 border-amber-200">
                          <Info className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-sm text-gray-700">
                            <strong>Tip:</strong> Higher IDV means higher premium but better coverage. Set IDV close to your car's current market value for optimal protection.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 6: Add-ons */}
            {step === 6 && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl mb-2">Enhance Your Coverage</h2>
                  <p className="text-muted-foreground">Add valuable features to maximize your protection</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {addOns.map((addon) => {
                    const Icon = addon.icon;
                    const isSelected = formData.selectedAddOns.includes(addon.id);
                    
                    return (
                      <Card
                        key={addon.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          isSelected ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                        }`}
                        onClick={() => toggleAddOn(addon.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold">{addon.name}</h3>
                                <Checkbox checked={isSelected} />
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{addon.description}</p>
                              <p className="text-orange-600 font-semibold">+₹{addon.price}/year</p>
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
                    <strong>Selected Add-ons:</strong> {formData.selectedAddOns.length === 0 ? 'None' : formData.selectedAddOns.length}
                    {formData.selectedAddOns.length > 0 && (
                      <span className="ml-2">
                        (Additional ₹{formData.selectedAddOns.reduce((sum, id) => {
                          const addon = addOns.find(a => a.id === id);
                          return sum + (addon?.price || 0);
                        }, 0).toLocaleString()}/year)
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 7: Compare Quotes */}
            {step === 7 && (
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl mb-2">Compare & Select Your Plan</h2>
                  <p className="text-muted-foreground">Choose the best insurance plan from top insurers</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {getQuotes().map((quote) => (
                    <Card
                      key={quote.insurer.id}
                      className={`cursor-pointer transition-all hover:shadow-xl ${
                        formData.selectedInsurer === quote.insurer.id ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                      }`}
                      onClick={() => selectPlan(quote.insurer.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          {/* Insurer Info */}
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                              {quote.insurer.logo}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl">{quote.insurer.name}</h3>
                                {formData.selectedInsurer === quote.insurer.id && (
                                  <Badge className="bg-orange-500">Selected</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span>{quote.insurer.rating}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>{quote.insurer.claimSettlement}% Claim Settlement</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">{quote.coverage}</Badge>
                                <Badge variant="secondary">{quote.addOns} Add-ons</Badge>
                                {quote.savings > 0 && (
                                  <Badge className="bg-green-500">Save ₹{quote.savings}</Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="text-center md:text-right border-l md:pl-6">
                            <p className="text-sm text-muted-foreground mb-1">Annual Premium</p>
                            <div className="text-3xl font-bold text-orange-600 mb-1">
                              ₹{quote.totalPremium.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Including GST</p>
                          </div>
                        </div>

                        {/* Features Preview */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {quote.features.slice(0, 4).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {formData.selectedInsurer && (
                  <Alert className="mt-6 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      Plan selected! Click "Next" to proceed with policy holder details.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 8: Policy Holder Details & Contact Info */}
            {step === 8 && (
              <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Policy Holder Information</CardTitle>
                    <CardDescription>Contact details and nominee information for policy issuance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm">
                        As per IRDAI guidelines, complete policy holder details are mandatory for policy issuance.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <h3 className="mb-4">Contact Information *</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="ownerName">Full Name *</Label>
                          <Input
                            id="ownerName"
                            placeholder="Enter your full name"
                            value={formData.ownerName}
                            onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ownerPhone">Phone Number *</Label>
                            <Input
                              id="ownerPhone"
                              type="tel"
                              placeholder="10-digit mobile number"
                              value={formData.ownerPhone}
                              onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
                              maxLength={10}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ownerEmail">Email Address *</Label>
                            <Input
                              id="ownerEmail"
                              type="email"
                              placeholder="your@email.com"
                              value={formData.ownerEmail}
                              onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="panNumber">PAN Number *</Label>
                      <Input
                        id="panNumber"
                        placeholder="ABCDE1234F"
                        value={formData.panNumber}
                        onChange={(e) => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
                        className="uppercase"
                        maxLength={10}
                      />
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-4">Nominee Details *</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="nomineName">Nominee Name *</Label>
                          <Input
                            id="nomineName"
                            placeholder="Full name of nominee"
                            value={formData.nomineName}
                            onChange={(e) => setFormData({...formData, nomineName: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nomineRelation">Relationship *</Label>
                            <Select value={formData.nomineRelation} onValueChange={(value) => setFormData({...formData, nomineRelation: value})}>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 9: Payment */}
            {step === 9 && (
              <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Choose your preferred payment method</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Premium Summary */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-orange-100 mb-1">Total Premium to Pay</p>
                          <div className="text-4xl font-bold">
                            ₹{formData.selectedPlan.totalPremium?.toLocaleString() || '0'}
                          </div>
                        </div>
                        <Shield className="w-16 h-16 text-orange-200" />
                      </div>
                      <div className="space-y-2 text-sm border-t border-orange-300 pt-4 text-orange-100">
                        <div className="flex justify-between">
                          <span>Base Premium</span>
                          <span>₹{formData.selectedPlan.basePremium?.toLocaleString() || '0'}</span>
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
                          <Card className={`cursor-pointer ${formData.paymentMethod === 'card' ? 'ring-2 ring-orange-500' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="card" id="payment-card" />
                                <Label htmlFor="payment-card" className="flex items-center gap-3 cursor-pointer flex-1">
                                  <CreditCard className="w-5 h-5 text-orange-500" />
                                  <div>
                                    <div className="font-semibold">Credit / Debit Card</div>
                                    <div className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</div>
                                  </div>
                                </Label>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className={`cursor-pointer ${formData.paymentMethod === 'upi' ? 'ring-2 ring-orange-500' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="upi" id="payment-upi" />
                                <Label htmlFor="payment-upi" className="flex items-center gap-3 cursor-pointer flex-1">
                                  <Zap className="w-5 h-5 text-orange-500" />
                                  <div>
                                    <div className="font-semibold">UPI</div>
                                    <div className="text-sm text-muted-foreground">Google Pay, PhonePe, Paytm</div>
                                  </div>
                                </Label>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className={`cursor-pointer ${formData.paymentMethod === 'netbanking' ? 'ring-2 ring-orange-500' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="netbanking" id="payment-netbanking" />
                                <Label htmlFor="payment-netbanking" className="flex items-center gap-3 cursor-pointer flex-1">
                                  <Building2 className="w-5 h-5 text-orange-500" />
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
                          I agree to the <a href="/terms" className="text-orange-500 hover:underline">Terms & Conditions</a> and <a href="/terms" className="text-orange-500 hover:underline">Privacy Policy</a>. I confirm that all information provided is accurate.
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 10: Confirmation */}
            {step === 10 && (
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
                  <p className="text-xl text-muted-foreground">Your car insurance policy is now active</p>
                </motion.div>

                <Card className="mb-6">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                    <CardTitle>Policy Details</CardTitle>
                    <CardDescription className="text-orange-100">Your insurance is now active and protecting your vehicle</CardDescription>
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
                        <Label className="text-muted-foreground">Vehicle</Label>
                        <p className="font-semibold">
                          {formData.brand} {formData.model} {formData.variant}
                        </p>
                        <p className="text-sm text-muted-foreground">{formData.registrationNumber || 'New Vehicle'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Coverage Type</Label>
                        <p className="font-semibold">
                          {coverageTypes.find(c => c.id === formData.selectedCoverage)?.name}
                        </p>
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
                        <p className="text-xl font-semibold text-orange-600">
                          ₹{formData.selectedPlan.totalPremium?.toLocaleString()}
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
                      <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
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
                    <strong>What's Next?</strong> Your policy document has been sent to {formData.ownerEmail}. You can also access it anytime from your dashboard.
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
        {step < 10 && (
          <div className="flex items-center justify-between max-w-4xl mx-auto mt-8">
            {step > 1 && step !== 2 && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === 3 && !isAuthenticated) {
                    setStep(2); // Go back to auth step if not authenticated
                  } else if (step === 3 && isAuthenticated) {
                    setStep(1); // Go back to vehicle identification
                  } else {
                    setStep(step - 1);
                  }
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            
            {step < 9 && step !== 2 ? (
              <Button
                onClick={handleNext}
                className="ml-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : step === 9 ? (
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
        {step < 10 && (
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Need Help?</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Our insurance experts are here to assist you. Call us at <strong>1800-123-4567</strong> or email <strong>support@secureinsure.com</strong>
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
                        Claim Settlement in 48hrs
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

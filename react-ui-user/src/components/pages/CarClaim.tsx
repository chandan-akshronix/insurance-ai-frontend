import { useState } from 'react';
import { Check, Upload, X, FileText, AlertCircle, ArrowRight, CheckCircle, Camera, Clock, Info, Award, Home, Download } from 'lucide-react';
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
import { Separator } from '../ui/separator';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  preview?: string;
}

const mockPolicies = [
  { id: 'CAR001', policyNumber: 'CAR/2024/001', vehicle: 'Audi', brand: 'Audi', model: 'All', year: '2018', registrationNumber: 'AGP1844566', expiryDate: '24/10/2023', insurer: 'Bajaj Allianz', vehicleType: 'Zero Depreciation' },
  { id: 'CAR002', policyNumber: 'CAR/2024/002', vehicle: 'Maruti Suzuki Swift', brand: 'Maruti Suzuki', model: 'Swift', year: '2022', registrationNumber: 'MH01AB1234', expiryDate: '2025-08-20', insurer: 'ICICI Lombard', vehicleType: 'Comprehensive' }
];

const networkGarages = [
  { id: 'WS001', name: 'AutoCare Service Center', location: 'Andheri West, Mumbai', rating: 4.5, distance: '2.3 km' },
  { id: 'WS002', name: 'Premium Motors Workshop', location: 'Bandra East, Mumbai', rating: 4.7, distance: '4.1 km' },
  { id: 'WS003', name: 'Expert Auto Repairs', location: 'Goregaon West, Mumbai', rating: 4.3, distance: '5.8 km' },
  { id: 'WS004', name: 'City Car Care', location: 'Powai, Mumbai', rating: 4.6, distance: '3.5 km' }
];

const incidentTypes = [
  { id: 'flooding', label: 'Flooding' },
  { id: 'natural-disaster', label: 'Natural Disaster' },
  { id: 'theft', label: 'Theft' },
  { id: 'accident', label: 'Accident' },
  { id: 'fire', label: 'Fire' },
  { id: 'riot', label: 'Riot' },
  { id: 'terrorism', label: 'Terrorism' }
];

const accidentTypes = [
  { id: 'hit-object', label: 'Hit an object', icon: '🚗💥' },
  { id: 'parked-damage', label: 'Parked Damage', icon: '🅿️' },
  { id: 'hit-2cars', label: 'Hit an object + 2 Cars', icon: '🚗💥🚗' },
  { id: '2-vehicles', label: '2 vehicles', icon: '🚙💥🚗' },
  { id: 'hit-pedestrian', label: 'Hit a pedestrian', icon: '🚶' },
  { id: 'someone-hit', label: 'Someone hit our car', icon: '🚙💨' },
  { id: 'hit-or-arand', label: 'Hit or a rand', icon: '💥' },
  { id: 'both-moving', label: 'Both moving', icon: '🚗↔️' },
  { id: 'hit-object-2car', label: 'Hit an object + 2 Car', icon: '🚗🧱🚙' },
  { id: 'car-hit', label: 'Car hit', icon: '💥🚗' }
];

export default function CarClaim() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [claimNumber, setClaimNumber] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState({
    selectedPolicy: '',
    incidentType: '',
    accidentType: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    incidentCity: '',
    incidentDescription: '',
    damageType: '',
    damageArea: [] as string[],
    estimatedCost: '',
    vehicleDriveable: '',
    policeComplaintFiled: '',
    firNumber: '',
    policeStation: '',
    firDate: '',
    driverName: '',
    driverLicenseNumber: '',
    driverRelation: '',
    licenseValid: '',
    repairType: '',
    selectedWorkshop: '',
    preferredWorkshop: '',
    claimantName: '',
    claimantPhone: '',
    claimantEmail: '',
    claimantAddress: '',
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: ''
  });

  const handleFileUpload = (files: FileList | null, category: string) => {
    if (!files) return;
    
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      category,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} file(s) uploaded`);
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

  const getRequiredDocuments = () => {
    const docs = [
      { id: 'rc-copy', name: 'RC Book Copy', required: true },
      { id: 'license', name: 'Driving License', required: true },
      { id: 'policy-copy', name: 'Insurance Policy Copy', required: true },
      { id: 'damage-photos', name: 'Vehicle Damage Photos', required: true },
      { id: 'overall-photos', name: 'Overall Vehicle Photos (All 4 sides)', required: true }
    ];

    if (formData.policeComplaintFiled === 'yes') {
      docs.push({ id: 'fir-copy', name: 'FIR Copy', required: true });
    }

    if (formData.repairType === 'reimbursement') {
      docs.push({ id: 'repair-invoice', name: 'Repair Invoice/Bills', required: true });
      docs.push({ id: 'payment-proof', name: 'Payment Proof', required: true });
    }

    return docs;
  };

  const handleNext = () => {
    if (step === 1 && !formData.selectedPolicy) {
      toast.error('Please select a policy');
      return;
    }

    if (step === 2) {
      if (!formData.incidentType) {
        toast.error('Please select incident type');
        return;
      }
      if (formData.incidentType === 'accident' && !formData.accidentType) {
        toast.error('Please select accident type');
        return;
      }
    }

    if (step === 3) {
      if (!formData.incidentDate || !formData.incidentLocation || !formData.incidentDescription) {
        toast.error('Please fill all incident details');
        return;
      }
    }

    if (step === 4) {
      if (!formData.damageType || formData.damageArea.length === 0) {
        toast.error('Please provide damage details');
        return;
      }
    }

    if (step === 5 && !formData.policeComplaintFiled) {
      toast.error('Please specify if police complaint was filed');
      return;
    }

    if (step === 6) {
      if (!formData.driverName || !formData.driverLicenseNumber) {
        toast.error('Please provide driver details');
        return;
      }
    }

    if (step === 7 && !formData.repairType) {
      toast.error('Please select repair type');
      return;
    }

    if (step === 8) {
      const requiredDocs = getRequiredDocuments().filter(d => d.required);
      const uploadedCategories = new Set(uploadedFiles.map(f => f.category));
      const missingDocs = requiredDocs.filter(d => !uploadedCategories.has(d.id));
      
      if (missingDocs.length > 0) {
        toast.error(`Please upload: ${missingDocs[0].name}`);
        return;
      }
    }

    if (step === 9) {
      if (!formData.claimantName || !formData.claimantPhone || !formData.claimantEmail) {
        toast.error('Please fill all contact details');
        return;
      }
    }

    setStep(step + 1);
  };

  const handleSubmit = () => {
    const newClaimNumber = `CARCLAIM${Date.now()}`;
    setClaimNumber(newClaimNumber);
    toast.success('Claim submitted successfully!');
    setStep(11);
  };

  const selectedPolicy = mockPolicies.find(p => p.id === formData.selectedPolicy);

  const damageAreas = [
    { id: 'front', label: 'Front Bumper/Hood' },
    { id: 'rear', label: 'Rear Bumper/Boot' },
    { id: 'left-side', label: 'Left Side' },
    { id: 'right-side', label: 'Right Side' },
    { id: 'roof', label: 'Roof/Top' },
    { id: 'windshield', label: 'Windshield' },
    { id: 'headlight', label: 'Headlight/Taillight' },
    { id: 'wheels', label: 'Wheels/Tyres' }
  ];

  return (
    <div className="pt-[70px] min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <h1 className="text-lg">New Claim</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Your Vehicle + Select Incident + Accident Type + Upload Photos (All in one view) */}
            {step === 1 && (
              <div className="space-y-12">
                {/* Your Vehicle Section */}
                <div>
                  <h2 className="text-2xl mb-6">Your Vehicle</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left - Form */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Select Model *</Label>
                        <Select value={formData.selectedPolicy} onValueChange={(value) => setFormData({...formData, selectedPolicy: value})}>
                          <SelectTrigger className="h-11 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockPolicies.map((policy) => (
                              <SelectItem key={policy.id} value={policy.id}>
                                {policy.brand} {policy.model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Select Year *</Label>
                          <Input
                            value={selectedPolicy?.year || '2018'}
                            readOnly
                            className="h-11 bg-gray-50 border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Vehicle Type *</Label>
                          <Input
                            value={selectedPolicy?.vehicleType || 'Zero Depreciation'}
                            readOnly
                            className="h-11 bg-gray-50 border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Registration Number *</Label>
                          <Input
                            value={selectedPolicy?.registrationNumber || 'AGP1844566'}
                            readOnly
                            className="h-11 bg-gray-50 border-gray-300 uppercase"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Expiry Date *</Label>
                          <Input
                            value={selectedPolicy?.expiryDate || '24/10/2023'}
                            readOnly
                            className="h-11 bg-gray-50 border-gray-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right - Car Image */}
                    <div className="flex items-center justify-center">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWx2ZXIlMjBjYXIlMjBzaWRlJTIwdmlld3xlbnwxfHx8fDE3NjA2Nzk5MzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Car"
                        className="w-full max-w-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Select Incident Section */}
                <div>
                  <h2 className="text-2xl mb-2">Select Incident</h2>
                  <p className="text-sm text-gray-600 mb-6">What type of incident occured?</p>

                  <div className="flex flex-wrap gap-3">
                    {incidentTypes.map((incident) => (
                      <button
                        key={incident.id}
                        type="button"
                        onClick={() => setFormData({...formData, incidentType: incident.id})}
                        className={`px-6 py-2.5 rounded border transition-all text-sm ${
                          formData.incidentType === incident.id
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {incident.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accident Type Section - Only show if Accident is selected */}
                {formData.incidentType === 'accident' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl mb-6">Accident Type</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {accidentTypes.map((accident) => (
                        <button
                          key={accident.id}
                          type="button"
                          onClick={() => setFormData({...formData, accidentType: accident.id})}
                          className={`p-4 border rounded-lg transition-all flex flex-col items-center gap-2 ${
                            formData.accidentType === accident.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        >
                          <div className="text-2xl">{accident.icon}</div>
                          <div className="text-xs text-center">{accident.label}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Upload Photos Section */}
                <div>
                  <h2 className="text-2xl mb-6">Upload Photos</h2>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {uploadedFiles.slice(0, 4).map((file) => (
                      <div key={file.id} className="relative group aspect-video">
                        {file.preview ? (
                          <img src={file.preview} alt={file.name} className="w-full h-full object-cover rounded-lg border border-gray-300" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add Photo Button */}
                    {uploadedFiles.length < 4 && (
                      <div>
                        <button
                          type="button"
                          onClick={() => document.getElementById('upload-photos')?.click()}
                          className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                        >
                          <Camera className="w-8 h-8 text-gray-400" />
                        </button>
                        <input
                          id="upload-photos"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files, 'damage-photos')}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button className="text-sm text-primary hover:underline flex items-center gap-1">
                      Mark the Affected Area <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90 px-8"
                    disabled={!formData.selectedPolicy || !formData.incidentType || (formData.incidentType === 'accident' && !formData.accidentType)}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Incident Details */}
            {step === 2 && (
              <div className="max-w-3xl">
                <h2 className="text-2xl mb-6">Incident Details</h2>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Incident Date *</Label>
                      <Input
                        type="date"
                        value={formData.incidentDate}
                        onChange={(e) => setFormData({...formData, incidentDate: e.target.value})}
                        max={new Date().toISOString().split('T')[0]}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Incident Time</Label>
                      <Input
                        type="time"
                        value={formData.incidentTime}
                        onChange={(e) => setFormData({...formData, incidentTime: e.target.value})}
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Incident Location *</Label>
                    <Textarea
                      placeholder="Exact location where incident occurred"
                      value={formData.incidentLocation}
                      onChange={(e) => setFormData({...formData, incidentLocation: e.target.value})}
                      rows={2}
                      className="border-gray-300 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input
                      placeholder="City"
                      value={formData.incidentCity}
                      onChange={(e) => setFormData({...formData, incidentCity: e.target.value})}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Incident Description *</Label>
                    <Textarea
                      placeholder="Describe what happened in detail"
                      value={formData.incidentDescription}
                      onChange={(e) => setFormData({...formData, incidentDescription: e.target.value})}
                      rows={4}
                      className="border-gray-300 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                  <Button
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90 px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Damage Assessment */}
            {step === 3 && (
              <div className="max-w-4xl space-y-8">
                <h2 className="text-2xl mb-6">Damage Assessment</h2>

                <div>
                  <h3 className="mb-4">Damage Type *</h3>
                  <RadioGroup value={formData.damageType} onValueChange={(value) => setFormData({...formData, damageType: value})}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: 'minor', label: 'Minor Damage', desc: 'Small dents, scratches' },
                        { value: 'major', label: 'Major Damage', desc: 'Significant damage' },
                        { value: 'total-loss', label: 'Total Loss', desc: 'Beyond repair' }
                      ].map((item) => (
                        <div key={item.value} className={`border rounded-lg p-4 cursor-pointer ${formData.damageType === item.value ? 'border-primary bg-primary/5' : 'border-gray-300'}`}>
                          <div className="flex items-start space-x-3">
                            <RadioGroupItem value={item.value} id={item.value} className="mt-1" />
                            <Label htmlFor={item.value} className="cursor-pointer flex-1">
                              <div className="font-medium">{item.label}</div>
                              <div className="text-sm text-gray-600">{item.desc}</div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <h3 className="mb-4">Affected Areas *</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {damageAreas.map((area) => {
                      const isSelected = formData.damageArea.includes(area.id);
                      return (
                        <div
                          key={area.id}
                          className={`p-3 rounded-lg border cursor-pointer text-center transition-all ${
                            isSelected ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => {
                            const newAreas = isSelected
                              ? formData.damageArea.filter(a => a !== area.id)
                              : [...formData.damageArea, area.id];
                            setFormData({...formData, damageArea: newAreas});
                          }}
                        >
                          <div className="text-sm">{area.label}</div>
                          {isSelected && <Check className="w-4 h-4 text-primary mx-auto mt-1" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90 px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Police Report */}
            {step === 4 && (
              <div className="max-w-3xl">
                <h2 className="text-2xl mb-6">Police Report</h2>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Was a police complaint filed? *</Label>
                    <RadioGroup value={formData.policeComplaintFiled} onValueChange={(value) => setFormData({...formData, policeComplaintFiled: value})}>
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
                          <Label>FIR Number *</Label>
                          <Input
                            placeholder="FIR number"
                            value={formData.firNumber}
                            onChange={(e) => setFormData({...formData, firNumber: e.target.value})}
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>FIR Date *</Label>
                          <Input
                            type="date"
                            value={formData.firDate}
                            onChange={(e) => setFormData({...formData, firDate: e.target.value})}
                            className="border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Police Station *</Label>
                        <Input
                          placeholder="Police station name"
                          value={formData.policeStation}
                          onChange={(e) => setFormData({...formData, policeStation: e.target.value})}
                          className="border-gray-300"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                  <Button
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90 px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Driver Details */}
            {step === 5 && (
              <div className="max-w-3xl">
                <h2 className="text-2xl mb-6">Driver Information</h2>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Driver Name *</Label>
                    <Input
                      placeholder="Full name"
                      value={formData.driverName}
                      onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>License Number *</Label>
                      <Input
                        placeholder="DL number"
                        value={formData.driverLicenseNumber}
                        onChange={(e) => setFormData({...formData, driverLicenseNumber: e.target.value})}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Relation to Owner</Label>
                      <Select value={formData.driverRelation} onValueChange={(value) => setFormData({...formData, driverRelation: value})}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="self">Self</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="driver">Driver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Was license valid? *</Label>
                    <RadioGroup value={formData.licenseValid} onValueChange={(value) => setFormData({...formData, licenseValid: value})}>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="license-yes" />
                          <Label htmlFor="license-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="license-no" />
                          <Label htmlFor="license-no">No</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                  <Button
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90 px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Workshop */}
            {step === 6 && (
              <div className="max-w-4xl">
                <h2 className="text-2xl mb-6">Repair Option</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div
                    onClick={() => setFormData({...formData, repairType: 'cashless'})}
                    className={`p-5 border rounded-lg cursor-pointer ${
                      formData.repairType === 'cashless' ? 'border-primary bg-primary/5' : 'border-gray-300'
                    }`}
                  >
                    <h3 className="mb-2">Cashless Repair</h3>
                    <p className="text-sm text-gray-600">Network garage without payment</p>
                  </div>

                  <div
                    onClick={() => setFormData({...formData, repairType: 'reimbursement'})}
                    className={`p-5 border rounded-lg cursor-pointer ${
                      formData.repairType === 'reimbursement' ? 'border-primary bg-primary/5' : 'border-gray-300'
                    }`}
                  >
                    <h3 className="mb-2">Reimbursement</h3>
                    <p className="text-sm text-gray-600">Claim reimbursement later</p>
                  </div>
                </div>

                {formData.repairType === 'cashless' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3 className="mb-4">Select Garage</h3>
                    <div className="space-y-3">
                      {networkGarages.map((garage) => (
                        <div
                          key={garage.id}
                          className={`p-4 border rounded-lg cursor-pointer ${
                            formData.selectedWorkshop === garage.id ? 'border-primary bg-primary/5' : 'border-gray-300'
                          }`}
                          onClick={() => setFormData({...formData, selectedWorkshop: garage.id})}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{garage.name}</h4>
                              <p className="text-sm text-gray-600">{garage.location}</p>
                              <div className="flex gap-3 mt-2 text-sm">
                                <span>⭐ {garage.rating}</span>
                                <span>{garage.distance}</span>
                              </div>
                            </div>
                            {formData.selectedWorkshop === garage.id && (
                              <Check className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                  <Button
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90 px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 7: Contact Info */}
            {step === 7 && (
              <div className="max-w-3xl">
                <h2 className="text-2xl mb-6">Contact Information</h2>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      placeholder="Full name"
                      value={formData.claimantName}
                      onChange={(e) => setFormData({...formData, claimantName: e.target.value})}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input
                        type="tel"
                        placeholder="Mobile number"
                        value={formData.claimantPhone}
                        onChange={(e) => setFormData({...formData, claimantPhone: e.target.value})}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={formData.claimantEmail}
                        onChange={(e) => setFormData({...formData, claimantEmail: e.target.value})}
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      placeholder="Complete address"
                      value={formData.claimantAddress}
                      onChange={(e) => setFormData({...formData, claimantAddress: e.target.value})}
                      rows={2}
                      className="border-gray-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                  <Button
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90 px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 8: Review */}
            {step === 8 && (
              <div className="max-w-4xl">
                <h2 className="text-2xl mb-6">Review & Submit</h2>

                <div className="space-y-4">
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-300">
                      <h3>Vehicle Details</h3>
                    </div>
                    <div className="p-6 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span>{selectedPolicy?.vehicle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration:</span>
                        <span>{selectedPolicy?.registrationNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-300">
                      <h3>Incident Details</h3>
                    </div>
                    <div className="p-6 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="capitalize">{formData.incidentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span>{formData.incidentDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                  <Button
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700 px-8"
                  >
                    Submit Claim
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 9: Success */}
            {step === 9 && (
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-3xl mb-3">Claim Submitted!</h1>
                  <p className="text-lg text-gray-600 mb-8">Your claim is being processed</p>

                  <div className="border border-gray-300 rounded-lg p-6 mb-6">
                    <div className="text-left space-y-3">
                      <div>
                        <Label className="text-gray-600">Claim Number</Label>
                        <p className="text-xl text-primary">{claimNumber}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Status</Label>
                        <Badge className="bg-blue-500 mt-1">Under Review</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
                      <Home className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => navigate('/claims/track')}>
                      <Clock className="w-4 h-4 mr-2" />
                      Track Claim
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

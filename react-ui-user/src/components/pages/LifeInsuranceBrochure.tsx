import { useState } from 'react';
import {
  Shield, Heart, TrendingUp, Award, Clock, CheckCircle,
  ArrowRight, ShoppingCart, Download, FileText,
  Users, CreditCard, Star,
  DollarSign, Calendar, AlertCircle, X, Info,
  Facebook, Twitter, Linkedin, Mail, Printer
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { LucideIcon } from 'lucide-react';

// TypeScript Interfaces for Type Safety
interface PlanVariant {
  id: 'basic' | 'smart' | 'premium';
  name: string;
  coverage: number;
  term: number;
  premium: number;
  features: string[];
  recommended: boolean;
}

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface BenefitItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface TermsSection {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string[];
}

// Plan data constants
const planVariants: PlanVariant[] = [
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

// Key features data
const keyFeatures: FeatureItem[] = [
  { icon: Shield, title: 'Life Coverage', description: 'Comprehensive coverage up to ₹2 Crore' },
  { icon: TrendingUp, title: 'Tax Benefits', description: 'Save under Section 80C of Income Tax Act' },
  { icon: CreditCard, title: 'Flexible Premium Payment', description: 'Monthly, quarterly, or annual payment options' },
  { icon: Award, title: 'Multiple Plan Options', description: 'Choose from Basic, Smart, or Premium plans' },
  { icon: Heart, title: 'Riders Available', description: 'Add critical illness, accidental death, and more' },
  { icon: Star, title: 'High Claim Settlement', description: 'Industry-leading claim settlement ratio' },
  { icon: Calendar, title: 'Policy Term Flexibility', description: 'Choose terms from 20 to 40 years' },
  { icon: Users, title: 'Nominee Benefits', description: 'Secure your family\'s financial future' }
];

// Benefits data
const benefits: BenefitItem[] = [
  { icon: Shield, title: 'Financial Security', description: 'Ensure your family\'s financial stability in your absence' },
  { icon: TrendingUp, title: 'Tax Savings', description: 'Save up to ₹1.5 lakhs annually under Section 80C' },
  { icon: DollarSign, title: 'Loan Facility', description: 'Avail loans against your policy when needed' },
  { icon: Award, title: 'Maturity Benefits', description: 'Receive maturity benefits at the end of policy term' },
  { icon: Heart, title: 'Death Benefit', description: 'Immediate payout to nominee in case of unfortunate event' },
  { icon: CheckCircle, title: 'Critical Illness Coverage', description: 'Protection against critical illnesses with riders' }
];

// FAQ data
const faqs: FAQItem[] = [
  {
    question: 'What is the minimum and maximum coverage amount I can get?',
    answer: 'You can get coverage ranging from ₹50 Lakhs (Basic Plan) up to ₹2 Crores (Premium Plan). The coverage amount depends on your income, age, and the plan you choose.'
  },
  {
    question: 'How long does it take to get my policy approved?',
    answer: 'For coverage up to ₹50 Lakhs, approval is typically instant. For higher coverage amounts, medical examination may be required, which can take 7-15 days. Once approved, your e-policy is issued immediately.'
  },
  {
    question: 'Can I change my nominee after purchasing the policy?',
    answer: 'Yes, you can change your nominee anytime during the policy term. Simply log into your account, go to policy management, and update the nominee details. No additional charges apply.'
  },
  {
    question: 'What happens if I miss a premium payment?',
    answer: 'You have a grace period of 30 days to pay your premium. If payment is not made within the grace period, your policy will lapse. However, you can revive a lapsed policy within 2 years by paying outstanding premiums and charges.'
  },
  {
    question: 'Are the premiums fixed or can they increase?',
    answer: 'Premiums are generally fixed for the policy term. However, if you add riders or increase coverage during the policy term, your premium will be adjusted accordingly. Premiums are calculated based on your age at the time of purchase.'
  },
  {
    question: 'What is the difference between term life and whole life insurance?',
    answer: 'Term life insurance provides pure protection for a specific period (10-40 years) with no maturity benefits. Whole life insurance covers you for your entire life and includes an investment component with maturity benefits. Our plans are term life insurance policies.'
  },
  {
    question: 'Can I take a loan against my life insurance policy?',
    answer: 'Yes, you can avail loans against your policy after paying premiums for 3 consecutive years. The loan amount depends on the surrender value of your policy. Interest rates are typically lower than personal loans.'
  },
  {
    question: 'What is the claim settlement process?',
    answer: 'In case of a claim, the nominee needs to submit the death certificate, claim form, and policy documents. Claims are typically processed within 30 days of document submission. Our claim settlement ratio is 98.5%, ensuring quick and hassle-free claim processing.'
  }
];

// Terms & Conditions data structure
const termsSections: TermsSection[] = [
  {
    id: 'eligibility',
    title: 'Eligibility & Age Requirements',
    icon: Users,
    content: [
      'Minimum entry age: 18 years',
      'Maximum entry age: 65 years',
      'Minimum policy term: 10 years',
      'Maximum policy term: 40 years',
      'Medical examination required for coverage above ₹50 Lakhs',
      'Income proof required for high coverage amounts'
    ]
  },
  {
    id: 'premium',
    title: 'Premium & Payment Terms',
    icon: CreditCard,
    content: [
      'Premium can be paid monthly, quarterly, or annually',
      'Grace period of 30 days for premium payment',
      'Policy will lapse if premium is not paid within grace period',
      'Lapsed policies can be revived within 2 years with payment of outstanding premiums and charges',
      'Premium increases are based on age and coverage amount'
    ]
  },
  {
    id: 'policy-terms',
    title: 'Policy Terms & Conditions',
    icon: FileText,
    content: [
      'Policy term ranges from 10 to 40 years',
      'Coverage remains active as long as premiums are paid',
      'Nominee can be changed anytime during policy term',
      'Policy can be assigned to banks/financial institutions',
      'Loan facility available after 3 years of premium payment',
      'Surrender value available after 3 years',
      'Policy renews automatically upon premium payment',
      'Renewal is subject to continued premium payments without lapse',
      'Policyholder must inform insurer of any material changes in health or occupation',
      'Renewal premiums may be revised based on age and risk factors'
    ]
  },
  {
    id: 'claims',
    title: 'Claims Process & Benefits',
    icon: CheckCircle,
    content: [
      'Death claims require death certificate and claim form',
      'Claims processed within 30 days of document submission',
      'Nominee receives full sum assured plus bonuses',
      'Maturity benefits paid at end of policy term',
      'Critical illness claims require medical reports',
      'Claim settlement ratio: 98.5%'
    ]
  },
  {
    id: 'cancellation',
    title: 'Cancellation & Refund Policy',
    icon: AlertCircle,
    content: [
      'Free-look period: 15 days from policy receipt',
      'Full refund during free-look period (charges may apply)',
      'Surrender available after 3 years with surrender value',
      'Partial withdrawal not available',
      'Cancellation charges apply after free-look period'
    ]
  },
  {
    id: 'regulatory',
    title: 'Legal & Regulatory Information',
    icon: Shield,
    content: [
      'Regulated by IRDAI (Insurance Regulatory and Development Authority of India)',
      'Policy document is subject to IRDAI guidelines and regulations',
      'IRDAI registration and compliance details available on request',
      'Tax benefits as per Income Tax Act, 1961 (Section 80C, 10(10D))',
      'Section 80C benefits available on premium payments up to ₹1.5 lakhs',
      'Maturity benefits are tax-free under Section 10(10D) of Income Tax Act',
      'Dispute Resolution: All disputes shall be resolved through arbitration under Arbitration and Conciliation Act, 2015',
      'Disputes must be raised within 3 years of the cause of action',
      'Jurisdiction: All legal disputes subject to courts in Mumbai, India',
      'Grievance redressal: Contact our customer service or approach IRDAI Grievance Cell if unresolved'
    ]
  }
];

export default function LifeInsuranceBrochure() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleBuyNow = (planId?: string) => {
    const planToUse = planId || selectedPlan;

    if (!isAuthenticated) {
      // Redirect to login with return path including plan selection
      const returnPath = planToUse
        ? `/life-insurance/apply?plan=${planToUse}`
        : '/life-insurance/apply';
      navigate(`/login?return=${encodeURIComponent(returnPath)}`);
      toast.info('Please login to continue');
      return;
    }

    // Navigate to application form with plan selection
    const params = planToUse ? `?plan=${planToUse}` : '';
    navigate(`/life-insurance/apply${params}`);

    // Show success message if plan was selected
    if (planToUse) {
      const planName = planVariants.find(p => p.id === planToUse)?.name || 'selected plan';
      toast.success(`Proceeding with ${planName}`);
    }
  };

  const handleDownload = () => {
    // Trigger print dialog which can be saved as PDF
    window.print();
    toast.success('Use the print dialog to save as PDF');
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin' | 'email') => {
    const url = window.location.href;
    const title = 'Life Insurance - Protect Your Family\'s Future';
    const text = 'Check out this comprehensive Life Insurance plan with coverage up to ₹2 Crores!';

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
    }
    toast.success(`Sharing on ${platform}...`);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedPlanData = selectedPlan ? planVariants.find(p => p.id === selectedPlan) : null;

  return (
    <div className="pt-[70px] min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Selected Plan Indicator */}
      {selectedPlanData && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 hidden md:block"
        >
          <Badge className="bg-primary text-white px-4 py-2 shadow-lg">
            <CheckCircle className="w-4 h-4 mr-2" />
            {selectedPlanData.name} Selected
          </Badge>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-gradient-to-br from-primary/10 via-cyan-500/10 to-pink-500/10 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-4 md:mb-6 text-sm md:text-base" variant="secondary">
                Comprehensive Protection
              </Badge>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent leading-tight">
              Life Insurance
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-6 md:mb-8 px-4">
              Protect Your Family's Future
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 md:mb-8 px-4">
              <div className="flex items-center gap-2 text-sm md:text-base">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                <span>Up to ₹2 Crore Coverage</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                <span>Tax Benefits Under 80C</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                <span>Flexible Payment Options</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                <span>High Claim Settlement</span>
              </div>
            </div>
            <Button
              onClick={handleBuyNow}
              size="lg"
              className="bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-600/90 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 md:mb-4">Key Features</h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              Everything you need for comprehensive life protection
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {keyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary hover:scale-105">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-cyan-600 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                      <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan Comparison Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 md:mb-4">Choose Your Plan</h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              Select the plan that best fits your needs and budget
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {planVariants.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col h-full"
              >
                <Card className={`flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:shadow-xl ${plan.recommended ? 'border-2 border-primary shadow-lg ring-2 ring-primary/20 bg-slate-50/50' : ''
                  } ${selectedPlan === plan.id ? 'ring-2 ring-primary ring-offset-2 border-primary' : ''
                  }`}>
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-cyan-600 text-white px-3 md:px-4 py-1 rounded-bl-lg z-10">
                      <Badge variant="secondary" className="bg-transparent text-white border-0 text-xs md:text-sm">
                        Recommended
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-xl md:text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Perfect for comprehensive protection</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow space-y-4 md:space-y-6">
                    <div>
                      <div className="flex items-baseline mb-2">
                        <span className="text-2xl md:text-3xl font-bold">
                          {plan.coverage >= 10000000
                            ? `₹${(plan.coverage / 10000000).toFixed(1)}Cr`
                            : `₹${(plan.coverage / 100000).toFixed(0)}L`
                          }
                        </span>
                        <span className="text-sm md:text-base text-muted-foreground ml-2">Coverage</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{plan.term} Years Term</span>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-xl md:text-2xl font-bold">₹{plan.premium.toLocaleString()}</span>
                        <span className="text-sm md:text-base text-muted-foreground ml-2">/month</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex-grow">
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-xs md:text-sm leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      className={`w-full ${plan.recommended || selectedPlan === plan.id
                        ? 'bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-600/90'
                        : ''
                        } transition-all duration-300`}
                      variant={plan.recommended || selectedPlan === plan.id ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        toast.success(`${plan.name} selected!`, {
                          description: 'Proceeding to application form...',
                        });
                        // Small delay to show selection before navigation
                        setTimeout(() => {
                          handleBuyNow(plan.id);
                        }, 300);
                      }}
                    >
                      {selectedPlan === plan.id ? (
                        <>
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                          Selected - Continue
                        </>
                      ) : plan.recommended ? (
                        <>
                          Get Started
                          <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Choose Plan
                          <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 md:mb-4">Benefits</h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              Why choose our Life Insurance plans?
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 md:p-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                      <benefit.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Button
              onClick={handleBuyNow}
              size="lg"
              className="bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-600/90 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Your Policy Now
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Coverage Details Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 md:mb-4">Coverage Details</h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              Understand what's covered and what's not
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                  What's Covered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 md:space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Death due to natural causes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Accidental death (with rider)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Critical illness (with rider)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Total permanent disability (with rider)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Maturity benefits at policy term end</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <X className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0" />
                  What's Not Covered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 md:space-y-3">
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Death within first 2 years due to suicide</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Death due to pre-existing conditions (waiting period applies)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Death due to war or terrorism</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Death under influence of alcohol or drugs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">Non-disclosure of material information</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Waiting Periods & Claim Process */}
          <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                  Waiting Periods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 md:space-y-3">
                  <li className="flex items-start gap-2">
                    <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm md:text-base font-medium">Pre-existing conditions: </span>
                      <span className="text-sm md:text-base">2 years waiting period</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm md:text-base font-medium">Suicide: </span>
                      <span className="text-sm md:text-base">2 years from policy start date</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm md:text-base font-medium">Critical illness rider: </span>
                      <span className="text-sm md:text-base">90 days waiting period</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm md:text-base font-medium">Accidental death: </span>
                      <span className="text-sm md:text-base">No waiting period</span>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                  Claim Process Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 md:space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      1
                    </div>
                    <div>
                      <span className="text-sm md:text-base font-medium">Notify Claim: </span>
                      <span className="text-sm md:text-base">Contact us within 30 days of the event</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      2
                    </div>
                    <div>
                      <span className="text-sm md:text-base font-medium">Submit Documents: </span>
                      <span className="text-sm md:text-base">Provide required documents (death certificate, claim form, etc.)</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      3
                    </div>
                    <div>
                      <span className="text-sm md:text-base font-medium">Verification: </span>
                      <span className="text-sm md:text-base">We verify the claim and documents (typically 7-15 days)</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      4
                    </div>
                    <div>
                      <span className="text-sm md:text-base font-medium">Settlement: </span>
                      <span className="text-sm md:text-base">Claim amount transferred within 30 days of approval</span>
                    </div>
                  </li>
                </ol>
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs md:text-sm text-green-800">
                    <strong>Average Processing Time:</strong> 15-30 days from document submission
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Terms & Conditions Section */}
      <section className="py-12 md:py-16 bg-white print:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl print:max-w-full print:px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 md:mb-4">Terms & Conditions</h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4 mb-4">
              Important information about your policy
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="print:hidden"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Terms & Conditions
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="print:hidden"
              >
                <Download className="w-4 h-4 mr-2" />
                Download as PDF
              </Button>
            </div>
          </motion.div>
          <Accordion type="single" collapsible className="space-y-3 md:space-y-4 print:space-y-2">
            {termsSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="bg-slate-50 rounded-lg px-4 md:px-6 border-none print:bg-transparent print:border-b print:rounded-none"
                >
                  <AccordionTrigger className="hover:no-underline py-3 md:py-4 print:py-2">
                    <div className="flex items-center gap-2 md:gap-3">
                      <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 print:hidden" />
                      <span className="font-semibold text-sm md:text-base text-left print:text-base">{section.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 md:pt-4 text-muted-foreground print:pt-2">
                    <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base print:text-sm print:space-y-1">
                      {section.content.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-slate-50 to-white print:hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 md:mb-4">Frequently Asked Questions</h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              Common questions about Life Insurance
            </p>
          </motion.div>
          <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-white rounded-lg px-4 md:px-6 border border-slate-200"
              >
                <AccordionTrigger className="hover:no-underline py-3 md:py-4 text-left">
                  <span className="font-semibold text-sm md:text-base pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 md:pt-4 text-muted-foreground">
                  <p className="text-sm md:text-base leading-relaxed">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final Call-to-Action Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/10 via-cyan-500/10 to-pink-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-4 leading-tight">
              Ready to Protect Your Family's Future?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 md:mb-8 px-4">
              Get comprehensive life insurance coverage in just a few simple steps
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center px-4 mb-6">
              <Button
                onClick={handleBuyNow}
                size="lg"
                className="bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-600/90 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto sm:min-w-[160px] flex-1 sm:flex-none"
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 transition-all duration-300 w-full sm:w-auto sm:min-w-[160px] flex-1 sm:flex-none"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 transition-all duration-300 w-full sm:w-auto sm:min-w-[160px] flex-1 sm:flex-none print:hidden"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Print
              </Button>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap justify-center gap-3 px-4 print:hidden">
              <p className="w-full text-center text-sm text-muted-foreground mb-2">Share this page:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="hover:bg-blue-50 hover:border-blue-300"
              >
                <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="hover:bg-sky-50 hover:border-sky-300"
              >
                <Twitter className="w-4 h-4 mr-2 text-sky-500" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="hover:bg-blue-50 hover:border-blue-300"
              >
                <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('email')}
                className="hover:bg-gray-50 hover:border-gray-300"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
            <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-4 md:gap-6 text-xs sm:text-sm text-muted-foreground px-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>No Hidden Charges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Instant Approval</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}


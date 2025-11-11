import { useState } from 'react';
import { FileText, Shield, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'definitions', title: 'Definitions' },
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'purchase', title: 'Purchase Terms' },
  { id: 'premiums', title: 'Premiums & Payments' },
  { id: 'claims', title: 'Claims Process' },
  { id: 'cancellation', title: 'Cancellation & Refunds' },
  { id: 'data', title: 'Data Protection' }
];

export default function Terms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <div className="pt-[70px]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#001F3F] to-[#003366] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-5xl mb-4">Legal Information</h1>
          <p className="text-xl text-gray-200">
            Our terms of service and privacy policy
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar TOC */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h4 className="mb-4">Table of Contents</h4>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-sm text-gray-600 hover:text-[#001F3F] py-2 border-l-2 border-transparent hover:border-[#001F3F] pl-3 transition-colors"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={() => window.print()}
                    className="w-full px-4 py-2 bg-[#001F3F] text-white rounded-lg hover:bg-[#001F3F]/90 transition-colors text-sm"
                  >
                    Print Document
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search in document..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-white"
                  />
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-lg shadow-lg">
                <TabsList className="grid w-full grid-cols-2 p-1">
                  <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                </TabsList>

                {/* Terms of Service */}
                <TabsContent value="terms" className="p-8">
                  <div className="prose prose-sm max-w-none">
                    <div className="mb-8">
                      <p className="text-sm text-gray-500 mb-2">Last Updated: October 14, 2025</p>
                      <p className="text-gray-600">
                        Please read these Terms of Service carefully before using SecureInsure's platform and services.
                      </p>
                    </div>

                    <section id="overview" className="mb-8 scroll-mt-24">
                      <h2 className="text-2xl mb-4">1. Overview</h2>
                      <p className="mb-4">
                        These Terms of Service ("Terms") govern your access to and use of SecureInsure's website, 
                        mobile applications, and services (collectively, the "Platform"). By accessing or using the 
                        Platform, you agree to be bound by these Terms and our Privacy Policy.
                      </p>
                      <p>
                        SecureInsure is a licensed insurance broker registered with the Insurance Regulatory and 
                        Development Authority of India (IRDAI). License No: IRDAI/DB/2010/001. We facilitate the 
                        purchase of insurance products from various insurance companies.
                      </p>
                    </section>

                    <section id="definitions" className="mb-8 scroll-mt-24">
                      <h2 className="text-2xl mb-4">2. Definitions</h2>
                      <ul className="space-y-2 list-disc pl-6">
                        <li><strong>"User", "You", "Your"</strong> refers to any person accessing or using the Platform.</li>
                        <li><strong>"We", "Us", "Our"</strong> refers to SecureInsure and its affiliates.</li>
                        <li><strong>"Policy"</strong> refers to any insurance policy purchased through our Platform.</li>
                        <li><strong>"Premium"</strong> refers to the payment made for insurance coverage.</li>
                        <li><strong>"Insurer"</strong> refers to the insurance company underwriting the policy.</li>
                      </ul>
                    </section>

                    <section id="eligibility" className="mb-8 scroll-mt-24">
                      <h2 className="text-2xl mb-4">3. Eligibility</h2>
                      <p className="mb-4">To use our Platform, you must:</p>
                      <ul className="space-y-2 list-disc pl-6">
                        <li>Be at least 18 years of age or the legal age of majority in your jurisdiction</li>
                        <li>Be a resident of India with a valid PAN card</li>
                        <li>Have the legal capacity to enter into binding contracts</li>
                        <li>Provide accurate and truthful information during registration and policy purchase</li>
                        <li>Not be prohibited from using our services under applicable laws</li>
                      </ul>
                    </section>

                    <section id="purchase" className="mb-8 scroll-mt-24">
                      <h2 className="text-2xl mb-4">4. Purchase Terms</h2>
                      <p className="mb-4">
                        When you purchase an insurance policy through our Platform:
                      </p>
                      <ul className="space-y-2 list-disc pl-6">
                        <li>You enter into a contract directly with the insurer, not with SecureInsure</li>
                        <li>All coverage, benefits, exclusions, and terms are governed by the policy document issued by the insurer</li>
                        <li>You must provide accurate information; misrepresentation may void your policy</li>
                        <li>Policy terms cannot be modified after issuance without insurer approval</li>
                        <li>You will receive an e-policy document via email within 24 hours of payment</li>
                      </ul>
                    </section>

                    <section id="premiums" className="mb-8 scroll-mt-24">
                      <h2 className="text-2xl mb-4">5. Premiums & Payments</h2>
                      <p className="mb-4">Payment terms and conditions:</p>
                      <ul className="space-y-2 list-disc pl-6">
                        <li>Premiums must be paid in full before policy activation</li>
                        <li>We accept payments via UPI, net banking, credit/debit cards, and digital wallets</li>
                        <li>All payments are processed through secure, PCI DSS compliant gateways</li>
                        <li>Payment failures may result in policy lapse; grace periods as per insurer's terms</li>
                        <li>Refunds for cancelled policies are processed as per the insurer's cancellation policy</li>
                        <li>We may charge a nominal service fee for our brokerage services</li>
                      </ul>
                    </section>

                    <section id="claims" className="mb-8 scroll-mt-24">
                      <h2 className="text-2xl mb-4">6. Claims Process</h2>
                      <p className="mb-4">For filing and processing claims:</p>
                      <ul className="space-y-2 list-disc pl-6">
                        <li>Claims must be filed through our Platform or directly with the insurer</li>
                        <li>All required documents must be submitted for claim assessment</li>
                        <li>Claims are subject to verification and approval by the insurer</li>
                        <li>We assist with claim filing but final decisions rest with the insurer</li>
                        <li>Settlement timelines vary by claim type and insurer policies</li>
                        <li>Fraudulent claims will be rejected and may result in policy cancellation</li>
                      </ul>
                    </section>

                    <section id="cancellation" className="mb-8 scroll-mt-24">
                      <h2 className="text-2xl mb-4">7. Cancellation & Refunds</h2>
                      <p className="mb-4">Cancellation and refund policies:</p>
                      <ul className="space-y-2 list-disc pl-6">
                        <li>You may cancel your policy within 15-30 days (free-look period) for a full refund</li>
                        <li>Cancellations after the free-look period are subject to deductions</li>
                        <li>Refund amounts and timelines are determined by the insurer's policy</li>
                        <li>Refunds are processed to the original payment method within 7-15 business days</li>
                        <li>Some policies may not be eligible for cancellation (e.g., term plans with claims)</li>
                      </ul>
                    </section>

                    <section id="data" className="mb-8 scroll-mt-24">
                      <h2 className="text-2xl mb-4">8. Data Protection</h2>
                      <p className="mb-4">Your data privacy is important to us:</p>
                      <ul className="space-y-2 list-disc pl-6">
                        <li>We collect and process personal data in accordance with applicable laws</li>
                        <li>Data is used solely for policy administration, claims processing, and service improvement</li>
                        <li>We implement industry-standard security measures to protect your data</li>
                        <li>Data may be shared with insurers, regulators, and service providers as necessary</li>
                        <li>You have the right to access, correct, and delete your personal data</li>
                        <li>For detailed information, please refer to our Privacy Policy</li>
                      </ul>
                    </section>

                    <div className="border-t pt-6 mt-8">
                      <h3 className="mb-4">Contact Information</h3>
                      <p className="mb-2">For questions about these Terms, contact us at:</p>
                      <p>Email: legal@secureinsure.com</p>
                      <p>Phone: 1800-123-4567</p>
                      <p>Address: Nariman Point, Mumbai, Maharashtra 400001</p>
                    </div>
                  </div>
                </TabsContent>

                {/* Privacy Policy */}
                <TabsContent value="privacy" className="p-8">
                  <div className="prose prose-sm max-w-none">
                    <div className="mb-8">
                      <p className="text-sm text-gray-500 mb-2">Last Updated: October 14, 2025</p>
                      <p className="text-gray-600">
                        This Privacy Policy explains how SecureInsure collects, uses, and protects your personal information.
                      </p>
                    </div>

                    <section className="mb-8">
                      <h2 className="text-2xl mb-4">1. Information We Collect</h2>
                      <p className="mb-4">We collect the following types of information:</p>
                      
                      <h3 className="mb-3">Personal Information</h3>
                      <ul className="space-y-2 list-disc pl-6 mb-4">
                        <li>Name, date of birth, gender, contact details</li>
                        <li>PAN card, Aadhaar card, and other identification documents</li>
                        <li>Bank account and payment information</li>
                        <li>Medical history and health-related information (for health insurance)</li>
                        <li>Vehicle details (for car insurance)</li>
                      </ul>

                      <h3 className="mb-3">Technical Information</h3>
                      <ul className="space-y-2 list-disc pl-6">
                        <li>IP address, browser type, device information</li>
                        <li>Cookies and similar tracking technologies</li>
                        <li>Usage data and browsing patterns</li>
                      </ul>
                    </section>

                    <section className="mb-8">
                      <h2 className="text-2xl mb-4">2. How We Use Your Information</h2>
                      <p className="mb-4">Your information is used for:</p>
                      <ul className="space-y-2 list-disc pl-6">
                        <li>Processing insurance applications and issuing policies</li>
                        <li>Handling claims and customer service requests</li>
                        <li>Sending policy updates, renewal reminders, and important notifications</li>
                        <li>Improving our services and user experience</li>
                        <li>Complying with legal and regulatory requirements</li>
                        <li>Preventing fraud and ensuring security</li>
                      </ul>
                    </section>

                    <section className="mb-8">
                      <h2 className="text-2xl mb-4">3. Data Sharing</h2>
                      <p className="mb-4">We may share your information with:</p>
                      <ul className="space-y-2 list-disc pl-6">
                        <li><strong>Insurance Companies:</strong> To process applications and claims</li>
                        <li><strong>Service Providers:</strong> Payment processors, KYC vendors, IT services</li>
                        <li><strong>Regulators:</strong> IRDAI and other authorities as required by law</li>
                        <li><strong>Legal Authorities:</strong> When required by court orders or legal processes</li>
                      </ul>
                      <p className="mt-4">We never sell your personal data to third parties for marketing purposes.</p>
                    </section>

                    <section className="mb-8">
                      <h2 className="text-2xl mb-4">4. Data Security</h2>
                      <p className="mb-4">We protect your data through:</p>
                      <ul className="space-y-2 list-disc pl-6">
                        <li>256-bit SSL encryption for all data transmission</li>
                        <li>Secure, encrypted data storage with regular backups</li>
                        <li>Access controls and authentication mechanisms</li>
                        <li>Regular security audits and vulnerability assessments</li>
                        <li>Employee training on data protection practices</li>
                        <li>ISO 27001 certified information security management</li>
                      </ul>
                    </section>

                    <section className="mb-8">
                      <h2 className="text-2xl mb-4">5. Your Rights</h2>
                      <p className="mb-4">You have the right to:</p>
                      <ul className="space-y-2 list-disc pl-6">
                        <li>Access your personal data stored with us</li>
                        <li>Correct inaccurate or incomplete information</li>
                        <li>Request deletion of your data (subject to legal requirements)</li>
                        <li>Object to processing of your data for certain purposes</li>
                        <li>Withdraw consent where processing is based on consent</li>
                        <li>Port your data to another service provider</li>
                      </ul>
                    </section>

                    <section className="mb-8">
                      <h2 className="text-2xl mb-4">6. Cookies Policy</h2>
                      <p className="mb-4">
                        We use cookies and similar technologies to enhance your experience. Cookies help us:
                      </p>
                      <ul className="space-y-2 list-disc pl-6">
                        <li>Remember your preferences and settings</li>
                        <li>Understand how you use our Platform</li>
                        <li>Improve our services and personalize content</li>
                        <li>Provide relevant advertisements</li>
                      </ul>
                      <p className="mt-4">You can manage cookie preferences through your browser settings.</p>
                    </section>

                    <section className="mb-8">
                      <h2 className="text-2xl mb-4">7. Data Retention</h2>
                      <p>
                        We retain your personal data for as long as necessary to fulfill the purposes outlined in this 
                        Privacy Policy, or as required by law. Policy-related data is retained for a minimum of 10 years 
                        as per insurance regulations.
                      </p>
                    </section>

                    <div className="border-t pt-6 mt-8">
                      <h3 className="mb-4">Contact Us</h3>
                      <p className="mb-2">For privacy-related questions or to exercise your rights:</p>
                      <p>Data Protection Officer: privacy@secureinsure.com</p>
                      <p>Phone: 1800-123-4567</p>
                      <p>Address: Nariman Point, Mumbai, Maharashtra 400001</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

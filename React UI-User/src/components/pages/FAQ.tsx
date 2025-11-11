import { useState } from 'react';
import { Search, FileText, Heart, Car, Activity, DollarSign } from 'lucide-react';
import { Input } from '../ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const categories = [
  { id: 'general', label: 'General', icon: FileText },
  { id: 'life', label: 'Life Insurance', icon: Heart },
  { id: 'car', label: 'Car Insurance', icon: Car },
  { id: 'health', label: 'Health Insurance', icon: Activity },
  { id: 'claims', label: 'Claims', icon: DollarSign }
];

const faqs = [
  {
    category: 'general',
    question: 'How do I buy insurance online?',
    answer: 'To buy insurance online, simply select the type of insurance you need (Life, Car, or Health), fill in your details, compare plans from different providers, customize your coverage, complete KYC verification, and make payment. Your e-policy will be issued instantly.'
  },
  {
    category: 'general',
    question: 'Is buying insurance online safe?',
    answer: 'Yes, buying insurance through SecureInsure is completely safe. We use bank-grade 256-bit SSL encryption, are IRDAI certified, and PCI DSS compliant. All your data is encrypted and securely stored. We never share your information with third parties without your consent.'
  },
  {
    category: 'general',
    question: 'What documents do I need to buy insurance?',
    answer: 'You typically need: PAN card, Aadhaar card, bank account details, and recent photographs. For specific insurance types, additional documents may be required (e.g., car registration for car insurance, medical reports for health insurance).'
  },
  {
    category: 'life',
    question: 'What is the difference between term life and whole life insurance?',
    answer: 'Term life insurance provides coverage for a specific period (e.g., 20-30 years) and is pure protection with no maturity benefits. Whole life insurance covers you for your entire life and includes an investment component with maturity benefits.'
  },
  {
    category: 'life',
    question: 'Can I increase my life insurance coverage later?',
    answer: 'Yes, most policies offer the option to increase coverage through riders or by purchasing additional policies. However, this may require fresh medical underwriting and the premium will be based on your current age.'
  },
  {
    category: 'life',
    question: 'What factors affect my life insurance premium?',
    answer: 'Key factors include: age, gender, health condition, smoking/drinking habits, occupation, coverage amount, policy tenure, and any riders you add. Younger, healthier individuals typically pay lower premiums.'
  },
  {
    category: 'car',
    question: 'What is the difference between comprehensive and third-party car insurance?',
    answer: 'Third-party insurance is the legal minimum that covers damages to others. Comprehensive insurance covers both third-party liabilities and damages to your own vehicle from accidents, theft, fire, natural disasters, etc.'
  },
  {
    category: 'car',
    question: 'What is No Claim Bonus (NCB)?',
    answer: 'NCB is a discount on your premium for every claim-free year, ranging from 20% to 50%. It belongs to the policyholder, not the vehicle, so you can transfer it when buying a new car or switching insurers.'
  },
  {
    category: 'car',
    question: 'What is IDV and how is it calculated?',
    answer: 'IDV (Insured Declared Value) is the maximum amount your insurer will pay if your car is stolen or totaled. It\'s calculated based on the manufacturer\'s listed price minus depreciation. You can choose an IDV slightly higher or lower within allowed limits.'
  },
  {
    category: 'car',
    question: 'What is zero depreciation cover?',
    answer: 'Zero depreciation (also called bumper-to-bumper) cover ensures you get the full cost of replaced parts during claims without deducting depreciation. This is especially useful for new cars and increases your claim amount.'
  },
  {
    category: 'health',
    question: 'What is a family floater health insurance plan?',
    answer: 'A family floater plan covers multiple family members under a single sum insured. Any member can use the entire sum insured for treatment. It\'s cost-effective compared to individual policies but the sum is shared among all members.'
  },
  {
    category: 'health',
    question: 'What is cashless hospitalization?',
    answer: 'Cashless hospitalization allows you to get treatment at network hospitals without paying upfront. The hospital bills the insurance company directly. You only pay for any non-covered items or amounts exceeding your sum insured.'
  },
  {
    category: 'health',
    question: 'What is a waiting period in health insurance?',
    answer: 'Waiting periods are time frames during which certain conditions aren\'t covered. Initial waiting period is 30 days for most illnesses, 2-4 years for pre-existing diseases, and 9-48 months for specific illnesses like hernias, cataracts, etc.'
  },
  {
    category: 'health',
    question: 'Can I cover my parents in my health insurance?',
    answer: 'Yes, you can include parents in a family floater plan if the insurer allows it, or buy separate senior citizen health insurance for them. Coverage for parents above 60-65 years may have higher premiums and specific terms.'
  },
  {
    category: 'claims',
    question: 'How do I file a claim?',
    answer: 'To file a claim: 1) Log in to your dashboard, 2) Go to "Claims" section, 3) Select the policy, 4) Provide incident details, 5) Upload required documents (bills, reports, FIR if applicable), 6) Submit for review. You can track status in real-time.'
  },
  {
    category: 'claims',
    question: 'How long does claim settlement take?',
    answer: 'For health insurance, cashless pre-authorization takes 2-4 hours. Reimbursement claims are settled within 7-15 days. For car insurance, claims are typically settled within 7-15 days after garage estimates. Life insurance claims take 30-90 days depending on documentation.'
  },
  {
    category: 'claims',
    question: 'What documents are needed for claims?',
    answer: 'Common documents include: Claim form, policy copy, hospital bills/discharge summary (health), FIR copy (theft/accident), repair estimates/bills (car), death certificate (life), photos of damages, and any other supporting documents specific to your claim type.'
  },
  {
    category: 'claims',
    question: 'What if my claim is rejected?',
    answer: 'If your claim is rejected, you\'ll receive a detailed reason. You can: 1) Provide additional documents if incomplete, 2) File an appeal with the insurer explaining your case, 3) Approach the Insurance Ombudsman, 4) Contact IRDAI grievance cell. We assist you throughout this process.'
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-[70px]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#001F3F] to-[#003366] text-white py-20">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="text-5xl mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            Find answers to common questions about our insurance products and services
          </p>
          
          {/* Search Bar */}
          <div className="max-w-[600px] mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white text-gray-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-[#F8F9FA] border-b sticky top-[70px] z-10">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#001F3F] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Topics
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#001F3F] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16">
        <div className="max-w-[900px] mx-auto px-4">
          {filteredFaqs.length > 0 ? (
            <>
              <p className="text-gray-600 mb-6">
                Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-white rounded-lg shadow px-6"
                  >
                    <AccordionTrigger className="hover:no-underline text-left py-6">
                      <div className="flex items-start gap-3">
                        {searchQuery && (
                          <span
                            className="text-xs px-2 py-1 rounded bg-[#001F3F] text-white flex-shrink-0"
                            style={{ marginTop: '2px' }}
                          >
                            {categories.find((c) => c.id === faq.category)?.label}
                          </span>
                        )}
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                Try different keywords or browse all topics
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-[#001F3F] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <h2 className="mb-4">Still Need Help?</h2>
          <p className="text-gray-600 mb-8">
            Can't find the answer you're looking for? Our customer support team is ready to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact">
              <button className="px-6 py-3 bg-[#001F3F] text-white rounded-lg hover:bg-[#001F3F]/90 transition-colors">
                Contact Support
              </button>
            </a>
            <a href="tel:1800-123-4567">
              <button className="px-6 py-3 bg-white text-[#001F3F] border-2 border-[#001F3F] rounded-lg hover:bg-gray-50 transition-colors">
                Call Us: 1800-123-4567
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

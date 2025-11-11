import { CheckCircle, Download, Share2, Heart, Car, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

const suggestedPlans = [
  {
    icon: Car,
    title: 'Car Insurance',
    description: 'Protect your vehicle with comprehensive coverage',
    link: '/car-insurance'
  },
  {
    icon: Activity,
    title: 'Health Insurance',
    description: 'Comprehensive health coverage for your family',
    link: '/health-insurance'
  },
  {
    icon: Heart,
    title: 'Life Insurance',
    description: 'Secure your family\'s financial future',
    link: '/life-insurance'
  }
];

export default function Confirmation() {
  const policyDetails = {
    policyNumber: 'SI-2025-001234',
    planName: 'HDFC Life Click 2 Protect Plus',
    policyHolder: 'John Doe',
    coverage: '₹50,00,000',
    premium: '₹10,200',
    tenure: '20 years',
    startDate: '15 Oct 2025',
    paymentMethod: 'UPI'
  };

  const handleDownload = () => {
    // Simulate PDF download
    alert('E-Policy PDF downloaded!');
  };

  const handleShare = () => {
    // Simulate sharing
    alert('Sharing policy details...');
  };

  return (
    <div className="pt-[70px] min-h-screen bg-[#F8F9FA] py-12">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-24 h-24 text-[#28A745]" />
          </div>
          <h1 className="text-5xl mb-4 text-[#28A745]">Purchase Successful!</h1>
          <p className="text-xl text-gray-600">
            Your insurance policy has been activated. An e-policy has been sent to your email.
          </p>
        </div>

        {/* Policy Summary */}
        <div className="max-w-[600px] mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="mb-6 text-center">Policy Summary</h2>
            
            <table className="w-full">
              <tbody className="space-y-3">
                <tr className="border-b">
                  <td className="py-3 text-gray-600">Policy Number</td>
                  <td className="py-3 text-right">{policyDetails.policyNumber}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-600">Plan Name</td>
                  <td className="py-3 text-right">{policyDetails.planName}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-600">Policy Holder</td>
                  <td className="py-3 text-right">{policyDetails.policyHolder}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-600">Coverage</td>
                  <td className="py-3 text-right">{policyDetails.coverage}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-600">Annual Premium</td>
                  <td className="py-3 text-right text-[#28A745]">{policyDetails.premium}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-600">Policy Tenure</td>
                  <td className="py-3 text-right">{policyDetails.tenure}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-600">Start Date</td>
                  <td className="py-3 text-right">{policyDetails.startDate}</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600">Payment Method</td>
                  <td className="py-3 text-right">{policyDetails.paymentMethod}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex gap-4 mt-8">
              <Button
                onClick={handleDownload}
                className="flex-1 bg-[#001F3F] hover:bg-[#001F3F]/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Download E-Policy
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="max-w-[800px] mx-auto mb-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="mb-4 text-blue-900">What Happens Next?</h3>
            <ul className="space-y-3 text-blue-800">
              <li className="flex items-start gap-3">
                <span className="text-[#28A745] mt-1">✓</span>
                <span>E-policy document has been sent to your registered email address</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#28A745] mt-1">✓</span>
                <span>You can access and manage your policy anytime from your dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#28A745] mt-1">✓</span>
                <span>Renewal reminder will be sent 30 days before expiry</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#28A745] mt-1">✓</span>
                <span>For claims, visit the Claims section in your dashboard</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <Link to="/dashboard">
            <Button className="bg-[#28A745] hover:bg-[#28A745]/90">
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline">
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Upsell Section */}
        <div>
          <h2 className="text-center mb-8">You Might Also Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestedPlans.map((plan, index) => (
              <Link key={index} to={plan.link}>
                <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-[#001F3F] rounded-full flex items-center justify-center">
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h4 className="text-center mb-3">{plan.title}</h4>
                  <p className="text-center text-sm text-gray-600">{plan.description}</p>
                  <div className="text-center mt-4">
                    <span className="text-[#001F3F] hover:text-[#28A745]">Explore Now →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

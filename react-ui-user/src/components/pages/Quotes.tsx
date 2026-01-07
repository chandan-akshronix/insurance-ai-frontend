import { useState } from 'react';
import { ArrowRight, Check, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { useNavigate } from 'react-router-dom';

const steps = ['Product Details', 'Compare Plans', 'Customize', 'KYC', 'Payment'];

const plans = [
  {
    id: 1,
    provider: 'HDFC Life',
    name: 'Click 2 Protect Plus',
    premium: 850,
    coverage: 5000000,
    features: ['Life cover', 'Tax benefits', 'Online claim'],
    rating: 4.5
  },
  {
    id: 2,
    provider: 'ICICI Prudential',
    name: 'iProtect Smart',
    premium: 920,
    coverage: 5000000,
    features: ['Life cover', 'Accidental death', 'Tax benefits', 'Online claim'],
    rating: 4.7
  },
  {
    id: 3,
    provider: 'Max Life',
    name: 'Smart Secure Plus',
    premium: 780,
    coverage: 5000000,
    features: ['Life cover', 'Critical illness', 'Tax benefits'],
    rating: 4.3
  },
  {
    id: 4,
    provider: 'SBI Life',
    name: 'eShield',
    premium: 810,
    coverage: 5000000,
    features: ['Life cover', 'Tax benefits', 'Flexible tenure'],
    rating: 4.4
  }
];

export default function Quotes() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [premiumRange, setPremiumRange] = useState([500, 2000]);
  const [sortBy, setSortBy] = useState('price');
  const navigate = useNavigate();

  const filteredPlans = plans
    .filter(plan => plan.premium >= premiumRange[0] && plan.premium <= premiumRange[1])
    .sort((a, b) => {
      if (sortBy === 'price') return a.premium - b.premium;
      if (sortBy === 'coverage') return b.coverage - a.coverage;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const handleProceed = () => {
    if (!selectedPlan) return;
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/confirmation');
    }
  };

  return (
    <div className="pt-[70px] min-h-screen bg-[#F8F9FA]">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index + 1 <= currentStep
                        ? 'bg-[#28A745] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1 < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <p className="text-xs mt-2 text-center">{step}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 ${
                      index + 1 < currentStep ? 'bg-[#28A745]' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="w-5 h-5 text-[#001F3F]" />
                <h3>Filters</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Premium Range</Label>
                  <Slider
                    value={premiumRange}
                    onValueChange={setPremiumRange}
                    min={500}
                    max={2000}
                    step={50}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{premiumRange[0]}</span>
                    <span>₹{premiumRange[1]}</span>
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Sort By</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sort"
                        value="price"
                        checked={sortBy === 'price'}
                        onChange={(e) => setSortBy(e.target.value)}
                      />
                      <span className="text-sm">Lowest Price</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sort"
                        value="coverage"
                        checked={sortBy === 'coverage'}
                        onChange={(e) => setSortBy(e.target.value)}
                      />
                      <span className="text-sm">Highest Coverage</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sort"
                        value="rating"
                        checked={sortBy === 'rating'}
                        onChange={(e) => setSortBy(e.target.value)}
                      />
                      <span className="text-sm">Best Rating</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Features</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <Checkbox />
                      <span className="text-sm">Life cover</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox />
                      <span className="text-sm">Accidental death</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox />
                      <span className="text-sm">Critical illness</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox />
                      <span className="text-sm">Tax benefits</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plans Table */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <h2>Compare Insurance Plans</h2>
                <p className="text-gray-600 mt-2">
                  Found {filteredPlans.length} plans matching your criteria
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#001F3F] text-white">
                    <tr>
                      <th className="p-4 text-left">Provider</th>
                      <th className="p-4 text-left">Plan Name</th>
                      <th className="p-4 text-left">Monthly Premium</th>
                      <th className="p-4 text-left">Coverage</th>
                      <th className="p-4 text-left">Features</th>
                      <th className="p-4 text-left">Rating</th>
                      <th className="p-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.map((plan) => (
                      <tr
                        key={plan.id}
                        className={`border-b hover:bg-gray-50 ${
                          selectedPlan === plan.id ? 'bg-[#28A745]/10' : ''
                        }`}
                      >
                        <td className="p-4">{plan.provider}</td>
                        <td className="p-4">{plan.name}</td>
                        <td className="p-4">
                          <span className="text-[#28A745]">₹{plan.premium}/mo</span>
                        </td>
                        <td className="p-4">₹{(plan.coverage / 100000).toFixed(0)}L</td>
                        <td className="p-4">
                          <ul className="text-sm space-y-1">
                            {plan.features.map((feature, idx) => (
                              <li key={idx}>✓ {feature}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span>{plan.rating}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Button
                            onClick={() => setSelectedPlan(plan.id)}
                            variant={selectedPlan === plan.id ? 'default' : 'outline'}
                            className={
                              selectedPlan === plan.id
                                ? 'bg-[#28A745] hover:bg-[#28A745]/90'
                                : ''
                            }
                          >
                            {selectedPlan === plan.id ? 'Selected' : 'Select'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">
                    {selectedPlan
                      ? `Selected: ${plans.find(p => p.id === selectedPlan)?.name}`
                      : 'Please select a plan to continue'}
                  </p>
                  <Button
                    onClick={handleProceed}
                    disabled={!selectedPlan}
                    className="bg-[#001F3F] hover:bg-[#001F3F]/90 disabled:opacity-50"
                  >
                    {currentStep === steps.length ? 'Complete Purchase' : 'Proceed to Next Step'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            {filteredPlans.length > 0 && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="mb-2 text-blue-900">AI Recommendation</h4>
                <p className="text-blue-800 text-sm">
                  Based on your profile, we recommend{' '}
                  <strong>{filteredPlans[0].provider} {filteredPlans[0].name}</strong> for the
                  best value with comprehensive coverage.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

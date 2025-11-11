import { Shield, Award, Users, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const milestones = [
  { year: '2010', title: 'Founded', description: 'SecureInsure was established' },
  { year: '2013', title: '10K Customers', description: 'Reached 10,000 happy customers' },
  { year: '2017', title: 'IRDAI Certified', description: 'Received full regulatory approval' },
  { year: '2020', title: 'Digital First', description: 'Launched fully digital platform' },
  { year: '2025', title: '500K+ Customers', description: 'Half a million policies issued' }
];

const team = [
  {
    name: 'Rajesh Kumar',
    role: 'CEO & Founder',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
  },
  {
    name: 'Priya Mehta',
    role: 'Chief Operating Officer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
  },
  {
    name: 'Amit Sharma',
    role: 'Chief Technology Officer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
  },
  {
    name: 'Sneha Patel',
    role: 'Head of Customer Success',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'
  }
];

const stats = [
  { icon: Users, value: '500K+', label: 'Happy Customers' },
  { icon: Shield, value: '₹1000Cr+', label: 'Claims Settled' },
  { icon: Award, value: '98%', label: 'Satisfaction Rate' },
  { icon: TrendingUp, value: '15+', label: 'Years of Excellence' }
];

export default function AboutUs() {
  return (
    <div className="pt-[70px]">
      {/* Hero Section */}
      <section
        className="relative h-[400px] flex items-center justify-center text-white"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1758518732175-5d608ba3abdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHRlYW18ZW58MXx8fHwxNzYwMzM5ODI2fDA&ixlib=rb-4.1.0&q=80&w=1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-[#001F3F]/70"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl mb-4">About SecureInsure</h1>
          <p className="text-xl text-gray-200">
            Empowering India with transparent, accessible, and reliable insurance solutions since 2010
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <blockquote className="text-2xl text-gray-700 italic">
            "Our mission is to democratize insurance in India by providing simple, transparent, and customer-first solutions that protect what matters most to families and businesses."
          </blockquote>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#001F3F] -translate-x-1/2 hidden md:block"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="flex-1 text-center md:text-right">
                    {index % 2 === 0 && (
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-[#001F3F] mb-2">{milestone.year}</h3>
                        <h4 className="mb-2">{milestone.title}</h4>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-[#001F3F] rounded-full flex items-center justify-center relative z-10 flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    {index % 2 !== 0 && (
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-[#001F3F] mb-2">{milestone.year}</h3>
                        <h4 className="mb-2">{milestone.title}</h4>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#001F3F] rounded-full flex items-center justify-center">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-[#001F3F] mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Meet Our Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <ImageWithFallback
                  src={member.image}
                  alt={member.name}
                  className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"
                />
                <h4 className="mb-1">{member.name}</h4>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="mb-8">Certifications & Compliance</h2>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="px-8 py-6 bg-white rounded-lg shadow-lg">
              <p className="text-gray-700">IRDAI Registered</p>
              <p className="text-sm text-gray-500">License No: IRDAI/DB/2010/001</p>
            </div>
            <div className="px-8 py-6 bg-white rounded-lg shadow-lg">
              <p className="text-gray-700">ISO 27001:2013 Certified</p>
              <p className="text-sm text-gray-500">Information Security</p>
            </div>
            <div className="px-8 py-6 bg-white rounded-lg shadow-lg">
              <p className="text-gray-700">SSL Secured</p>
              <p className="text-sm text-gray-500">256-bit Encryption</p>
            </div>
            <div className="px-8 py-6 bg-white rounded-lg shadow-lg">
              <p className="text-gray-700">PCI DSS Compliant</p>
              <p className="text-sm text-gray-500">Secure Payments</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

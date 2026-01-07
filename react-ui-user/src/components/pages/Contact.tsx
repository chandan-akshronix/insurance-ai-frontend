import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';

const contactMethods = [
  {
    icon: Phone,
    title: '24/7 Phone Support',
    content: '1800-123-4567 (Toll Free)',
    description: 'Available 24 hours for emergencies'
  },
  {
    icon: Mail,
    title: 'Email Support',
    content: 'support@secureinsure.com',
    description: 'Response within 24 hours'
  },
  {
    icon: MapPin,
    title: 'Head Office',
    content: 'Mumbai, Maharashtra 400001',
    description: 'Visit us Mon-Fri, 9 AM - 6 PM'
  },
  {
    icon: Clock,
    title: 'Business Hours',
    content: 'Mon - Sat: 9 AM - 6 PM',
    description: 'Emergency support 24/7'
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: ''
  });
  const [chatOpen, setChatOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill all required fields');
      return;
    }
    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', category: '', message: '' });
  };

  return (
    <div className="pt-[70px]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#001F3F] to-[#003366] text-white py-20">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="text-5xl mb-6">Contact Us</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            We're here to help. Reach out to us through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-lg text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#001F3F] rounded-full flex items-center justify-center">
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h4 className="mb-2">{method.title}</h4>
                <p className="text-[#28A745] mb-2">{method.content}</p>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Chat */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 1234567890"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger id="category" className="mt-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="claims">Claims Support</SelectItem>
                        <SelectItem value="policy">Policy Information</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="How can we help you?"
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#001F3F] hover:bg-[#001F3F]/90"
                    style={{ height: '50px' }}
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </div>

            {/* Live Chat & FAQ */}
            <div>
              <h2 className="mb-6">Get Instant Help</h2>
              
              {/* Chat Widget */}
              <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#28A745] rounded-full flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4>Live Chat Support</h4>
                    <p className="text-sm text-gray-600">Average response time: 2 mins</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Chat with our AI assistant or connect with a human agent for immediate assistance.
                </p>
                <Button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="w-full bg-[#28A745] hover:bg-[#28A745]/90"
                >
                  {chatOpen ? 'Close Chat' : 'Start Chat'}
                </Button>

                {chatOpen && (
                  <div className="mt-6 border-t pt-6">
                    <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-sm">👋 Hello! I'm your AI assistant. How can I help you today?</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Type your message..." />
                      <Button className="bg-[#001F3F] hover:bg-[#001F3F]/90">
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-xl p-8">
                <h4 className="mb-4">Quick Links</h4>
                <div className="space-y-3">
                  <a href="/faq" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <h4 className="text-sm mb-1">Frequently Asked Questions</h4>
                    <p className="text-xs text-gray-600">Find answers to common questions</p>
                  </a>
                  <a href="/claims/submit" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <h4 className="text-sm mb-1">File a Claim</h4>
                    <p className="text-xs text-gray-600">Submit your insurance claim</p>
                  </a>
                  <a href="/dashboard" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <h4 className="text-sm mb-1">My Policies</h4>
                    <p className="text-xs text-gray-600">View and manage your policies</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-8">Visit Our Office</h2>
          <div className="bg-gray-300 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">SecureInsure Head Office</p>
                <p className="text-sm text-gray-500">Nariman Point, Mumbai, Maharashtra 400001</p>
                <p className="text-sm text-gray-500 mt-2">Interactive map would be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

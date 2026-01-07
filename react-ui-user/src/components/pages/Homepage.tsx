import { useState, useEffect } from 'react';
import { Heart, Car, Activity, ChevronRight, Star, Shield, Clock, Award, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { getTestimonials, getPlatformStats } from '../../services/api';

const features = [
  { icon: Clock, title: 'Instant Approval', description: 'Get approved in minutes' },
  { icon: Shield, title: '100% Secure', description: 'Bank-grade security' },
  { icon: Award, title: 'Best Rates', description: 'Lowest premiums guaranteed' },
  { icon: TrendingUp, title: 'Easy Claims', description: 'Quick claim settlement' }
];

export default function Homepage() {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [testimonialsData, statsData] = await Promise.all([
          getTestimonials(),
          getPlatformStats()
        ]);

        setTestimonials(testimonialsData.testimonials || []);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="pt-[70px]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="max-w-[1400px] mx-auto px-4 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">Trusted by 500,000+ customers</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                Insurance Made Simple
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-8">
                Compare, customize, and buy the perfect insurance plan in minutes. No paperwork, no hassle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setQuoteModalOpen(true)}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white h-14 px-8 text-lg group"
                >
                  Get Free Quote
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Instant Approval</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-cyan-500/20 rounded-3xl blur-3xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1662987619545-1844207dedac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwcGVvcGxlJTIwaW5zdXJhbmNlJTIwZmFtaWx5fGVufDF8fHx8MTc2MDQyMDQzNHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Happy family"
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y">
        <div className="max-w-[1400px] mx-auto px-4">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: stats.happyCustomers, label: 'Happy Customers' },
                { value: stats.claimsSettled, label: 'Claims Settled' },
                { value: stats.satisfactionRate, label: 'Satisfaction Rate' },
                { value: stats.supportAvailability, label: 'Support Available' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <h3 className="text-4xl md:text-5xl bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-slate-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">Choose Your Protection</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive coverage for every aspect of your life
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Life Insurance',
                description: 'Protect your family\'s financial future with comprehensive life coverage plans.',
                link: '/life-insurance',
                color: 'from-pink-500 to-rose-500'
              },
              {
                icon: Car,
                title: 'Car Insurance',
                description: 'Drive with confidence with comprehensive and third-party car insurance.',
                link: '/car-insurance',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Activity,
                title: 'Health Insurance',
                description: 'Quality healthcare for you and your loved ones with cashless benefits.',
                link: '/health-insurance',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={product.link}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary overflow-hidden">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 bg-gradient-to-br ${product.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <product.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl mb-4 group-hover:text-primary transition-colors">{product.title}</h3>
                      <p className="text-slate-600 mb-6">{product.description}</p>
                      <div className="flex items-center text-primary group-hover:gap-3 transition-all">
                        <span>Learn More</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">Why Choose Us?</h2>
            <p className="text-xl text-slate-600">Experience the SecureInsure difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl mb-2">{feature.title}</h4>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">Customer Stories</h2>
            <p className="text-xl text-slate-600">See what our customers have to say</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p>{testimonial.name}</p>
                        <p className="text-sm text-slate-600">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="max-w-[1400px] mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl mb-6">Ready to Get Protected?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us with their insurance needs
            </p>
            <Button
              onClick={() => setQuoteModalOpen(true)}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-lg"
            >
              Get Your Free Quote Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Quick Quote Modal */}
      <Dialog open={quoteModalOpen} onOpenChange={setQuoteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Get Your Free Quote</DialogTitle>
            <DialogDescription>Fill in your details to get a personalized insurance quote.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="product">Select Product</Label>
              <Select>
                <SelectTrigger id="product" className="mt-2">
                  <SelectValue placeholder="Choose insurance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="life">Life Insurance</SelectItem>
                  <SelectItem value="car">Car Insurance</SelectItem>
                  <SelectItem value="health">Health Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your name" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+91 1234567890" className="mt-2" />
            </div>
            <Button className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90">
              Get Quote
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import logoImage from 'figma:asset/1df38bb3e2aa90271d87fe3d531275500d1f2a94.png';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white" style={{ minHeight: '300px' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <div className="mb-4">
              <img 
                src={logoImage} 
                alt="Akshronix Technology" 
                className="h-10 w-auto object-contain logo-no-bg-dark"
              />
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Protecting your future with comprehensive insurance solutions.
            </p>
            <div className="flex gap-3">
              <button className="hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </button>
              <button className="hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="mb-4">Products</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-300">
              <Link to="/life-insurance" className="hover:text-primary transition-colors">
                Life Insurance
              </Link>
              <Link to="/car-insurance" className="hover:text-primary transition-colors">
                Car Insurance
              </Link>
              <Link to="/health-insurance" className="hover:text-primary transition-colors">
                Health Insurance
              </Link>
              <Link to="/quotes" className="hover:text-primary transition-colors">
                Get Quote
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4">Company</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-300">
              <Link to="/about" className="hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
              <Link to="/faq" className="hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms & Privacy
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4">Newsletter</h4>
            <p className="text-sm text-slate-300 mb-3">
              Subscribe for updates and offers
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-300">
            © 2025 Akshronix Technology. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <span>IRDAI Certified</span>
            <span>SSL Secured</span>
            <span>ISO 27001</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { FaRecycle, FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 transition-colors duration-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaRecycle className="h-7 w-7 text-primary-500" />
              <span className="text-white font-extrabold text-xl tracking-tight">EcoReward</span>
            </div>
            <p className="text-sm text-slate-400">
              AI-powered waste management platform that encourages green practices by rewarding active recyclers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition-colors"><FaTwitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors"><FaGithub className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors"><FaLinkedin className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Features</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/signup" className="hover:text-white transition-colors">Register Account</Link></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How Pickups Work</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">AI Classification</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">System Rewards</a></li>
            </ul>
          </div>

          {/* Business Model */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Partners</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">B2B Material Purchases</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Corporate Contracts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carbon Credit Offset</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Advertising Deals</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2.5 text-sm">
              <li>Email: contact@ecoreward.com</li>
              <li>Phone: +91 44 2626 9900</li>
              <li>Address: Metro Towers, Chennai, TN, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EcoReward Inc. All rights reserved. Designed for sustainable circular economies.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

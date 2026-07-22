import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaRecycle, FaMobileAlt, FaRobot, FaGift, FaArrowRight, 
  FaCheckCircle, FaChevronDown, FaChevronUp, FaMapMarkedAlt, 
  FaRegPaperPlane, FaUserShield, FaChartPie, FaLeaf,
  FaShareAlt, FaCopy, FaCheck, FaWhatsapp, FaTwitter, FaFacebook
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  const [faqOpen, setFaqOpen] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://eco-liart-eta.vercel.app');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { value: '25K+', label: 'Happy Users' },
    { value: '150K+', label: 'Pickups Completed' },
    { value: '320 Tons', label: 'Waste Recycled' },
    { value: '₹2,45,000', label: 'Cashback & Vouchers Redeemed' }
  ];

  const features = [
    {
      icon: FaRobot,
      title: 'AI Waste Verification',
      desc: 'Our modular computer vision neural networks instantly detect waste category, weight estimations, and material quality scores.'
    },
    {
      icon: FaMapMarkedAlt,
      title: 'Real-time Tracking',
      desc: 'Follow driver routes and schedule smart notifications. GPS updates make coordination seamless.'
    },
    {
      icon: FaGift,
      title: 'Multi-tiered Points Ledger',
      desc: 'Convert sorted waste into reward points. Swap points instantly for gift cards, cashback, or eco-store discounts.'
    },
    {
      icon: FaUserShield,
      title: 'Role-based Interfaces',
      desc: 'Customized web portal dashboards tailored for customers scheduling requests, drivers completing pickups, and admins auditing metrics.'
    }
  ];

  const steps = [
    { num: '1', title: 'Schedule Pickup', desc: 'Select categories, input approximate weight details, select your address and slot.' },
    { num: '2', title: 'Driver Verifies', desc: 'An approved driver reaches your location and photographs materials for quality check.' },
    { num: '3', title: 'AI Evaluates', desc: 'EcoReward AI computes material ratings and verifies weight specs automatically.' },
    { num: '4', title: 'Earn & Redeem', desc: 'Points credit instantly to your wallet. Redeem coupons or claim direct cashback.' }
  ];

  const faqs = [
    { q: 'What items can be recycled on EcoReward?', a: 'We support Plastic, Paper, Metal, Glass, Organic Waste, and E-Waste. Sorted items yield higher point values.' },
    { q: 'How are reward points calculated?', a: 'Rewards are calculated per kilogram: Metal (20 pts/kg), E-waste (15 pts/kg), Plastic (10 pts/kg), Paper (8 pts/kg), Glass (6 pts/kg), and Organic (4 pts/kg).' },
    { q: 'How long does a pickup collection take?', a: 'Once scheduled, a nearby driver is assigned. Pickups are typically completed within the selected 2-hour time slot.' },
    { q: 'Is there a signup cost?', a: 'No, EcoReward is completely free for individual residents. We partner with B2B recycling factories to fund operations.' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold tracking-wide">
                <FaLeaf className="h-3.5 w-3.5" />
                <span>Zero Waste. Max Reward.</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Recycle Today, <br />
                <span className="bg-gradient-to-r from-emerald-600 to-primary-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-primary-300">
                  Earn Rewards
                </span> Tomorrow
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0">
                EcoReward leverages computer vision AI to streamline community waste management. 
                Schedule pickups, track drivers, and turn household garbage into valuable gift vouchers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link 
                  to="/signup" 
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Get Started</span>
                  <FaArrowRight className="h-4 w-4" />
                </Link>
                <a 
                  href="#how-it-works" 
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors flex items-center justify-center"
                >
                  Learn More
                </a>
              </div>
            </motion.div>

            {/* Right Graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center relative"
            >
              {/* Graphic Placeholder using standard web design features */}
              <div className="relative w-full max-w-[450px] aspect-square rounded-full bg-gradient-to-tr from-emerald-400 to-sky-300 dark:from-emerald-800 dark:to-sky-800 opacity-20 blur-2xl absolute -top-4"></div>
              
              <div className="relative bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-8 rounded-3xl shadow-xl w-full max-w-[420px] animate-float space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI Waste Detector v1.2</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-1 rounded">Active</span>
                </div>
                
                {/* Visual Simulation card */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200/40 dark:border-slate-700">
                  <img 
                    src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80" 
                    alt="AI Waste detection demo" 
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex flex-col justify-end p-4">
                    <div className="bg-emerald-500/90 text-white font-bold text-xs px-2.5 py-1 rounded-full self-start flex items-center space-x-1">
                      <FaCheckCircle className="h-3 w-3" />
                      <span>Plastic Bottles Detected</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">Weight Est.</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">4.82 kg</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">Quality Code</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">92% Pure</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Stats Counter Banner */}
      <section className="py-10 border-y border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-emerald-300">
                  {stat.value}
                </span>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">About EcoReward</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Smart Logistics Meets Green Incentives</p>
          <p className="text-slate-600 dark:text-slate-400">
            EcoReward bridge the gap between residents wishing to practice recycling and processing agencies requiring high quality raw sorted materials. Our mobile network guarantees verification efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Why Waste Segregation Matters</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              More than 80% of potential recyclable items end up in garbage landfills due to chemical contamination from mixed wastes. EcoReward solves this by incentivizing separated collections at point-of-origin.
            </p>
            <div className="space-y-3.5">
              <div className="flex items-start space-x-3">
                <FaCheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Zero contamination via early separation filters</span>
              </div>
              <div className="flex items-start space-x-3">
                <FaCheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reduced emissions through smart route optimization</span>
              </div>
              <div className="flex items-start space-x-3">
                <FaCheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Direct wallet deposit for community sustainability efforts</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-emerald-600 to-primary-500 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <FaRecycle className="h-72 w-72" />
            </div>
            <div className="relative z-10 space-y-6">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-400/30 px-3 py-1 rounded-full">Eco Impact</span>
              <p className="text-xl italic font-medium leading-relaxed">
                "Segregating waste at home and redeeming cashback codes with EcoReward allows Chennai households to prevent tons of landfill runoffs while supporting driver livelihood."
              </p>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold">R</div>
                <div>
                  <h4 className="font-bold text-sm">Rajeshwaran G.</h4>
                  <span className="text-xs opacity-75">Green Earth Foundation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-100 dark:bg-slate-900/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Core Features</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Equipped with Smart Waste Technology</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Process</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Four Simple Steps to Go Green</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, i) => (
            <div key={i} className="relative bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-3">
              <span className="absolute right-4 top-4 text-5xl font-extrabold text-emerald-100 dark:text-emerald-900/20">{step.num}</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4">{step.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-100 dark:bg-slate-900/50 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">FAQ</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-colors duration-355"
              >
                <button 
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-6 py-4 text-left font-bold text-slate-800 dark:text-slate-200 flex justify-between items-center"
                >
                  <span>{faq.q}</span>
                  {faqOpen === i ? <FaChevronUp className="h-4 w-4 text-emerald-500" /> : <FaChevronDown className="h-4 w-4" />}
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-20 bg-gradient-to-tr from-emerald-500/10 via-transparent to-primary-500/10 border-y border-slate-200/40 dark:border-slate-800/80 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <FaShareAlt className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Spread the Green Movement!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Help your friends and family recycle smart, protect the environment, and earn valuable rewards. Share the EcoReward platform with them!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto pt-2">
            {/* Copy Link input/button */}
            <div className="flex w-full items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <input 
                type="text" 
                readOnly
                value="https://eco-liart-eta.vercel.app"
                className="flex-1 px-4 py-3 bg-transparent text-xs font-mono text-slate-600 dark:text-slate-400 focus:outline-none"
              />
              <button 
                onClick={handleCopyLink}
                className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition-colors flex items-center space-x-1.5"
              >
                {copied ? (
                  <>
                    <FaCheck className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="h-3.5 w-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <a 
              href={`https://api.whatsapp.com/send?text=Join%20me%20on%20EcoReward%20to%20recycle%20smart%20and%20earn%20rewards!%20Check%20it%20out%20here:%20${encodeURIComponent('https://eco-liart-eta.vercel.app')}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-xs shadow-sm transition-all"
            >
              <FaWhatsapp className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
            <a 
              href={`https://twitter.com/intent/tweet?text=Join%20me%20on%20EcoReward%20to%20recycle%20smart%20and%20earn%20rewards!&url=${encodeURIComponent('https://eco-liart-eta.vercel.app')}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl text-xs shadow-sm transition-all"
            >
              <FaTwitter className="h-4 w-4" />
              <span>Twitter / X</span>
            </a>
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://eco-liart-eta.vercel.app')}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-2xl text-xs shadow-sm transition-all"
            >
              <FaFacebook className="h-4 w-4" />
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 shadow-xl space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Have Questions? Reach Out!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Our customer support and municipality partner desks are ready to assist.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input 
                  type="text" 
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  placeholder="John Doe" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input 
                  type="email" 
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  placeholder="john@example.com" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
              <textarea 
                rows="4"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
                placeholder="Write your inquiries here..." 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-md shadow-primary-500/20"
            >
              <FaRegPaperPlane className="h-4 w-4" />
              <span>{submitted ? 'Sending...' : 'Send Message'}</span>
            </button>

            {submitted && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-center font-semibold text-xs rounded-xl border border-emerald-250/20">
                Thank you! Your message has been sent successfully.
              </div>
            )}
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

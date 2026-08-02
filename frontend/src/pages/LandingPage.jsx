import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaRecycle, FaMobileAlt, FaRobot, FaGift, FaArrowRight, 
  FaCheckCircle, FaChevronDown, FaChevronUp, FaMapMarkedAlt, 
  FaRegPaperPlane, FaUserShield, FaChartPie, FaLeaf,
  FaShareAlt, FaCopy, FaCheck, FaWhatsapp, FaTwitter, FaFacebook,
  FaCalendarPlus, FaRoute, FaLightbulb, FaTruck, FaAward, FaTree,
  FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaVideo
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  const [faqOpen, setFaqOpen] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const heroVideoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://eco-liart-eta.vercel.app');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const impactStats = [
    { value: '25.8K+', label: 'Happy Users', icon: FaRecycle },
    { value: '15.3K+', label: 'Pickups Completed', icon: FaTruck },
    { value: '8.2 Tons', label: 'Waste Recycled', icon: FaChartPie },
    { value: '12.5K+', label: 'Trees Planted', icon: FaTree }
  ];

  const mockupFeatures = [
    {
      icon: FaCalendarPlus,
      title: 'Schedule Pickup',
      desc: 'Book a hassle-free waste pickup at your convenience in 3 simple clicks.',
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    {
      icon: FaRobot,
      title: 'AI Waste Scanner',
      desc: 'Scan waste items using neural camera detection for instant classification.',
      color: 'bg-teal-500/10 text-teal-500 border-teal-500/20'
    },
    {
      icon: FaAward,
      title: 'Reward System',
      desc: 'Earn EcoPoints for sorted waste and redeem instant gift vouchers.',
      color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    },
    {
      icon: FaRoute,
      title: 'Live Tracking',
      desc: 'Track your assigned collection driver in real-time with Google Maps.',
      color: 'bg-sky-500/10 text-sky-500 border-sky-500/20'
    },
    {
      icon: FaLeaf,
      title: 'Community Green',
      desc: 'Participate in local cleanups, earn badges, and climb leaderboards.',
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    },
    {
      icon: FaLightbulb,
      title: 'Daily Eco Tips',
      desc: 'Get smart daily tips on recycling purity and zero-waste lifestyles.',
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    }
  ];

  const mockupSteps = [
    { num: '1', title: 'Book Pickup', desc: 'Schedule a pickup easily from your phone.', icon: FaCalendarPlus },
    { num: '2', title: 'We Collect', desc: 'Our verified partner driver collects waste.', icon: FaTruck },
    { num: '3', title: 'We Recycle', desc: 'Materials are verified & processed cleanly.', icon: FaRecycle },
    { num: '4', title: 'You Earn', desc: 'Claim reward points for a better planet!', icon: FaGift }
  ];

  const faqs = [
    { q: 'What items can be recycled on EcoReward?', a: 'We support Plastic, Paper, Metal, Glass, Organic Waste, and E-Waste. Sorted items yield higher point values.' },
    { q: 'How are reward points calculated?', a: 'Rewards are calculated per kilogram: Metal (25 pts/kg), E-waste (20 pts/kg), Plastic (15 pts/kg), Paper (10 pts/kg), Glass (8 pts/kg), and Organic (5 pts/kg).' },
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
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-wide uppercase">
                <FaLeaf className="h-3.5 w-3.5" />
                <span>AI-Powered Smart Waste Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                AI-Powered <br />
                <span className="text-gradient-green-blue">
                  Eco Rewards
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 font-medium">
                Together, We Can Build a Cleaner & Greener Tomorrow. Schedule pickups, scan waste with AI, track drivers live, and earn gift vouchers for circular recycling.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link 
                  to="/signup" 
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Get Started Now</span>
                  <FaArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                >
                  <span>Member Login</span>
                </Link>
              </div>
            </motion.div>

            {/* Right Graphic with MP4 Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center relative"
            >
              <div className="relative w-full max-w-[460px] aspect-square rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-300 dark:from-emerald-800 dark:to-cyan-800 opacity-20 blur-3xl absolute -top-4"></div>
              
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-[460px] space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">Neural AI Waste Scanner</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Live Video Feed
                  </span>
                </div>
                
                {/* Live MP4 Video Box */}
                <div className="relative h-56 bg-slate-950 rounded-2xl flex items-center justify-center overflow-hidden border border-emerald-500/40 shadow-inner group">
                  <video 
                    ref={heroVideoRef}
                    src="/videos/eco-waste-management.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* AI Scan Overlay Grid */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 flex flex-col justify-between p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[10px] text-emerald-400 font-mono">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>AI RECOGNITION ACTIVE</span>
                      </div>
                    </div>

                    <div className="bg-emerald-500/90 backdrop-blur text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl self-start flex items-center space-x-2 shadow-lg">
                      <FaCheckCircle className="h-4 w-4 text-emerald-200" />
                      <span>Waste Management • Smart Recycling</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 dark:text-slate-400 block uppercase font-black tracking-wider">Classification</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">Smart Recyclable</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 dark:text-slate-400 block uppercase font-black tracking-wider">Eco Impact</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">100% Zero-Landfill</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Live Impact Counter Badges Bar */}
      <section className="py-12 border-y border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl flex-shrink-0 border border-emerald-500/20">
                    <Icon />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white text-gradient-green-blue block">
                      {stat.value}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Features Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
            Our Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Smart Eco Infrastructure</h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
            Discover how EcoReward transforms waste disposal into a rewarding green experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockupFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 space-y-4 hover:shadow-xl transition-all duration-300 group">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl border ${feat.color}`}>
                  <Icon />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{feat.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Platform Video Showcase Section */}
      <section id="video-tour" className="py-20 relative overflow-hidden bg-slate-900 text-white border-y border-slate-800">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-widest">
              <FaVideo className="h-3.5 w-3.5" />
              <span>Watch Eco In Action</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Experience the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Waste Management</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium max-w-2xl mx-auto">
              See how our AI recognition scanner, automated collection logistics, and instant rewards work together seamlessly to keep our environment pristine.
            </p>
          </div>

          {/* Video Showcase Card */}
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl shadow-emerald-900/40 bg-slate-950">
            <div className="relative aspect-video w-full overflow-hidden group">
              <video 
                ref={videoRef}
                src="/videos/eco-waste-management.mp4" 
                autoPlay 
                loop 
                muted={isMuted} 
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Video Overlay Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={togglePlay}
                    className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/30"
                    title={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? <FaPause className="h-4 w-4" /> : <FaPlay className="h-4 w-4 ml-0.5" />}
                  </button>

                  <button 
                    onClick={toggleMute}
                    className="p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-all backdrop-blur border border-slate-700"
                    title={isMuted ? "Unmute Sound" : "Mute Sound"}
                  >
                    {isMuted ? <FaVolumeMute className="h-4 w-4 text-amber-400" /> : <FaVolumeUp className="h-4 w-4 text-emerald-400" />}
                  </button>

                  <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>HD 1080p • Eco Management Video</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    Zero Landfill Mission
                  </span>
                </div>
              </div>
            </div>

            {/* Video Highlights Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 border-t border-slate-800 bg-slate-900/90 text-xs">
              <div className="p-4 flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FaRobot className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-extrabold text-white">AI Detection</p>
                  <p className="text-[11px] text-slate-400 font-medium">Automatic classification of waste</p>
                </div>
              </div>

              <div className="p-4 flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <FaTruck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-extrabold text-white">Smart Dispatch</p>
                  <p className="text-[11px] text-slate-400 font-medium">Real-time driver assignment</p>
                </div>
              </div>

              <div className="p-4 flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <FaGift className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-extrabold text-white">Instant Points</p>
                  <p className="text-[11px] text-slate-400 font-medium">Redeem points for eco-rewards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works 4-Step Diagram */}
      <section id="how-it-works" className="py-20 bg-slate-100/60 dark:bg-slate-900/60 border-y border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Simple 4-Step Process</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
              Turn everyday household waste into gift vouchers and clean energy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {mockupSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 text-center space-y-4 shadow-sm">
                  <div className="h-10 w-10 mx-auto rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow">
                    {step.num}
                  </div>
                  <div className="h-12 w-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                    <Icon />
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{step.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Every Action Counts CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left z-10">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur">
              Every Action Counts! ♻️
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Recycle Today, Reward Tomorrow.</h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl font-medium">
              Join 25,800+ citizens building a cleaner, greener earth with smart AI logistics.
            </p>
          </div>
          <Link 
            to="/signup" 
            className="z-10 px-8 py-4 bg-white text-emerald-700 font-extrabold text-sm rounded-2xl hover:bg-emerald-50 transition-all shadow-xl hover:scale-105 flex items-center space-x-2 flex-shrink-0"
          >
            <span>Create Free Account</span>
            <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-black text-center text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              <button
                onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                className="w-full p-5 text-left flex justify-between items-center font-bold text-sm text-slate-900 dark:text-white"
              >
                <span>{faq.q}</span>
                {faqOpen === index ? <FaChevronUp className="text-emerald-500" /> : <FaChevronDown className="text-slate-400" />}
              </button>
              {faqOpen === index && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

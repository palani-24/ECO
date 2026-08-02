import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRecycle, FaMobileAlt, FaRobot, FaGift, FaArrowRight, 
  FaCheckCircle, FaChevronDown, FaChevronUp, FaMapMarkedAlt, 
  FaRegPaperPlane, FaUserShield, FaChartPie, FaLeaf,
  FaShareAlt, FaCopy, FaCheck, FaWhatsapp, FaTwitter, FaFacebook,
  FaCalendarPlus, FaRoute, FaLightbulb, FaTruck, FaAward, FaTree,
  FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaVideo, FaSearch,
  FaCalculator, FaDesktop, FaBox, FaWineBottle, FaSlidersH, FaCrown,
  FaTrophy, FaStar, FaQuestionCircle, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  // Video player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

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

  // AI Scanner Simulator State
  const sampleItems = [
    {
      id: 'plastic',
      name: 'PET Plastic Bottle',
      category: 'Plastic',
      confidence: 98.4,
      weight: '0.35 kg',
      points: 15,
      recyclable: '100% Recyclable',
      image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=80',
      badgeColor: 'bg-emerald-500'
    },
    {
      id: 'ewaste',
      name: 'Circuit Board & Laptop',
      category: 'E-Waste',
      confidence: 99.1,
      weight: '2.10 kg',
      points: 105,
      recyclable: 'High Value Metal Recovery',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      badgeColor: 'bg-indigo-500'
    },
    {
      id: 'metal',
      name: 'Aluminum Soda Cans',
      category: 'Metal',
      confidence: 97.8,
      weight: '0.45 kg',
      points: 30,
      recyclable: 'Infinite Recyclability',
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80',
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'paper',
      name: 'Cardboard Shipping Box',
      category: 'Paper',
      confidence: 96.5,
      weight: '1.20 kg',
      points: 25,
      recyclable: 'Eco Fiber Pulp',
      image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
      badgeColor: 'bg-cyan-500'
    }
  ];

  const [activeDemoItem, setActiveDemoItem] = useState(sampleItems[0]);
  const [isScanning, setIsScanning] = useState(false);

  const handleSelectDemo = (item) => {
    if (item.id === activeDemoItem.id) return;
    setIsScanning(true);
    setTimeout(() => {
      setActiveDemoItem(item);
      setIsScanning(false);
    }, 400);
  };

  // Interactive Calculator State
  const [plasticKg, setPlasticKg] = useState(8);
  const [paperKg, setPaperKg] = useState(12);
  const [metalKg, setMetalKg] = useState(3);
  const [ewasteKg, setEwasteKg] = useState(2);

  const totalPoints = (plasticKg * 15) + (paperKg * 10) + (metalKg * 25) + (ewasteKg * 50);
  const estimatedVoucherRs = totalPoints * 2; // e.g. 1 point = ₹2
  const co2SavedKg = ((plasticKg * 1.8) + (paperKg * 1.1) + (metalKg * 4.2) + (ewasteKg * 6.5)).toFixed(1);

  // FAQ Search & Accordion State
  const [faqSearch, setFaqSearch] = useState('');
  const [faqOpen, setFaqOpen] = useState(null);

  const faqs = [
    { q: 'What items can be recycled on EcoReward?', a: 'We support Plastic, Paper, Metal, Glass, Organic Waste, and E-Waste. Sorted items yield higher point values.' },
    { q: 'How are reward points calculated?', a: 'Rewards are calculated per kilogram: Metal (25 pts/kg), E-waste (50 pts/kg), Plastic (15 pts/kg), Paper (10 pts/kg), Glass (8 pts/kg), and Organic (5 pts/kg).' },
    { q: 'How long does a pickup collection take?', a: 'Once scheduled, a nearby driver is assigned via real-time GPS dispatch. Pickups are completed within your chosen 2-hour time slot.' },
    { q: 'Is there a signup cost for citizens?', a: 'No, EcoReward is 100% free for individual residents. Operations are funded by our B2B circular factory partnerships.' },
    { q: 'How do I redeem my EcoPoints for gift vouchers?', a: 'Navigate to Rewards in your dashboard to instantly redeem points for Amazon, Flipkart, UPI Cash, or PayPal cashback codes.' }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const impactStats = [
    { value: '25.8K+', label: 'Active Eco Citizens', icon: FaRecycle },
    { value: '15.3K+', label: 'Pickups Completed', icon: FaTruck },
    { value: '8.2 Tons', label: 'Waste Recycled', icon: FaChartPie },
    { value: '12.5K+', label: 'Trees Planted', icon: FaTree }
  ];

  const mockupFeatures = [
    {
      icon: FaCalendarPlus,
      title: 'Schedule Pickup',
      desc: 'Book a hassle-free waste pickup at your convenience in 3 simple clicks with real-time slot booking.',
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    {
      icon: FaRobot,
      title: 'AI Waste Scanner',
      desc: 'Scan waste items using neural camera detection for instant classification and purity rating.',
      color: 'bg-teal-500/10 text-teal-500 border-teal-500/20'
    },
    {
      icon: FaAward,
      title: 'Reward System',
      desc: 'Earn EcoPoints for sorted waste and redeem instant gift vouchers or UPI cash.',
      color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    },
    {
      icon: FaRoute,
      title: 'Live Driver Tracking',
      desc: 'Track your assigned collection driver in real-time with Google Maps integration.',
      color: 'bg-sky-500/10 text-sky-500 border-sky-500/20'
    },
    {
      icon: FaLeaf,
      title: 'Community Green',
      desc: 'Participate in local cleanups, earn badges, unlock weekly quests, and climb leaderboards.',
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    },
    {
      icon: FaLightbulb,
      title: 'Daily Eco Tips',
      desc: 'Get smart daily tips on recycling purity, compost management, and zero-waste living.',
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    }
  ];

  const categories = [
    { name: 'Plastic', points: '15 pts/kg', icon: FaRecycle, color: 'from-emerald-500 to-teal-500', desc: 'PET Bottles, Containers, Hard Plastic' },
    { name: 'E-Waste', points: '50 pts/kg', icon: FaDesktop, color: 'from-indigo-500 to-purple-500', desc: 'Laptops, Phones, PCBs, Batteries' },
    { name: 'Metal', points: '25 pts/kg', icon: FaAward, color: 'from-amber-500 to-yellow-500', desc: 'Aluminum Cans, Steel, Copper, Wiring' },
    { name: 'Paper', points: '10 pts/kg', icon: FaBox, color: 'from-cyan-500 to-blue-500', desc: 'Cardboard, Books, Newspapers, Cartons' },
    { name: 'Glass', points: '8 pts/kg', icon: FaWineBottle, color: 'from-teal-500 to-emerald-600', desc: 'Glass Bottles, Jars, Clean Glassware' },
    { name: 'Organic', points: '5 pts/kg', icon: FaLeaf, color: 'from-lime-500 to-emerald-500', desc: 'Food Scraps, Compostable Bio-Waste' }
  ];

  const leaderboardTop3 = [
    { rank: 1, name: 'Ananya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', points: 2850, badge: '🏆 Gold Recycler' },
    { rank: 2, name: 'Vikram Singh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', points: 2140, badge: '🥇 Silver Recycler' },
    { rank: 3, name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', points: 1780, badge: '🥈 Bronze Recycler' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      {/* Hero Section with Glowing Ambient & Dynamic AI Scanner */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30">
        
        {/* Background Decorative Glow Blobs */}
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Hero Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-wide uppercase shadow-sm">
                <FaLeaf className="h-3.5 w-3.5" />
                <span>AI-Powered Smart Waste Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                AI-Powered <br />
                <span className="text-gradient-green-blue">
                  Eco Rewards Platform
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Turn household waste into instant rewards. Scan recyclables with AI camera recognition, schedule doorstep pickups, track drivers live, and redeem vouchers!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link 
                  to="/signup" 
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 hover:scale-105"
                >
                  <span>Get Started Now</span>
                  <FaArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center shadow-sm"
                >
                  <span>Member Login</span>
                </Link>
              </div>

              {/* Floating Quick Trust Badges */}
              <div className="pt-4 flex items-center justify-center lg:justify-start space-x-6 text-xs text-slate-500 dark:text-slate-400 font-bold">
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-emerald-500 h-4 w-4" />
                  <span>100% Free Signup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-emerald-500 h-4 w-4" />
                  <span>Instant Gift Cards</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-emerald-500 h-4 w-4" />
                  <span>Zero Landfill</span>
                </div>
              </div>
            </motion.div>

            {/* Right Interactive AI Waste Scanner Simulator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center relative"
            >
              <div className="relative w-full max-w-[480px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/30 dark:border-slate-800/80 p-6 rounded-3xl shadow-2xl space-y-5">
                
                {/* Header info */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">Interactive Neural AI Scanner</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Live Demo Mode
                  </span>
                </div>

                {/* Simulated Camera Window */}
                <div className="relative h-60 bg-slate-950 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-inner group">
                  
                  {/* Item Image */}
                  <img 
                    src={activeDemoItem.image} 
                    alt={activeDemoItem.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isScanning ? 'opacity-40' : 'opacity-80'}`}
                  />

                  {/* Scanning Animation Laser Line */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                    
                    {/* Top Active Badge */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1.5 bg-black/70 backdrop-blur px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[10px] text-emerald-400 font-mono">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>{isScanning ? 'SCANNING ITEM...' : 'NEURAL RECOGNITION ACTIVE'}</span>
                      </div>
                      <span className="bg-black/60 backdrop-blur text-[10px] text-slate-300 font-bold px-2 py-1 rounded-lg">
                        {activeDemoItem.confidence}% Confidence
                      </span>
                    </div>

                    {/* Bounding Box Box Overlay */}
                    <div className="absolute inset-x-8 top-12 bottom-16 border-2 border-dashed border-emerald-400/80 rounded-xl flex items-center justify-center pointer-events-none">
                      <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-pulse"></div>
                    </div>

                    {/* Bottom Classification Result Badge */}
                    <div className="bg-emerald-500/90 backdrop-blur text-white font-extrabold text-xs px-3.5 py-2 rounded-xl self-start flex items-center space-x-2 shadow-lg">
                      <FaCheckCircle className="h-4 w-4 text-emerald-200" />
                      <span>{activeDemoItem.name} • {activeDemoItem.category}</span>
                    </div>
                  </div>
                </div>

                {/* Sample Selector Tabs */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                    Click an item below to test AI detection:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {sampleItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectDemo(item)}
                        className={`p-2 rounded-xl text-center text-xs font-black border transition-all ${
                          activeDemoItem.id === item.id 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md scale-105' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span className="block truncate">{item.category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculated Points & Impact Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 block uppercase font-black">Est. Points Earned</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">+{activeDemoItem.points} EcoPoints</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 block uppercase font-black">Purity Rating</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{activeDemoItem.recyclable}</span>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Live Impact Counters Bar */}
      <section className="py-10 border-y border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-colors duration-300">
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

      {/* Interactive Eco-Earnings & Carbon Calculator Section */}
      <section id="calculator" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-emerald-500/30 shadow-2xl space-y-10 relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-widest">
              <FaCalculator className="h-3.5 w-3.5" />
              <span>Interactive Reward Calculator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Calculate Your <span className="text-emerald-400">Monthly Eco Earnings</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium">
              Drag the sliders below to estimate your household recycling rewards & CO₂ emissions offset per month!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            
            {/* Sliders Grid */}
            <div className="space-y-6 bg-slate-900/80 p-6 sm:p-8 rounded-2xl border border-slate-800">
              
              {/* Plastic Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="flex items-center space-x-2 text-emerald-400">
                    <FaRecycle />
                    <span>Plastic Waste (PET & Containers)</span>
                  </span>
                  <span>{plasticKg} kg / mo</span>
                </div>
                <input 
                  type="range" min="0" max="30" value={plasticKg} 
                  onChange={(e) => setPlasticKg(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Paper Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="flex items-center space-x-2 text-cyan-400">
                    <FaBox />
                    <span>Paper & Cardboard Boxes</span>
                  </span>
                  <span>{paperKg} kg / mo</span>
                </div>
                <input 
                  type="range" min="0" max="40" value={paperKg} 
                  onChange={(e) => setPaperKg(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Metal Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="flex items-center space-x-2 text-amber-400">
                    <FaAward />
                    <span>Metal Cans & Scrap</span>
                  </span>
                  <span>{metalKg} kg / mo</span>
                </div>
                <input 
                  type="range" min="0" max="20" value={metalKg} 
                  onChange={(e) => setMetalKg(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* E-Waste Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="flex items-center space-x-2 text-indigo-400">
                    <FaDesktop />
                    <span>E-Waste & Batteries</span>
                  </span>
                  <span>{ewasteKg} kg / mo</span>
                </div>
                <input 
                  type="range" min="0" max="10" value={ewasteKg} 
                  onChange={(e) => setEwasteKg(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

            </div>

            {/* Results Display Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 space-y-6 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider block">Total Estimated Points</span>
                  <span className="text-4xl font-black text-white text-gradient-green-blue">{totalPoints} EcoPoints</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[9px] uppercase font-black text-slate-400 block">Voucher Value</span>
                    <span className="text-xl font-black text-amber-400">₹{estimatedVoucherRs} Cashback</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[9px] uppercase font-black text-slate-400 block">CO₂ Offset</span>
                    <span className="text-xl font-black text-emerald-400">{co2SavedKg} kg CO₂</span>
                  </div>
                </div>
              </div>

              <Link 
                to="/signup"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-center shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 transition-all hover:scale-105"
              >
                <span>Start Earning These Rewards</span>
                <FaArrowRight />
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* Waste Categories & Points Rate Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
            Supported Recyclables
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Waste Categories & Reward Rates</h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
            Sorted waste yields higher purity ratings and maximum point multiplication.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx} 
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-4 hover:shadow-xl transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-r ${cat.color} text-white flex items-center justify-center text-xl shadow`}>
                    <Icon />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black border border-emerald-500/20">
                    {cat.points}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{cat.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Platform Video Showcase Section */}
      <section id="video-tour" className="py-20 relative overflow-hidden bg-slate-900 text-white border-y border-slate-800">
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

          {/* Video Showcase Player */}
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

      {/* Smart Features Grid */}
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

      {/* Leaderboard Sneak Peek Section */}
      <section className="py-16 bg-slate-100/60 dark:bg-slate-900/60 border-y border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black uppercase tracking-widest border border-amber-500/20">
              Community Champions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Top City Recyclers</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
              Join thousands of active citizens competing for green badges and rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaderboardTop3.map((user, idx) => (
              <div 
                key={idx} 
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border text-center space-y-4 shadow-sm relative overflow-hidden ${
                  user.rank === 1 ? 'border-amber-400/80 ring-2 ring-amber-400/20' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="relative inline-block">
                  <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-full mx-auto object-cover ring-4 ring-emerald-500/20" />
                  {user.rank === 1 && (
                    <span className="absolute -top-2 -right-2 p-1.5 rounded-full bg-amber-400 text-slate-950 shadow">
                      <FaCrown className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-base">{user.name}</h4>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold block">{user.badge}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-lg font-black text-amber-500">{user.points} EcoPoints</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works 4-Step Process */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Simple 4-Step Process</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
              Turn everyday household waste into gift vouchers and clean energy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: '1', title: 'Book Pickup', desc: 'Schedule a pickup easily from your phone.', icon: FaCalendarPlus },
              { num: '2', title: 'We Collect', desc: 'Our verified partner driver collects waste.', icon: FaTruck },
              { num: '3', title: 'We Recycle', desc: 'Materials are verified & processed cleanly.', icon: FaRecycle },
              { num: '4', title: 'You Earn', desc: 'Claim reward points for a better planet!', icon: FaGift }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
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

      {/* Every Action Counts Banner */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
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

      {/* Interactive FAQ Section with Live Search */}
      <section className="py-16 max-w-4xl mx-auto px-4 w-full">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <div className="relative max-w-md mx-auto">
            <FaSearch className="absolute left-4 top-3.5 text-slate-400 text-xs" />
            <input 
              type="text"
              placeholder="Search questions or keywords..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
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
            ))
          ) : (
            <p className="text-center text-xs text-slate-400 font-bold py-6">No matching questions found.</p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

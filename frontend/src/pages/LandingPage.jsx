import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  FaTrophy, FaStar, FaQuestionCircle, FaEnvelope, FaPhoneAlt, FaSyncAlt,
  FaExpand, FaVolumeOff, FaAtom, FaFingerprint, FaLayerGroup, FaMicrochip, FaShieldAlt, FaUserCheck, FaMedal, FaUserPlus
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const LandingPage = () => {
  // DUAL THEME ENGINE (SYNCHRONIZED WITH NAVBAR SUN/MOON BUTTON)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Mobile vs Desktop Performance Engine
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Web Audio Synthesizer Engine
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const audioCtxRef = useRef(null);

  const playSciFiSound = useCallback((type = 'click') => {
    if (!sfxEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'scan') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.linearRampToValueAtTime(1100, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.06);
        osc.frequency.setValueAtTime(783.99, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      // Fallback
    }
  }, [sfxEnabled]);

  // Video Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.5);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoRef = useRef(null);
  const modalVideoRef = useRef(null);
  const gainNodeRef = useRef(null);
  const videoAudioCtxRef = useRef(null);

  const initAudioBoost = (targetVolume = volume) => {
    playSciFiSound('click');
    if (videoRef.current) {
      videoRef.current.volume = Math.min(targetVolume, 1.0);
      videoRef.current.muted = false;
    }
    if (!videoAudioCtxRef.current && videoRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const gain = ctx.createGain();
        const src = ctx.createMediaElementSource(videoRef.current);
        src.connect(gain);
        gain.connect(ctx.destination);
        videoAudioCtxRef.current = ctx;
        gainNodeRef.current = gain;
      } catch (err) {
        console.log('Web Audio Context note:', err);
      }
    }
    if (videoAudioCtxRef.current && videoAudioCtxRef.current.state === 'suspended') {
      videoAudioCtxRef.current.resume();
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = targetVolume;
    }
  };

  const togglePlay = () => {
    initAudioBoost();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVol) => {
    initAudioBoost();
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = Math.min(newVol, 1.0);
      videoRef.current.muted = newVol === 0;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVol;
    }
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    initAudioBoost();
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted && volume === 0) {
        handleVolumeChange(1.0);
      }
    }
  };

  // Interactive Background Particle Canvas (Desktop Only)
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDesktop) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particleCount = 40;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.4 ? '#10b981' : '#00bba7'
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mousePos.x > 0 && mousePos.y > 0) {
        const grad = ctx.createRadialGradient(mousePos.x, mousePos.y, 0, mousePos.x, mousePos.y, 240);
        grad.addColorStop(0, isDarkMode ? 'rgba(0, 187, 167, 0.12)' : 'rgba(0, 187, 167, 0.08)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 240, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = '#00bba7';
            ctx.globalAlpha = (1 - dist / 100) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos, isDesktop, isDarkMode]);

  const handleMouseMove = (e) => {
    if (isDesktop && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  // AI Scanner Simulator State
  const sampleItems = [
    {
      id: 'plastic',
      name: 'PET Plastic Bottle',
      category: 'Plastic',
      confidence: 98.6,
      weight: '0.35 kg',
      points: 15,
      recyclable: '100% Recyclable',
      image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'ewaste',
      name: 'Circuit Board & Laptop',
      category: 'E-Waste',
      confidence: 99.4,
      weight: '2.10 kg',
      points: 105,
      recyclable: 'High Value Metal Recovery',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'metal',
      name: 'Aluminum Soda Cans',
      category: 'Metal',
      confidence: 97.9,
      weight: '0.45 kg',
      points: 30,
      recyclable: 'Infinite Recyclability',
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'paper',
      name: 'Cardboard Shipping Box',
      category: 'Paper',
      confidence: 96.8,
      weight: '1.20 kg',
      points: 25,
      recyclable: 'Eco Fiber Pulp',
      image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'glass',
      name: 'Glass Beverage Container',
      category: 'Glass',
      confidence: 98.1,
      weight: '0.80 kg',
      points: 18,
      recyclable: 'Pure Silicate Melt',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
    }
  ];

  const [activeDemoItem, setActiveDemoItem] = useState(sampleItems[0]);
  const [isScanning, setIsScanning] = useState(false);

  const handleSelectDemo = (item) => {
    if (item.id === activeDemoItem.id) return;
    playSciFiSound('scan');
    setIsScanning(true);
    setTimeout(() => {
      setActiveDemoItem(item);
      setIsScanning(false);
      playSciFiSound('success');
    }, 300);
  };

  // CINEMATIC PRODUCT SHOWCASE STATE
  const productDevices = [
    {
      id: 'bin',
      title: 'Eco Smart Neural Bin v4.0',
      subtitle: 'Household AI Automatic Classifier Hub',
      desc: 'Dual-camera neural detection, automated lid opening, purity sorting, and instant EcoPoints sync to your mobile wallet.',
      badge: 'PRO USER HARDWARE',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
      specs: [
        { label: 'Neural Camera', val: '4K AI Optical Sensor' },
        { label: 'Sort Speed', val: '0.25 sec/item' },
        { label: 'Connectivity', val: '5G IoT + Bluetooth 5.3' },
        { label: 'Capacity', val: '65 Liters Dual Bay' }
      ]
    },
    {
      id: 'scale',
      title: 'Driver GPS Smart Weight Scale',
      subtitle: 'Doorstep Collection Hardware & Telematics',
      desc: 'Bluetooth-connected digital weight scale with automatic tare calibration, customer QR pass validation, and driver app sync.',
      badge: 'DRIVER FLEET GEAR',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      specs: [
        { label: 'Precision', val: '± 5g Certified Scale' },
        { label: 'Validation', val: 'Instant QR Pass Code' },
        { label: 'Battery Life', val: '48 Hrs Continuous' },
        { label: 'Encrypted Sync', val: 'AES-256 Cloud Stream' }
      ]
    },
    {
      id: 'recycler',
      title: 'Industrial Circular Micro-Factory',
      subtitle: 'B2B High-Purity Material Shredder & Baler',
      desc: 'Factory-grade circular processing unit converting plastic, paper, and metal scrap into 99.8% pure industrial raw pellets.',
      badge: 'ESG ENTERPRISE',
      image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
      specs: [
        { label: 'Processing', val: '2.5 Tons / Hour' },
        { label: 'Purity Level', val: '99.8% Certified ISO' },
        { label: 'Carbon Saved', val: '14.2 Tons CO₂ / day' },
        { label: 'ESG Metrics', val: 'Real-time API Feed' }
      ]
    }
  ];

  const [activeProduct, setActiveProduct] = useState(productDevices[0]);

  // Interactive Before & After Waste Impact Slider State
  const [beforeAfterPos, setBeforeAfterPos] = useState(50);

  // Interactive Calculator State
  const [plasticKg, setPlasticKg] = useState(8);
  const [paperKg, setPaperKg] = useState(12);
  const [metalKg, setMetalKg] = useState(3);
  const [ewasteKg, setEwasteKg] = useState(2);

  const totalPoints = (plasticKg * 15) + (paperKg * 10) + (metalKg * 25) + (ewasteKg * 50);
  const estimatedVoucherRs = totalPoints * 2;
  const co2SavedKg = ((plasticKg * 1.8) + (paperKg * 1.1) + (metalKg * 4.2) + (ewasteKg * 6.5)).toFixed(1);
  const monthlyGoalPercent = Math.min(Math.round((totalPoints / 1200) * 100), 100);

  // 3D Parallax Tilt Handler
  const handleCardMouseMove = (e) => {
    if (!isDesktop) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(1000px) rotateX(${-y / 15}deg) rotateY(${x / 15}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleCardMouseLeave = (e) => {
    if (!isDesktop) return;
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  // FAQ Search & Accordion State
  const [faqSearch, setFaqSearch] = useState('');
  const [faqOpen, setFaqOpen] = useState(null);

  const faqs = [
    { q: 'What items can be recycled on EcoReward?', a: 'We support PET Plastic, Cardboard & Paper, Metal Cans, Glass Bottles, Organic Waste, and E-Waste. Sorted items yield maximum purity points.' },
    { q: 'How are reward points calculated?', a: 'Rewards are calculated per kilogram: E-waste (50 pts/kg), Metal (25 pts/kg), Plastic (15 pts/kg), Paper (10 pts/kg), Glass (8 pts/kg), and Organic (5 pts/kg).' },
    { q: 'How long does a pickup collection take?', a: 'Once scheduled, nearby driver dispatch is assigned automatically via GPS. Pickups arrive within your chosen 2-hour window.' },
    { q: 'Is there a signup cost for citizens?', a: 'No, EcoReward is 100% free for individual residents. Operational funds come from our circular industrial factory partners.' },
    { q: 'How do I redeem my EcoPoints for cashback or vouchers?', a: 'Navigate to Rewards in your dashboard to instantly swap EcoPoints for Amazon, Flipkart, UPI Cash, or PayPal vouchers.' }
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
      title: 'Doorstep Pickup Booking',
      desc: 'Book hassle-free waste collection with 3 simple clicks and real-time slot scheduling.',
    },
    {
      icon: FaRobot,
      title: 'Neural AI Scanner HUD',
      desc: 'Scan recyclables with high-speed neural camera detection for instant purity & point calculation.',
    },
    {
      icon: FaAward,
      title: 'Instant Cash & UPI Rewards',
      desc: 'Earn EcoPoints for sorted waste and instantly cash out to UPI, Amazon, or Eco store vouchers.',
    },
    {
      icon: FaRoute,
      title: 'Live Driver GPS Dispatch',
      desc: 'Track your assigned collector in real-time on interactive vector maps with estimated arrival times.',
    },
    {
      icon: FaLeaf,
      title: 'Citizen Leaderboards',
      desc: 'Compete in neighborhood recycling quests, earn rare eco-badges, and top the citizen leaderboard.',
    },
    {
      icon: FaLightbulb,
      title: 'Smart Carbon Analytics',
      desc: 'Track your personal carbon offset statistics, daily eco tips, and household landfill savings.',
    }
  ];

  // 100% STRICT REAL MONGODB DATABASE LEADERBOARD STATE (ZERO FAKE DATA)
  const { realtimeData } = useSocket() || {};
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');

  const fetchPublicLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const res = await api.get('/auth/leaderboard');
      if (res.data.success && Array.isArray(res.data.data)) {
        setLiveLeaderboard(res.data.data);
      } else {
        setLiveLeaderboard([]);
      }
    } catch (err) {
      setLiveLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicLeaderboard();
  }, []);

  useEffect(() => {
    if (realtimeData?.latestPickup || realtimeData?.lastPointsAwarded) {
      fetchPublicLeaderboard();
    }
  }, [realtimeData?.latestPickup, realtimeData?.lastPointsAwarded]);

  const filteredLeaderboard = liveLeaderboard.filter(user => 
    user.name?.toLowerCase().includes(leaderboardSearch.toLowerCase())
  );

  const displayPodiumUsers = liveLeaderboard.slice(0, 3);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 font-sans selection:bg-emerald-500 selection:text-white ${
      isDarkMode ? 'bg-[#06121e] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      <Navbar />

      {/* Floating Audio SFX Toggle Button */}
      <button
        onClick={() => {
          const next = !sfxEnabled;
          setSfxEnabled(next);
          if (next) playSciFiSound('success');
        }}
        className={`fixed bottom-20 sm:bottom-6 left-6 z-40 px-3.5 py-2 rounded-2xl text-xs font-mono font-bold backdrop-blur-md shadow-2xl flex items-center space-x-2 transition-all ${
          isDarkMode 
            ? 'bg-[#091b2e]/90 border border-emerald-500/30 text-emerald-400 hover:bg-[#0c1f35]' 
            : 'bg-white/90 border border-slate-200 text-emerald-600 hover:bg-slate-50'
        }`}
        title="Toggle Sci-Fi Audio FX Feedback"
      >
        {sfxEnabled ? <FaVolumeUp className="h-4 w-4 text-emerald-500 animate-pulse" /> : <FaVolumeOff className="h-4 w-4 text-slate-400" />}
        <span className="hidden sm:inline">{sfxEnabled ? 'SFX Audio ON' : 'SFX Audio Muted'}</span>
      </button>

      {/* Mobile Fixed Quick-Action CTA Bar */}
      <div className={`fixed bottom-0 inset-x-0 sm:hidden z-40 p-3 flex justify-between gap-3 shadow-2xl border-t ${
        isDarkMode ? 'bg-[#06121e]/95 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        <Link 
          to="/signup"
          onClick={() => playSciFiSound('click')}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center font-black text-xs shadow-lg flex items-center justify-center space-x-2"
        >
          <span>Get Started Free</span>
          <FaArrowRight />
        </Link>
        <Link 
          to="/login"
          className={`px-5 py-3 rounded-xl border text-center font-bold text-xs ${
            isDarkMode ? 'bg-[#091b2e] text-white border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-200'
          }`}
        >
          Login
        </Link>
      </div>

      {/* Fullscreen Video Showcase Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8"
          >
            <div className={`relative w-full max-w-5xl rounded-3xl overflow-hidden border shadow-2xl ${
              isDarkMode ? 'bg-[#06121e] border-emerald-500/40 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <button 
                onClick={() => setShowVideoModal(false)}
                className={`absolute top-4 right-4 z-20 h-10 w-10 rounded-full font-bold flex items-center justify-center transition-all ${
                  isDarkMode ? 'bg-[#091b2e] border border-slate-700 text-white hover:bg-emerald-500 hover:text-slate-950' : 'bg-slate-100 border border-slate-200 text-slate-900 hover:bg-emerald-500 hover:text-white'
                }`}
              >
                ✕
              </button>
              <div className="aspect-video w-full">
                <video 
                  ref={modalVideoRef}
                  src="/videos/eco-waste-management.mp4"
                  autoPlay 
                  controls 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section 
        onMouseMove={handleMouseMove}
        className={`relative pt-6 pb-16 md:pt-16 md:pb-28 overflow-hidden border-b ${
          isDarkMode ? 'bg-[#06121e] border-slate-800/80' : 'bg-white border-slate-200/80'
        }`}
      >
        {/* Particle Canvas Background */}
        {isDesktop && (
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 pointer-events-none z-0"
          />
        )}

        <div className={`absolute top-10 left-10 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`}></div>
        <div className={`absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-teal-500/10' : 'bg-teal-500/5'}`}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left gpu-layer"
            >
              <div className={`inline-flex items-center space-x-2.5 px-4 py-2 rounded-full border text-xs font-mono font-bold uppercase tracking-widest shadow-sm ${
                isDarkMode ? 'bg-[#091b2e] border-emerald-500/30 text-emerald-400' : 'bg-slate-50 border-emerald-500/20 text-emerald-700'
              }`}>
                <img src="/app-logo.png" alt="EcoReward Emblem" className="h-5 w-auto object-contain" />
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>CIRCULAR ECO LOGISTICS v4.0</span>
              </div>

              <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                AI-Powered <br />
                <span className={isDarkMode ? "animate-cyberEmeraldGlint" : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent"}>
                  Zero Waste Platform
                </span>
              </h1>
              
              <p className={`text-sm sm:text-lg max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Transform household recyclables into instant cash & eco vouchers. Scan waste with neural camera recognition, schedule doorstep pickups, track drivers live, and help build a zero-landfill future!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link 
                  to="/signup" 
                  onClick={() => playSciFiSound('click')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-black shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-105 flex items-center justify-center space-x-3 text-base"
                >
                  <span>Get Started Free</span>
                  <FaArrowRight className="h-4 w-4" />
                </Link>

                <button 
                  onClick={() => {
                    playSciFiSound('click');
                    setShowVideoModal(true);
                  }}
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl border font-bold transition-all flex items-center justify-center space-x-2 text-base shadow-sm ${
                    isDarkMode ? 'bg-[#091b2e] text-white border-slate-700 hover:bg-[#0c1f35]' : 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <FaVideo className="text-emerald-500 h-4 w-4" />
                  <span>Watch Trailer</span>
                </button>
              </div>

              <div className={`pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-[#091b2e]/90 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <FaCheckCircle className="text-emerald-500 h-3.5 w-3.5" />
                  <span>100% Free Account</span>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-[#091b2e]/90 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <FaCheckCircle className="text-emerald-500 h-3.5 w-3.5" />
                  <span>Instant UPI Cashback</span>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-[#091b2e]/90 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <FaCheckCircle className="text-emerald-500 h-3.5 w-3.5" />
                  <span>Zero Landfill Mission</span>
                </div>
              </div>
            </motion.div>

            {/* Neural Scanner HUD Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5 flex justify-center relative gpu-layer"
            >
              <div className={`relative w-full max-w-[480px] border p-6 rounded-3xl shadow-2xl space-y-5 ${
                isDarkMode ? 'bg-[#091b2e]/95 border-emerald-500/40' : 'bg-white border-slate-200'
              }`}>
                
                <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="flex items-center space-x-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className={`text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <FaFingerprint className="text-emerald-500" />
                      Neural Scanner HUD
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full border ${
                    isDarkMode ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    Live Demo
                  </span>
                </div>

                <div className="relative h-60 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner group flex items-center justify-center">
                  {imageErrors[activeDemoItem.id] ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <FaRobot className="h-12 w-12 text-emerald-400 animate-bounce" />
                      <span className="text-xs font-mono text-white font-bold">{activeDemoItem.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400">98.6% Neural AI Accuracy</span>
                    </div>
                  ) : (
                    <img 
                      src={activeDemoItem.image} 
                      alt={activeDemoItem.name}
                      onError={() => handleImageError(activeDemoItem.id)}
                      className={`w-full h-full object-cover transition-all duration-300 ${isScanning ? 'opacity-30 blur-sm' : 'opacity-85'}`}
                    />
                  )}

                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 bg-black/80 px-3 py-1 rounded-xl border border-emerald-500/40 text-[10px] text-emerald-400 font-mono">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{isScanning ? 'SCANNING MATRICES...' : 'NEURAL RECOGNITION ACTIVE'}</span>
                      </div>
                      <span className="bg-black/80 text-[10px] text-amber-400 font-mono font-bold px-2.5 py-1 rounded-xl border border-amber-500/30">
                        {activeDemoItem.confidence}% Accuracy
                      </span>
                    </div>

                    <div className="absolute inset-x-6 top-10 bottom-14 border border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center pointer-events-none overflow-hidden">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#34d399] animate-laserSweep"></div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-mono font-bold text-xs px-3.5 py-2 rounded-xl self-start flex items-center space-x-2 shadow-lg">
                      <FaCheckCircle className="h-3.5 w-3.5 text-emerald-200" />
                      <span>{activeDemoItem.name} • {activeDemoItem.category}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className={`text-[10px] uppercase font-mono font-bold tracking-widest block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Click item below to scan:
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {sampleItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectDemo(item)}
                        className={`p-2 rounded-xl text-center text-[10px] font-mono font-bold border transition-all ${
                          activeDemoItem.id === item.id 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-md scale-105 font-black' 
                            : isDarkMode ? 'bg-[#040c14] text-slate-300 border-slate-800 hover:bg-[#0c1f35]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="block truncate">{item.category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#040c14] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Est. Points Earned</span>
                    <span className="text-sm font-black text-emerald-500">+{activeDemoItem.points} EcoPoints</span>
                  </div>
                  <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#040c14] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Purity Rating</span>
                    <span className={`text-xs font-bold truncate block ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{activeDemoItem.recyclable}</span>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* IMPACT COUNTERS BAR */}
      <section className={`py-10 border-b ${
        isDarkMode ? 'bg-[#081728] text-slate-100 border-slate-800/80' : 'bg-[#f8fafc] text-slate-900 border-slate-200/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {impactStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`p-5 rounded-2xl border shadow-md flex items-center space-x-3.5 transition-all ${
                  isDarkMode ? 'bg-[#091b2e] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-emerald-500/50'
                }`}>
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl flex-shrink-0 border border-emerald-500/20">
                    <Icon />
                  </div>
                  <div>
                    <span className={`text-xl sm:text-2xl font-black block tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {stat.value}
                    </span>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CINEMATIC HARDWARE SHOWCASE */}
      <section className={`py-20 border-b ${isDarkMode ? 'bg-[#06121e] border-slate-800' : 'bg-white border-slate-200/80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-widest ${
              isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700'
            }`}>
              <FaMicrochip className="h-4 w-4 text-emerald-500" />
              <span>Cinematic Eco Hardware Showcase</span>
            </div>
            <h2 className={`text-3xl sm:text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              EcoReward <span className={isDarkMode ? "animate-cyberEmeraldGlint" : "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"}>Device Ecosystem</span>
            </h2>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Explore our smart IoT hardware devices connecting citizens, collection drivers, and circular recycling factories.
            </p>
          </div>

          <div className="flex justify-center gap-3 flex-wrap">
            {productDevices.map((dev) => (
              <button
                key={dev.id}
                onClick={() => {
                  playSciFiSound('click');
                  setActiveProduct(dev);
                }}
                className={`px-5 py-3 rounded-2xl font-black text-xs tracking-wide transition-all flex items-center space-x-2 border ${
                  activeProduct.id === dev.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-xl scale-105'
                    : isDarkMode ? 'bg-[#091b2e] text-slate-300 border-slate-700 hover:bg-[#0c1f35]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{dev.title}</span>
              </button>
            ))}
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 sm:p-12 rounded-3xl border shadow-2xl relative overflow-hidden ${
            isDarkMode ? 'bg-[#091b2e] border-emerald-500/40 glow-product-aura' : 'bg-slate-50 border-slate-200'
          }`}>
            
            <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner group flex items-center justify-center">
              {imageErrors[activeProduct.id] ? (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
                    <div className="relative h-28 w-28 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                      <div className="h-20 w-20 rounded-full border border-emerald-500/50 flex items-center justify-center">
                        <img src="/app-logo.png" alt="Hardware Emblem" className="h-12 w-auto object-contain" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-mono font-black text-white uppercase tracking-widest block">{activeProduct.title}</span>
                    <span className="text-[10px] font-mono text-emerald-400 block pt-1">NEURAL TELEMATICS HUD ACTIVE • 99.8% SENSOR PURITY</span>
                  </div>
                </div>
              ) : (
                <img 
                  src={activeProduct.image} 
                  alt={activeProduct.title}
                  onError={() => handleImageError(activeProduct.id)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}

              <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur px-3.5 py-1.5 rounded-xl border border-emerald-500/40 text-xs font-mono text-emerald-400 font-bold z-10">
                {activeProduct.badge}
              </div>
              <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur px-3 py-1 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-300 z-10">
                360° HARDWARE HUD ACTIVE
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest block">{activeProduct.subtitle}</span>
                <h3 className={`text-2xl sm:text-3xl font-black pt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeProduct.title}</h3>
                <p className={`text-xs sm:text-sm font-medium leading-relaxed pt-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{activeProduct.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                {activeProduct.specs.map((sp, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#06121e] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">{sp.label}</span>
                    <span className={`text-xs font-black block pt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{sp.val}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/signup"
                onClick={() => playSciFiSound('click')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-center shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-105 text-sm"
              >
                <span>Connect Your Hardware Free</span>
                <FaArrowRight />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* BEFORE & AFTER & CALCULATOR */}
      <section className={`py-20 border-b ${isDarkMode ? 'bg-[#081728] text-slate-100 border-slate-800' : 'bg-[#f8fafc] text-slate-900 border-slate-200/80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Before & After Visualizer */}
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-widest ${
                isDarkMode ? 'bg-[#091b2e] text-emerald-400 border-emerald-500/30' : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
              }`}>
                Circular Impact Visualizer
              </span>
              <h2 className={`text-3xl sm:text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Before & After Eco Transformation</h2>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Drag the slider to visualize unsorted household waste transformed into pure recycled circular materials.
              </p>
            </div>

            <div className={`relative max-w-4xl mx-auto h-[350px] sm:h-[450px] rounded-3xl overflow-hidden border shadow-2xl select-none ${
              isDarkMode ? 'bg-[#091b2e] border-emerald-500/40' : 'bg-white border-slate-300'
            }`}>
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80" 
                alt="Clean Ecosystem After Recycling"
                onError={() => handleImageError('after_img')}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-slate-950/90 backdrop-blur px-3.5 py-1.5 rounded-xl border border-emerald-500/40 text-xs font-mono text-emerald-400 font-bold z-10">
                AFTER: Clean Recycled Circular Materials
              </div>

              <div 
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-emerald-500 z-10 shadow-2xl"
                style={{ width: `${beforeAfterPos}%` }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&auto=format&fit=crop&q=80" 
                  alt="Raw Unsorted Waste"
                  onError={() => handleImageError('before_img')}
                  className="absolute inset-y-0 left-0 w-full max-w-none h-full object-cover"
                  style={{ width: canvasRef.current ? canvasRef.current.width : '100%' }}
                />
                <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-slate-300 font-bold">
                  BEFORE: Raw Unsorted Waste
                </div>
              </div>

              <input 
                type="range" 
                min="0" 
                max="100" 
                value={beforeAfterPos} 
                onChange={(e) => setBeforeAfterPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shadow-2xl pointer-events-none z-20 border-2 border-white"
                style={{ left: `calc(${beforeAfterPos}% - 20px)` }}
              >
                ↔
              </div>
            </div>
          </div>

          {/* Interactive Calculator */}
          <div id="calculator" className={`rounded-3xl p-6 sm:p-12 border shadow-2xl space-y-10 ${
            isDarkMode ? 'bg-[#091b2e] border-emerald-500/40 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-widest ${
                isDarkMode ? 'bg-[#06121e] text-emerald-400 border-emerald-500/30' : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
              }`}>
                <FaCalculator className="h-3.5 w-3.5 text-emerald-500" />
                <span>Interactive Eco Earnings & Impact Gauge</span>
              </div>
              <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Calculate Your Monthly Rewards
              </h2>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Adjust household waste quantities below to calculate point yield, cash value, and carbon offset!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className={`lg:col-span-7 space-y-6 p-6 sm:p-8 rounded-3xl border ${isDarkMode ? 'bg-[#06121e] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center space-x-2 text-emerald-500">
                      <FaRecycle />
                      <span>PET Plastic Waste</span>
                    </span>
                    <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{plasticKg} kg / month</span>
                  </div>
                  <input 
                    type="range" min="0" max="30" value={plasticKg} 
                    onChange={(e) => {
                      setPlasticKg(Number(e.target.value));
                      playSciFiSound('click');
                    }}
                    className={`w-full accent-emerald-500 cursor-pointer h-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center space-x-2 text-teal-500">
                      <FaBox />
                      <span>Paper & Cardboard Boxes</span>
                    </span>
                    <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{paperKg} kg / month</span>
                  </div>
                  <input 
                    type="range" min="0" max="40" value={paperKg} 
                    onChange={(e) => {
                      setPaperKg(Number(e.target.value));
                      playSciFiSound('click');
                    }}
                    className={`w-full accent-teal-500 cursor-pointer h-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center space-x-2 text-amber-500">
                      <FaAward />
                      <span>Metal Cans & Scrap</span>
                    </span>
                    <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{metalKg} kg / month</span>
                  </div>
                  <input 
                    type="range" min="0" max="20" value={metalKg} 
                    onChange={(e) => {
                      setMetalKg(Number(e.target.value));
                      playSciFiSound('click');
                    }}
                    className={`w-full accent-amber-500 cursor-pointer h-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center space-x-2 text-indigo-500">
                      <FaDesktop />
                      <span>E-Waste & Electronics</span>
                    </span>
                    <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{ewasteKg} kg / month</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" value={ewasteKg} 
                    onChange={(e) => {
                      setEwasteKg(Number(e.target.value));
                      playSciFiSound('click');
                    }}
                    className={`w-full accent-indigo-500 cursor-pointer h-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}
                  />
                </div>
              </div>

              <div className={`lg:col-span-5 p-6 sm:p-8 rounded-3xl border space-y-6 flex flex-col items-center justify-between shadow-2xl ${
                isDarkMode ? 'bg-[#06121e] border-emerald-500/40' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="7" className={isDarkMode ? "text-slate-800 fill-none" : "text-slate-200 fill-none"} />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="7" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * monthlyGoalPercent) / 100} strokeLinecap="round" className="text-emerald-500 fill-none transition-all duration-500 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{monthlyGoalPercent}%</span>
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Target Goal</span>
                  </div>
                </div>

                <div className="w-full space-y-3 text-center">
                  <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-[#091b2e] border-emerald-500/30' : 'bg-white border-emerald-500/20 shadow-sm'}`}>
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-500 block">Est. Monthly Yield</span>
                    <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalPoints} EcoPoints</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#091b2e] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Cash Cashback</span>
                      <span className="text-base font-black text-amber-500">₹{estimatedVoucherRs}</span>
                    </div>
                    <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#091b2e] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">CO₂ Saved</span>
                      <span className="text-base font-black text-emerald-500">{co2SavedKg} kg</span>
                    </div>
                  </div>
                </div>

                <Link 
                  to="/signup"
                  onClick={() => playSciFiSound('click')}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-center shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-105 text-sm"
                >
                  <span>Start Earning Rewards</span>
                  <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SMART INFRASTRUCTURE FEATURES */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-widest ${
            isDarkMode ? 'bg-[#091b2e] text-emerald-400 border-emerald-500/30' : 'bg-slate-100 text-emerald-700 border-slate-200'
          }`}>
            Platform Capabilities
          </span>
          <h2 className={`text-3xl sm:text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Smart Eco Infrastructure</h2>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Cyber ecosystem designed for speed, security, and circular waste recycling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-container">
          {mockupFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx} 
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className={`tilt-card p-7 rounded-3xl border transition-all duration-150 shadow-xl space-y-4 group cursor-pointer gpu-layer ${
                  isDarkMode ? 'bg-[#091b2e] border-slate-800 hover:border-emerald-500/60' : 'bg-white border-slate-200 hover:border-emerald-500/60 shadow-lg'
                }`}
              >
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl border border-emerald-500/20">
                  <Icon />
                </div>
                <h3 className={`text-lg font-black group-hover:text-emerald-500 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{feat.title}</h3>
                <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CINEMATIC VIDEO SHOWCASE */}
      <section id="video-tour" className={`py-20 relative overflow-hidden border-y ${
        isDarkMode ? 'bg-[#040c14] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-widest ${
              isDarkMode ? 'bg-[#091b2e] border-emerald-500/30 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-700'
            }`}>
              <FaVideo className="h-3.5 w-3.5 text-emerald-500" />
              <span>Cinematic Platform Showcase</span>
            </div>
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Experience the Future of <span className={isDarkMode ? "animate-cyberEmeraldGlint" : "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"}>Waste Logistics</span>
            </h2>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Watch how neural AI recognition, driver dispatch, and instant rewards work seamlessly.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <div className="relative aspect-video w-full overflow-hidden group">
              <video 
                ref={videoRef}
                src="/videos/eco-waste-management.mp4" 
                autoPlay 
                loop 
                muted={isMuted} 
                playsInline
                preload="auto"
                className="w-full h-full object-cover rounded-3xl"
              />

              <div className="absolute bottom-0 inset-x-0 p-4 bg-slate-950/90 flex items-center justify-between gap-3 opacity-95 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={togglePlay}
                    className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-md flex-shrink-0"
                    title={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? <FaPause className="h-4 w-4" /> : <FaPlay className="h-4 w-4 ml-0.5" />}
                  </button>

                  <button 
                    onClick={toggleMute}
                    className="p-3 rounded-full bg-slate-800 text-white border border-slate-700 flex-shrink-0"
                    title={isMuted ? "Unmute Sound" : "Mute Sound"}
                  >
                    {isMuted || volume === 0 ? <FaVolumeMute className="h-4 w-4 text-amber-400" /> : <FaVolumeUp className="h-4 w-4 text-emerald-400" />}
                  </button>

                  <div className="flex items-center space-x-2 bg-slate-900 px-3 py-2 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-mono font-bold text-slate-300">
                      {isMuted || volume === 0 ? '0%' : `${Math.round(volume * 100)}%`}
                    </span>
                    <input 
                      type="range"
                      min="0"
                      max="2.0"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-20 sm:w-28 h-1.5 accent-emerald-400 cursor-pointer bg-slate-700 rounded-lg"
                    />
                  </div>

                  <button
                    onClick={() => handleVolumeChange(volume >= 1.5 ? 1.0 : 2.0)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                      volume > 1.0 
                        ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-white border-amber-400' 
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {volume > 1.0 ? '🔥 200% Boosted' : '🔊 Boost Sound'}
                  </button>
                </div>

                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 transition-all flex items-center space-x-2"
                >
                  <FaExpand />
                  <span>Fullscreen</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4-STEP PROCESS & 100% REAL MONGODB LEADERBOARD HUB */}
      <section className={`py-20 border-b ${isDarkMode ? 'bg-[#081728] text-slate-100 border-slate-800' : 'bg-[#f8fafc] text-slate-900 border-slate-200/80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* 4-Step Process */}
          <div id="how-it-works" className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-widest ${
                isDarkMode ? 'bg-[#091b2e] text-emerald-400 border-emerald-500/30' : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
              }`}>
                User Journey
              </span>
              <h2 className={`text-3xl sm:text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Simple 4-Step Process</h2>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                From waste sorting to instant bank cashback in under 3 minutes.
              </p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
              {isDesktop && (
                <div className={`absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div className="w-16 h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] rounded-full animate-beamMove"></div>
                </div>
              )}

              {[
                { num: '1', title: 'Schedule Pickup', desc: 'Select date & waste items on mobile or PC desktop.', icon: FaCalendarPlus },
                { num: '2', title: 'Driver Collects', desc: 'Verified driver arrives at your doorstep.', icon: FaTruck },
                { num: '3', title: 'AI Verification', desc: 'Weight & purity verified instantly.', icon: FaRecycle },
                { num: '4', title: 'Instant Cash', desc: 'Claim EcoPoints or withdraw to UPI!', icon: FaGift }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className={`relative z-10 p-7 rounded-3xl border text-center space-y-4 shadow-xl hover:border-emerald-500/50 transition-all gpu-layer ${
                    isDarkMode ? 'bg-[#091b2e] border-slate-800' : 'bg-white border-slate-200/80'
                  }`}>
                    <div className="h-11 w-11 mx-auto rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow-md">
                      {step.num}
                    </div>
                    <div className="h-12 w-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl border border-emerald-500/20">
                      <Icon />
                    </div>
                    <h4 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{step.title}</h4>
                    <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 100% REAL MONGODB DATABASE LEADERBOARD HUB */}
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-widest ${
                isDarkMode ? 'bg-[#091b2e] text-emerald-400 border-emerald-500/30' : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
              }`}>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Real MongoDB Database Sync</span>
              </div>
              <h2 className={`text-3xl sm:text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Real Citizen Leaderboard</h2>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Live citizen rankings fetched directly from your MongoDB database with zero fake mock entries.
              </p>
            </div>

            {liveLeaderboard.length > 0 ? (
              <>
                {/* Top 3 Real Champions Podium */}
                {displayPodiumUsers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* Rank 2 Real User */}
                    {displayPodiumUsers[1] && (
                      <div className={`p-6 rounded-3xl border text-center space-y-4 order-2 md:order-1 shadow-lg ${
                        isDarkMode ? 'bg-[#091b2e] border-slate-800' : 'bg-white border-slate-200/80'
                      }`}>
                        <img 
                          src={getAvatarUrl(displayPodiumUsers[1].avatar || displayPodiumUsers[1].profileImage, displayPodiumUsers[1].name)} 
                          onError={(e) => handleAvatarError(e, displayPodiumUsers[1].name)}
                          alt="Rank 2" 
                          className="h-20 w-20 rounded-full mx-auto object-cover ring-4 ring-slate-400" 
                        />
                        <div>
                          <span className="text-xs font-mono font-bold text-slate-400">#2 SILVER RECYCLER</span>
                          <h4 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{displayPodiumUsers[1].name}</h4>
                        </div>
                        <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#06121e] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="text-lg font-black text-emerald-500 block">{displayPodiumUsers[1].points} EcoPoints</span>
                          <span className="text-[10px] font-mono text-slate-500 block">{displayPodiumUsers[1].recycledKg || (displayPodiumUsers[1].points * 0.15).toFixed(1)} kg Recycled</span>
                        </div>
                      </div>
                    )}

                    {/* Rank 1 Real User (Center Elevated) */}
                    {displayPodiumUsers[0] && (
                      <div className={`p-8 rounded-3xl border-2 border-amber-400 text-center space-y-4 order-1 md:order-2 shadow-2xl relative -translate-y-3 ${
                        isDarkMode ? 'bg-[#091b2e]' : 'bg-white'
                      }`}>
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow">
                          <FaCrown /> GOLD #1 CHAMPION
                        </span>
                        <img 
                          src={getAvatarUrl(displayPodiumUsers[0].avatar || displayPodiumUsers[0].profileImage, displayPodiumUsers[0].name)} 
                          onError={(e) => handleAvatarError(e, displayPodiumUsers[0].name)}
                          alt="Rank 1" 
                          className="h-24 w-24 rounded-full mx-auto object-cover ring-4 ring-amber-400 shadow-xl" 
                        />
                        <div>
                          <h4 className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{displayPodiumUsers[0].name}</h4>
                          <span className="text-xs font-bold text-amber-500 block">{displayPodiumUsers[0].badge || '🏆 Gold Recycler'}</span>
                        </div>
                        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30">
                          <span className="text-2xl font-black text-amber-500 block">{displayPodiumUsers[0].points} EcoPoints</span>
                          <span className="text-xs font-mono font-bold text-slate-500 block pt-0.5">{displayPodiumUsers[0].recycledKg || (displayPodiumUsers[0].points * 0.15).toFixed(1)} kg Recycled</span>
                        </div>
                      </div>
                    )}

                    {/* Rank 3 Real User */}
                    {displayPodiumUsers[2] && (
                      <div className={`p-6 rounded-3xl border text-center space-y-4 order-3 md:order-3 shadow-lg ${
                        isDarkMode ? 'bg-[#091b2e] border-slate-800' : 'bg-white border-slate-200/80'
                      }`}>
                        <img 
                          src={getAvatarUrl(displayPodiumUsers[2].avatar || displayPodiumUsers[2].profileImage, displayPodiumUsers[2].name)} 
                          onError={(e) => handleAvatarError(e, displayPodiumUsers[2].name)}
                          alt="Rank 3" 
                          className="h-20 w-20 rounded-full mx-auto object-cover ring-4 ring-amber-700/40" 
                        />
                        <div>
                          <span className="text-xs font-mono font-bold text-slate-400">#3 BRONZE RECYCLER</span>
                          <h4 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{displayPodiumUsers[2].name}</h4>
                        </div>
                        <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#06121e] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="text-lg font-black text-emerald-500 block">{displayPodiumUsers[2].points} EcoPoints</span>
                          <span className="text-[10px] font-mono text-slate-500 block">{displayPodiumUsers[2].recycledKg || (displayPodiumUsers[2].points * 0.15).toFixed(1)} kg Recycled</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* REAL MONGODB TOP 10 RANKINGS TABLE */}
                <div className={`max-w-4xl mx-auto rounded-3xl border shadow-xl overflow-hidden ${
                  isDarkMode ? 'bg-[#091b2e] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className={`p-5 border-b flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    isDarkMode ? 'bg-[#06121e] border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <FaMedal className="text-amber-500 h-5 w-5" />
                      <h3 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Real Registered Citizens ({liveLeaderboard.length})</h3>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                      <input 
                        type="text" 
                        placeholder="Search recycler name..."
                        value={leaderboardSearch}
                        onChange={(e) => setLeaderboardSearch(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border ${
                          isDarkMode ? 'bg-[#091b2e] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`divide-y overflow-x-auto ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                    {filteredLeaderboard.length > 0 ? (
                      filteredLeaderboard.map((user, idx) => (
                        <div 
                          key={user._id || idx}
                          className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors ${
                            isDarkMode ? 'hover:bg-[#0c1f35]' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <span className={`w-7 text-center font-mono font-black text-sm ${
                              user.rank === 1 ? 'text-amber-500 text-base' : user.rank === 2 ? 'text-slate-400' : user.rank === 3 ? 'text-amber-700' : 'text-slate-400'
                            }`}>
                              #{user.rank}
                            </span>
                            
                            <img 
                              src={getAvatarUrl(user.avatar || user.profileImage, user.name)}
                              onError={(e) => handleAvatarError(e, user.name)}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                            />

                            <div>
                              <h4 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</h4>
                              <span className="text-[10px] font-mono font-bold text-emerald-500">{user.badge || user.tier || '🌱 Green Scout'}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`font-black text-sm block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.points} EcoPoints</span>
                            <span className="text-[10px] font-mono text-slate-400 block">{user.recycledKg || (user.points * 0.15).toFixed(1)} kg waste saved</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-6 text-center text-xs text-slate-400 font-bold">No matching recyclers found in database.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* CLEAN ZERO-FAKE EMPTY STATE CARD */
              <div className={`max-w-xl mx-auto p-8 rounded-3xl border text-center space-y-4 shadow-xl ${
                isDarkMode ? 'bg-[#091b2e] border-emerald-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl border border-emerald-500/20 animate-pulse">
                  <FaCrown />
                </div>
                <h3 className="text-2xl font-black">No Database Recyclers Registered Yet</h3>
                <p className={`text-xs font-medium max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Be the first citizen in our MongoDB database to register, recycle household waste, and claim the #1 spot on the leaderboard!
                </p>
                <Link 
                  to="/signup"
                  onClick={() => playSciFiSound('click')}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
                >
                  <FaUserPlus />
                  <span>Register Free Account & Top Leaderboard</span>
                </Link>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* FAQ & CTA BANNER & FOOTER */}
      <section className="py-20 max-w-4xl mx-auto px-4 w-full">
        <div className="text-center space-y-4 mb-10">
          <h2 className={`text-3xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Frequently Asked Questions</h2>
          <div className="relative max-w-md mx-auto">
            <FaSearch className="absolute left-4 top-3.5 text-slate-400 text-xs" />
            <input 
              type="text"
              placeholder="Search questions..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border ${
                isDarkMode ? 'bg-[#091b2e] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div key={index} className={`border rounded-2xl overflow-hidden shadow-sm ${
                isDarkMode ? 'bg-[#091b2e] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <button
                  onClick={() => {
                    setFaqOpen(faqOpen === index ? null : index);
                    playSciFiSound('click');
                  }}
                  className={`w-full p-5 text-left flex justify-between items-center font-bold text-sm transition-colors ${
                    isDarkMode ? 'text-white hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-600'
                  }`}
                >
                  <span>{faq.q}</span>
                  {faqOpen === index ? <FaChevronUp className="text-emerald-500" /> : <FaChevronDown className="text-slate-400" />}
                </button>
                {faqOpen === index && (
                  <div className={`px-5 pb-5 text-xs leading-relaxed font-medium ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
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

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-12 sm:mb-0">
        <div className="relative rounded-3xl p-10 sm:p-14 overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left z-10">
            <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-mono font-bold uppercase tracking-widest backdrop-blur">
              Join 25,800+ Eco Citizens ♻️
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Recycle Today, Reward Tomorrow.</h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl font-medium">
              Start earning points and cash rewards while building a zero-landfill future.
            </p>
          </div>
          <Link 
            to="/signup" 
            onClick={() => playSciFiSound('click')}
            className="z-10 px-8 py-4 bg-white text-emerald-950 font-black text-sm rounded-2xl hover:bg-emerald-50 transition-all shadow-2xl hover:scale-105 flex items-center space-x-2 flex-shrink-0"
          >
            <span>Create Free Account</span>
            <FaArrowRight />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

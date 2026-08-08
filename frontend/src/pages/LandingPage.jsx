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
  FaExpand, FaCompress, FaVolumeDown, FaAtom, FaFingerprint, FaMagic, FaVolumeOff
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const LandingPage = () => {
  // Sound FX State & Web Audio Synthesizer Engine
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
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'scan') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio fallback silent
    }
  }, [sfxEnabled]);

  // Video Player & Sound Boost State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.5); // Default to 150% High Sound Boost
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

  // Interactive Particle Canvas Background Hook
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
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

    // Particle nodes
    const particleCount = Math.min(Math.floor(window.innerWidth / 20), 60);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.4 ? '#10b981' : '#06b6d4'
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle mouse spotlight
      if (mousePos.x > 0 && mousePos.y > 0) {
        const grad = ctx.createRadialGradient(mousePos.x, mousePos.y, 0, mousePos.x, mousePos.y, 250);
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 250, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw particle nodes & connecting vector lines
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

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = '#10b981';
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
  }, [mousePos]);

  const handleMouseMove = (e) => {
    if (canvasRef.current) {
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
      badgeColor: 'bg-emerald-500'
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
      badgeColor: 'bg-indigo-500'
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
      badgeColor: 'bg-amber-500'
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
      badgeColor: 'bg-cyan-500'
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
      badgeColor: 'bg-teal-500'
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
    }, 350);
  };

  // Interactive Calculator State
  const [plasticKg, setPlasticKg] = useState(8);
  const [paperKg, setPaperKg] = useState(12);
  const [metalKg, setMetalKg] = useState(3);
  const [ewasteKg, setEwasteKg] = useState(2);

  const totalPoints = (plasticKg * 15) + (paperKg * 10) + (metalKg * 25) + (ewasteKg * 50);
  const estimatedVoucherRs = totalPoints * 2;
  const co2SavedKg = ((plasticKg * 1.8) + (paperKg * 1.1) + (metalKg * 4.2) + (ewasteKg * 6.5)).toFixed(1);
  const monthlyGoalPercent = Math.min(Math.round((totalPoints / 1200) * 100), 100);

  // 3D Parallax Mouse Tilt Handler for Feature Cards
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(1000px) rotateX(${-y / 15}deg) rotateY(${x / 15}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleCardMouseLeave = (e) => {
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
      title: 'Schedule Doorstep Pickup',
      desc: 'Book hassle-free waste collection with 3 simple clicks and real-time slot scheduling.',
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    {
      icon: FaRobot,
      title: 'AI Neural Scanner HUD',
      desc: 'Scan recyclables with high-speed neural camera detection for instant purity & point calculation.',
      color: 'bg-teal-500/10 text-teal-500 border-teal-500/20'
    },
    {
      icon: FaAward,
      title: 'Instant Rewards & UPI',
      desc: 'Earn EcoPoints for sorted waste and instantly cash out to UPI, Amazon, or Eco store vouchers.',
      color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    },
    {
      icon: FaRoute,
      title: 'Live Driver GPS Tracking',
      desc: 'Track your assigned collector in real-time on interactive vector maps with estimated arrival times.',
      color: 'bg-sky-500/10 text-sky-500 border-sky-500/20'
    },
    {
      icon: FaLeaf,
      title: 'Community Leaderboards',
      desc: 'Compete in neighborhood recycling quests, earn rare eco-badges, and top the citizen leaderboard.',
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    },
    {
      icon: FaLightbulb,
      title: 'Smart Waste Analytics',
      desc: 'Track your personal carbon offset statistics, daily eco tips, and household landfill savings.',
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

  // Socket & Live Leaderboard State
  const { realtimeData } = useSocket() || {};
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);

  const fetchPublicLeaderboard = async () => {
    try {
      const res = await api.get('/auth/leaderboard');
      if (res.data.success && res.data.data.length > 0) {
        setLiveLeaderboard(res.data.data);
      } else {
        setLiveLeaderboard([
          { rank: 1, name: 'Ananya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', points: 2850, badge: '🏆 Gold Recycler' },
          { rank: 2, name: 'Vikram Singh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', points: 2140, badge: '🥇 Silver Recycler' },
          { rank: 3, name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', points: 1780, badge: '🥈 Bronze Recycler' }
        ]);
      }
    } catch (err) {
      setLiveLeaderboard([
        { rank: 1, name: 'Ananya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', points: 2850, badge: '🏆 Gold Recycler' },
        { rank: 2, name: 'Vikram Singh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', points: 2140, badge: '🥇 Silver Recycler' },
        { rank: 3, name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', points: 1780, badge: '🥈 Bronze Recycler' }
      ]);
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

  const displayLeaderboard = liveLeaderboard.length >= 3 ? liveLeaderboard.slice(0, 3) : [
    { rank: 1, name: 'Ananya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', points: 2850, badge: '🏆 Gold Recycler' },
    { rank: 2, name: 'Vikram Singh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', points: 2140, badge: '🥇 Silver Recycler' },
    { rank: 3, name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', points: 1780, badge: '🥈 Bronze Recycler' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors duration-300 font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />

      {/* Dynamic Sound FX Floating Control Button */}
      <button
        onClick={() => {
          const next = !sfxEnabled;
          setSfxEnabled(next);
          if (next) playSciFiSound('success');
        }}
        className="fixed bottom-6 left-6 z-40 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-black backdrop-blur-md shadow-2xl flex items-center space-x-2 hover:bg-slate-800 transition-all hover:scale-105"
        title="Toggle Sci-Fi Audio FX Feedback"
      >
        {sfxEnabled ? <FaVolumeUp className="h-4 w-4 text-emerald-400 animate-pulse" /> : <FaVolumeOff className="h-4 w-4 text-slate-500" />}
        <span className="hidden sm:inline">{sfxEnabled ? 'SFX Audio ON' : 'SFX Audio Muted'}</span>
      </button>

      {/* Fullscreen Video Modal Showcase */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8"
          >
            <div className="relative w-full max-w-5xl bg-slate-950 rounded-3xl overflow-hidden border border-emerald-500/50 shadow-2xl">
              <button 
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-slate-900/80 border border-slate-700 text-white font-bold flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 transition-all"
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

      {/* HERO SECTION with Canvas Background & Neural Scanner HUD */}
      <section 
        onMouseMove={handleMouseMove}
        className="relative pt-8 pb-20 md:pt-16 md:pb-32 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80"
      >
        {/* Interactive Particle Node Canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 pointer-events-none z-0"
        />

        {/* Ambient Glow Orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Main Text & CTAs (7 columns on desktop) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-7 text-center lg:text-left"
            >
              {/* Futuristic Cyber Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase shadow-lg shadow-emerald-500/5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <FaAtom className="h-4 w-4 text-emerald-400" />
                <span>AI-POWERED CIRCULAR PLANET PLATFORM v3.5</span>
              </div>

              {/* Main Headline with Neon Glint */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
                AI-Driven <br />
                <span className="animate-neonGlint">
                  Eco Rewards Platform
                </span>
              </h1>
              
              <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Transform household recyclables into instant cash & eco vouchers. Scan waste with neural camera recognition, schedule doorstep pickups, track drivers live, and help build a zero-landfill future!
              </p>

              {/* CTA Buttons Grid */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link 
                  to="/signup" 
                  onClick={() => playSciFiSound('click')}
                  className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-105 flex items-center justify-center space-x-3 text-base"
                >
                  <span>Get Started Free</span>
                  <FaArrowRight className="h-4 w-4" />
                </Link>

                <button 
                  onClick={() => {
                    playSciFiSound('click');
                    setShowVideoModal(true);
                  }}
                  className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-slate-900/90 text-white border border-slate-700 font-extrabold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 text-base shadow-sm backdrop-blur hover:border-emerald-500/50"
                >
                  <FaVideo className="text-emerald-400 h-4 w-4" />
                  <span>Watch Cinematic Trailer</span>
                </button>
              </div>

              {/* Floating Quick Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-bold">
                <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
                  <FaCheckCircle className="text-emerald-400 h-4 w-4" />
                  <span>100% Free Signup</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
                  <FaCheckCircle className="text-emerald-400 h-4 w-4" />
                  <span>Instant Gift Cards & UPI</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
                  <FaCheckCircle className="text-emerald-400 h-4 w-4" />
                  <span>Zero Landfill Mission</span>
                </div>
              </div>
            </motion.div>

            {/* Right Interactive AI Waste Scanner HUD (5 columns on desktop) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 flex justify-center relative"
            >
              <div className="relative w-full max-w-[480px] bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/40 p-6 rounded-3xl shadow-2xl shadow-emerald-950/80 space-y-5">
                
                {/* HUD Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-black tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
                      <FaFingerprint className="text-emerald-400" />
                      Neural AI Scanner HUD
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Live Demo
                  </span>
                </div>

                {/* Simulated Camera Scanner Window */}
                <div className="relative h-64 bg-slate-950 rounded-2xl overflow-hidden border border-emerald-500/50 shadow-inner group">
                  
                  {/* Active Item Preview Image */}
                  <img 
                    src={activeDemoItem.image} 
                    alt={activeDemoItem.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${isScanning ? 'opacity-30 blur-sm scale-105' : 'opacity-85 scale-100'}`}
                  />

                  {/* Scanning Animation Laser Line */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
                    
                    {/* Top Status HUD Badge */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 text-[10px] text-emerald-400 font-mono">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{isScanning ? 'SCANNING MATRICES...' : 'NEURAL RECOGNITION ACTIVE'}</span>
                      </div>
                      <span className="bg-black/80 backdrop-blur-md text-[10px] text-amber-400 font-mono font-bold px-2.5 py-1 rounded-xl border border-amber-500/30">
                        {activeDemoItem.confidence}% Accuracy
                      </span>
                    </div>

                    {/* Laser Sweeping Beam */}
                    <div className="absolute inset-x-6 top-10 bottom-14 border-2 border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center pointer-events-none overflow-hidden">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#34d399] animate-laserSweep"></div>
                    </div>

                    {/* Bottom Result Badge */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 backdrop-blur-md text-white font-black text-xs px-4 py-2.5 rounded-2xl self-start flex items-center space-x-2 shadow-lg border border-emerald-400/30">
                      <FaCheckCircle className="h-4 w-4 text-emerald-200" />
                      <span>{activeDemoItem.name} • {activeDemoItem.category}</span>
                    </div>
                  </div>
                </div>

                {/* Sample Selector Buttons */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-black tracking-widest text-slate-400 block">
                    Click item below to scan:
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {sampleItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectDemo(item)}
                        className={`p-2 rounded-xl text-center text-[10px] font-black border transition-all ${
                          activeDemoItem.id === item.id 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 scale-105' 
                            : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="block truncate">{item.category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculated Points & Purity Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Est. Points Earned</span>
                    <span className="text-sm font-black text-emerald-400">+{activeDemoItem.points} EcoPoints</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Purity Rating</span>
                    <span className="text-xs font-black text-slate-100 truncate block">{activeDemoItem.recyclable}</span>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Live Impact Counters Bar */}
      <section className="py-10 border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center space-x-4 hover:border-emerald-500/40 transition-colors">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl flex-shrink-0 border border-emerald-500/30 shadow-inner">
                    <Icon />
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-white block tracking-tight">
                      {stat.value}
                    </span>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Eco-Earnings & SVG Target Progress Calculator */}
      <section id="calculator" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-emerald-500/40 shadow-2xl space-y-12 relative overflow-hidden">
          
          {/* Background Decorative Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-widest">
              <FaCalculator className="h-3.5 w-3.5" />
              <span>Interactive Eco Earnings & Impact Gauge</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Calculate Your <span className="text-emerald-400">Monthly Rewards</span>
            </h2>
            <p className="text-slate-300 text-sm font-medium">
              Adjust household waste quantities below to instantly calculate point yield, cash value, and carbon offset!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Sliders Grid (7 columns on desktop) */}
            <div className="lg:col-span-7 space-y-6 bg-slate-950/80 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-inner">
              
              {/* Plastic Slider */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="flex items-center space-x-2 text-emerald-400">
                    <FaRecycle />
                    <span>PET Plastic Waste</span>
                  </span>
                  <span className="font-mono text-white text-sm">{plasticKg} kg / month</span>
                </div>
                <input 
                  type="range" min="0" max="30" value={plasticKg} 
                  onChange={(e) => {
                    setPlasticKg(Number(e.target.value));
                    playSciFiSound('click');
                  }}
                  className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Paper Slider */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="flex items-center space-x-2 text-cyan-400">
                    <FaBox />
                    <span>Paper & Cardboard Boxes</span>
                  </span>
                  <span className="font-mono text-white text-sm">{paperKg} kg / month</span>
                </div>
                <input 
                  type="range" min="0" max="40" value={paperKg} 
                  onChange={(e) => {
                    setPaperKg(Number(e.target.value));
                    playSciFiSound('click');
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Metal Slider */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="flex items-center space-x-2 text-amber-400">
                    <FaAward />
                    <span>Metal Cans & Scrap</span>
                  </span>
                  <span className="font-mono text-white text-sm">{metalKg} kg / month</span>
                </div>
                <input 
                  type="range" min="0" max="20" value={metalKg} 
                  onChange={(e) => {
                    setMetalKg(Number(e.target.value));
                    playSciFiSound('click');
                  }}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* E-Waste Slider */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="flex items-center space-x-2 text-indigo-400">
                    <FaDesktop />
                    <span>E-Waste & Electronics</span>
                  </span>
                  <span className="font-mono text-white text-sm">{ewasteKg} kg / month</span>
                </div>
                <input 
                  type="range" min="0" max="10" value={ewasteKg} 
                  onChange={(e) => {
                    setEwasteKg(Number(e.target.value));
                    playSciFiSound('click');
                  }}
                  className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

            </div>

            {/* Target Radial SVG Progress & Yield Summary Card (5 columns on desktop) */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-6 flex flex-col items-center justify-between shadow-2xl">
              
              {/* Radial SVG Gauge Meter */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="currentColor" strokeWidth="8" 
                    className="text-slate-800 fill-none" 
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="currentColor" strokeWidth="8" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * monthlyGoalPercent) / 100}
                    strokeLinecap="round"
                    className="text-emerald-400 fill-none transition-all duration-700 ease-out" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-white">{monthlyGoalPercent}%</span>
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Goal Target</span>
                </div>
              </div>

              <div className="w-full space-y-4 text-center">
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30">
                  <span className="text-[10px] uppercase font-mono font-black text-emerald-400 tracking-wider block">Estimated Monthly Yield</span>
                  <span className="text-3xl font-black text-white">{totalPoints} EcoPoints</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[9px] uppercase font-black text-slate-400 block">Voucher Cash</span>
                    <span className="text-lg font-black text-amber-400">₹{estimatedVoucherRs}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[9px] uppercase font-black text-slate-400 block">CO₂ Saved</span>
                    <span className="text-lg font-black text-emerald-400">{co2SavedKg} kg</span>
                  </div>
                </div>
              </div>

              <Link 
                to="/signup"
                onClick={() => playSciFiSound('click')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-center shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-105 text-sm"
              >
                <span>Start Earning Rewards Now</span>
                <FaArrowRight />
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* 3D PARALLAX FEATURE CARDS GRID (Desktop Hover Tilt) */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">Smart Eco Infrastructure</h2>
          <p className="text-slate-400 text-sm font-medium">
            Hover over the 3D cards below to explore our core smart recycling capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-container">
          {mockupFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx} 
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="tilt-card p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all duration-200 shadow-xl space-y-4 group cursor-pointer"
              >
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl border ${feat.color}`}>
                  <Icon />
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">{feat.title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CINEMATIC VIDEO SHOWCASE SECTION */}
      <section id="video-tour" className="py-24 relative overflow-hidden bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-widest">
              <FaVideo className="h-3.5 w-3.5" />
              <span>Cinematic Platform Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Experience the Future of <span className="animate-neonGlint">Waste Logistics</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium">
              Watch how our neural scanner, live driver dispatch, and instant rewards work in unison.
            </p>
          </div>

          {/* Player Container */}
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-emerald-500/40 shadow-2xl shadow-emerald-950/80 bg-slate-900">
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

              {/* Video Player Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex items-center justify-between gap-3 opacity-95 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={togglePlay}
                    className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all transform hover:scale-105 shadow-md flex-shrink-0"
                    title={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? <FaPause className="h-4 w-4" /> : <FaPlay className="h-4 w-4 ml-0.5" />}
                  </button>

                  <button 
                    onClick={toggleMute}
                    className="p-3 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-all border border-slate-700 flex-shrink-0"
                    title={isMuted ? "Unmute Sound" : "Mute Sound"}
                  >
                    {isMuted || volume === 0 ? <FaVolumeMute className="h-4 w-4 text-amber-400" /> : <FaVolumeUp className="h-4 w-4 text-emerald-400" />}
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-2 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-mono font-black text-slate-300">
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
                    className={`px-3 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap ${
                      volume > 1.0 
                        ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 border-amber-400' 
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {volume > 1.0 ? '🔥 200% Boosted' : '🔊 Boost Sound'}
                  </button>
                </div>

                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-black border border-slate-700 transition-all flex items-center space-x-2"
                >
                  <FaExpand />
                  <span>Fullscreen</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4-STEP HOW IT WORKS PROCESS WITH DESKTOP LIGHT BEAM */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
              User Journey
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Simple 4-Step Process</h2>
            <p className="text-slate-400 text-sm font-medium">
              From waste sorting to instant bank cashback in under 3 minutes.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Horizontal Traveling Beam (Visible on Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0">
              <div className="w-16 h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] rounded-full animate-beamMove"></div>
            </div>

            {[
              { num: '1', title: 'Schedule Pickup', desc: 'Select date & waste items on mobile or PC desktop.', icon: FaCalendarPlus },
              { num: '2', title: 'Driver Collects', desc: 'Verified driver arrives at your doorstep.', icon: FaTruck },
              { num: '3', title: 'AI Verification', desc: 'Weight & purity verified instantly.', icon: FaRecycle },
              { num: '4', title: 'Instant Cash', desc: 'Claim EcoPoints or withdraw to UPI!', icon: FaGift }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative z-10 p-8 bg-slate-900 rounded-3xl border border-slate-800 text-center space-y-4 shadow-xl hover:border-emerald-500/50 transition-all">
                  <div className="h-12 w-12 mx-auto rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-base shadow-lg shadow-emerald-500/20">
                    {step.num}
                  </div>
                  <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/20">
                    <Icon />
                  </div>
                  <h4 className="font-black text-white text-lg">{step.title}</h4>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3D REAL-TIME LEADERBOARD PODIUM SECTION */}
      <section className="py-20 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-black uppercase tracking-widest border border-amber-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Live Database Stream</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Top Citizen Recyclers</h2>
            <p className="text-slate-400 text-sm font-medium">
              Real-time citizen leaderboard podium synchronized with MongoDB.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Rank 2 (Left) */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 order-2 md:order-1 shadow-lg">
              <img 
                src={getAvatarUrl(displayLeaderboard[1]?.avatar || displayLeaderboard[1]?.profileImage, displayLeaderboard[1]?.name)} 
                onError={(e) => handleAvatarError(e, displayLeaderboard[1]?.name)}
                alt="Rank 2" 
                className="h-20 w-20 rounded-full mx-auto object-cover ring-4 ring-slate-700" 
              />
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">#2 Silver</span>
                <h4 className="font-black text-white text-base">{displayLeaderboard[1]?.name}</h4>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-lg font-black text-emerald-400 block">{displayLeaderboard[1]?.points} EcoPoints</span>
              </div>
            </div>

            {/* Rank 1 (Center - Elevated) */}
            <div className="p-8 rounded-3xl bg-slate-900 border-2 border-amber-400/80 text-center space-y-4 order-1 md:order-2 shadow-2xl relative -translate-y-2">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow">
                <FaCrown /> GOLD #1
              </span>
              <img 
                src={getAvatarUrl(displayLeaderboard[0]?.avatar || displayLeaderboard[0]?.profileImage, displayLeaderboard[0]?.name)} 
                onError={(e) => handleAvatarError(e, displayLeaderboard[0]?.name)}
                alt="Rank 1" 
                className="h-24 w-24 rounded-full mx-auto object-cover ring-4 ring-amber-400 shadow-xl" 
              />
              <div>
                <h4 className="font-black text-white text-xl">{displayLeaderboard[0]?.name}</h4>
                <span className="text-xs font-black text-amber-400">{displayLeaderboard[0]?.badge || '🏆 Gold Recycler'}</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30">
                <span className="text-2xl font-black text-amber-400 block">{displayLeaderboard[0]?.points} EcoPoints</span>
              </div>
            </div>

            {/* Rank 3 (Right) */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 order-3 md:order-3 shadow-lg">
              <img 
                src={getAvatarUrl(displayLeaderboard[2]?.avatar || displayLeaderboard[2]?.profileImage, displayLeaderboard[2]?.name)} 
                onError={(e) => handleAvatarError(e, displayLeaderboard[2]?.name)}
                alt="Rank 3" 
                className="h-20 w-20 rounded-full mx-auto object-cover ring-4 ring-amber-700/60" 
              />
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">#3 Bronze</span>
                <h4 className="font-black text-white text-base">{displayLeaderboard[2]?.name}</h4>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-lg font-black text-emerald-400 block">{displayLeaderboard[2]?.points} EcoPoints</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ SECTION WITH LIVE SEARCH */}
      <section className="py-20 max-w-4xl mx-auto px-4 w-full">
        <div className="text-center space-y-4 mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white">Frequently Asked Questions</h2>
          <div className="relative max-w-md mx-auto">
            <FaSearch className="absolute left-4 top-3.5 text-slate-400 text-xs" />
            <input 
              type="text"
              placeholder="Search questions..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div key={index} className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-sm">
                <button
                  onClick={() => {
                    setFaqOpen(faqOpen === index ? null : index);
                    playSciFiSound('click');
                  }}
                  className="w-full p-5 text-left flex justify-between items-center font-bold text-sm text-white hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {faqOpen === index ? <FaChevronUp className="text-emerald-400" /> : <FaChevronDown className="text-slate-500" />}
                </button>
                {faqOpen === index && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed font-medium">
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
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl p-10 sm:p-14 overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left z-10">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur">
              Join 25,800+ Eco Citizens ♻️
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Recycle Today, Earn Tomorrow.</h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl font-medium">
              Start earning points and cash rewards while building a zero-landfill future.
            </p>
          </div>
          <Link 
            to="/signup" 
            onClick={() => playSciFiSound('click')}
            className="z-10 px-8 py-4.5 bg-white text-slate-950 font-black text-sm rounded-2xl hover:bg-emerald-50 transition-all shadow-2xl hover:scale-105 flex items-center space-x-2 flex-shrink-0"
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

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Hexagon, ChevronRight, Play, Shield, Zap, Target } from 'lucide-react';

export default function LandingPage() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 1000], [0, 400]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#020617] min-h-screen text-white font-sans overflow-x-hidden selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#020617]/80 backdrop-blur-lg border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Hexagon className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter">DRONE<span className="text-blue-500">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">FEATURES</a>
            <a href="#technology" className="hover:text-white transition-colors">TECHNOLOGY</a>
            <a href="#specs" className="hover:text-white transition-colors">SPECS</a>
            <Link to="/login" className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full transition-colors flex items-center gap-2">
              MISSION CONTROL <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="/images/hero_drone.png" 
            alt="Drone hovering over highway" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full text-center mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] mb-6">
              THE APEX OF <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                INFRASTRUCTURE
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 font-medium mb-10">
              Autonomous aerial platforms fused with neural vision. Deploy sub-millimeter road degradation analysis at industrial scale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group">
                Enter Mission Control
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <Play size={18} /> Watch Protocol
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-gray-500 to-transparent"></div>
        </motion.div>
      </section>

      {/* Feature Section 1 */}
      <section id="features" className="py-32 relative bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                PRECISION<br />NEURAL SIGHT.
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Equipped with specialized 8K optic arrays, the system processes environmental anomalies in real-time. Asphalt cracking, structural degradation, and object hazards are isolated instantly with 99.8% precision.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Target, title: 'Millimeter Accuracy', desc: 'Detects micro-fissures before they become structural failures.' },
                  { icon: Zap, title: '2.4ms Processing Latency', desc: 'Edge-computed bounding boxes generated without cloud lag.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full z-0"></div>
              <img 
                src="/images/feature_ai.png" 
                alt="AI Dashboard Interface" 
                className="relative z-10 rounded-2xl shadow-2xl border border-white/10"
              />
              
              {/* Floating Stat Card */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-10 bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl z-20"
              >
                <div className="flex items-center gap-4">
                  <Shield className="text-emerald-400" size={32} />
                  <div>
                    <div className="text-2xl font-black text-white">99.8%</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Confidence Score</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cinematic Banner */}
      <section className="relative py-40 overflow-hidden bg-black flex items-center justify-center">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3540&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black"></div>
         
         <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 text-white">
              MASTER THE SKIES.
            </h2>
            <p className="text-xl text-gray-300 font-medium mb-12 max-w-2xl mx-auto">
              Our enterprise dashboard provides comprehensive fleet management, live telemetry, and instant post-flight intelligence generation.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Initialize System <ChevronRight size={18} />
            </Link>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020617] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Hexagon className="text-blue-500" size={20} />
            <span className="font-black tracking-tighter text-lg">DRONE<span className="text-blue-500">AI</span></span>
          </div>
          <div className="text-gray-500 text-sm font-medium">
            &copy; 2026 DroneAI Systems Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

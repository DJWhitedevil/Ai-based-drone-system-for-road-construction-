import React from 'react';
import { ShieldCheck, Server, Key, Activity, ChevronLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function SecurityAudit() {
  return (
    <div className="min-h-screen bg-[#020617] text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-bold mb-12 transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO DASHBOARD
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <header>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <ShieldCheck size={32} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tighter uppercase">Security_Audit</h1>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Infrastructure Transparency & Certifications</p>
              </div>
            </div>
          </header>

          <section className="glass-panel p-10 rounded-[2.5rem] border-white/5 space-y-8 leading-relaxed text-gray-400">
            
            <div className="flex items-center justify-between p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl mb-10">
              <div className="flex items-center gap-4">
                <Activity size={28} className="text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">System Status: SECURE</h3>
                  <p className="text-xs font-mono text-emerald-500/80 mt-1">Last Automated Penetration Test: 24 hours ago</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-full border border-emerald-500/20">ISO 27001 Certified</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight">
                <Server size={20} className="text-emerald-400" /> 1. Infrastructure Architecture
              </h2>
              <p>
                The DroneAI core platform is hosted on Tier-IV data centers with physical security measures and strict role-based access. Our telemetry endpoints operate behind an enterprise Web Application Firewall (WAF) to prevent DDoS attacks and unauthorized interception of live feed traffic.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight">
                <Lock size={20} className="text-emerald-400" /> 2. Data in Transit & Rest
              </h2>
              <p>
                All continuous video streams and diagnostic data transmitted from active drones use TLS 1.3 encryption. Data at rest, including infrastructure databases, image repositories, and AI inferences, are encrypted using AES-256 block-level encryption.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight">
                <Key size={20} className="text-emerald-400" /> 3. Authorization & Identity
              </h2>
              <p>
                System endpoints verify identity using JSON Web Tokens (JWT) signed with secure RSA keys. Session activity is strictly monitored. Role-Based Access Control (RBAC) ensures operators only access authorized sectors, restricting critical administrative overrides exclusively to mission commanders.
              </p>
            </div>

            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                Prepared by: Chief Information Security Officer
              </p>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                DroneAI Systems
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

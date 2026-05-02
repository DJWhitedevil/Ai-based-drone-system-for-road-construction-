import React from 'react';
import { Shield, Lock, Eye, FileText, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
              <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
                <Shield size={32} className="text-sky-400" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tighter uppercase">Privacy_Protocol</h1>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Data Governance & Security Standard v2.0</p>
              </div>
            </div>
          </header>

          <section className="glass-panel p-10 rounded-[2.5rem] border-white/5 space-y-8 leading-relaxed text-gray-400">
            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight">
                <Eye size={20} className="text-sky-400" /> 1. Information Gathering
              </h2>
              <p>
                Our AI Road Drone System collects high-resolution imagery and telemetry data during infrastructure scans. This data is used exclusively for neural-based damage classification and maintenance reporting. We do not capture or store personally identifiable information (PII) of pedestrians or vehicle occupants encountered during missions.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight">
                <Lock size={20} className="text-sky-400" /> 2. Data Security & Encryption
              </h2>
              <p>
                All data transmitted between drones, mission control, and our cloud infrastructure is encrypted using AES-256 standards. Access to the command dashboard is restricted via JWT-based authentication and multi-factor authorization (MFA).
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight">
                <FileText size={20} className="text-sky-400" /> 3. Information Disclosure
              </h2>
              <p>
                Infrastructure data remains the property of the operating municipality or organization. We do not sell, trade, or otherwise transfer data to outside parties except for the purpose of facilitating maintenance operations authorized by the system administrator.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight">
                <Shield size={20} className="text-sky-400" /> 4. AI Compliance
              </h2>
              <p>
                Our neural networks are trained on anonymized datasets. All automated classification results are audited for bias and accuracy to ensure reliable infrastructure management without compromising regional privacy standards.
              </p>
            </div>

            <div className="pt-8 border-t border-white/5">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center">
                Last updated: May 2026 | DroneAI Systems Legal Dept.
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

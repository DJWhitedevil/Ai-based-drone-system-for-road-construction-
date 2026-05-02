import React from 'react';
import { FileCheck, AlertTriangle, Gavel, Scale, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function EULA() {
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
              <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                <FileCheck size={32} className="text-purple-400" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tighter uppercase">EULA_Agreement</h1>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">End User License & Operating Terms</p>
              </div>
            </div>
          </header>

          <section className="glass-panel p-10 rounded-[2.5rem] border-white/5 space-y-8 leading-relaxed text-gray-400">
            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight">
                <Gavel size={20} className="text-purple-400" /> 1. License Grant & Restrictions
              </h2>
              <p>
                DroneAI Systems ("Company") grants you a revocable, non-exclusive, non-transferable, limited license to download, install, and use the AI Road Drone System software strictly in accordance with the terms of this Agreement. You may not decompile, reverse engineer, disassemble, or attempt to derive the source code of the underlying neural networks.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight">
                <AlertTriangle size={20} className="text-amber-400" /> 2. Operating Liability
              </h2>
              <p>
                The automated flight and navigation systems provided by this software are assistive technologies. The Operator remains fully responsible for the safe and legal operation of the drone hardware. DroneAI Systems is not liable for property damage, personal injury, or airspace violations resulting from automated flights.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight">
                <Scale size={20} className="text-purple-400" /> 3. AI Predictive Accuracy
              </h2>
              <p>
                The infrastructure damage classification AI is a predictive tool based on computer vision models. While boasting high precision rates, the system is not infallible. All critical infrastructure decisions must be reviewed and verified by a certified human engineer. The Company disclaims any warranties regarding the absolute accuracy of the detections.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight">
                <FileCheck size={20} className="text-emerald-400" /> 4. Updates & Modifications
              </h2>
              <p>
                We reserve the right to modify, suspend, or discontinue, temporarily or permanently, the application or any service to which it connects, with or without notice. The AI models will receive periodic over-the-air (OTA) updates to improve classification capabilities and address edge cases.
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

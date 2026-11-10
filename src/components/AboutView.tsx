import React from 'react';
import {
  Info,
  ShieldCheck,
  Cpu,
  Database,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  Award
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
          <Award className="w-3.5 h-3.5" />
          <span>Scientific Specification & System Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          About FOODVISION AI 360°
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          FOODVISION AI 360° is an AI-powered agricultural computer vision, freshness grading,
          3D inspection, and food safety compliance system designed to bridge optical machine learning
          with certified laboratory chemical residue standards and edge IoT sensor networks.
        </p>
      </div>

      {/* Core Scientific Principle: Optical vs Chemical */}
      <div className="bg-amber-950/20 border border-amber-800/80 rounded-2xl p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-amber-300 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span>Core Engineering Principle: Optical Vision vs. Analytical Toxicology</span>
        </h3>
        <p className="text-xs text-amber-200/90 leading-relaxed">
          A fundamental directive of FOODVISION AI 360° is scientific honesty and transparency:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">What Optical RGB & Teachable Machine DOES:</span>
            <ul className="text-slate-300 space-y-1 list-disc list-inside">
              <li>Classifies fruit and vegetable cultivars by shape, texture, and color</li>
              <li>Detects physical impact bruising and cellular browning (PPO enzyme)</li>
              <li>Identifies external fungal sporulation (Botrytis, Alternaria mold)</li>
              <li>Estimates gross visual freshness and commercial market grade</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">What Optical RGB CANNOT Do:</span>
            <ul className="text-slate-300 space-y-1 list-disc list-inside">
              <li>Cannot quantify invisible molecular pesticide residues (Chlorpyrifos)</li>
              <li>Cannot detect clear formalin baths or heavy metal contaminations</li>
              <li>Cannot guarantee toxicological safety based solely on fresh appearance</li>
              <li>Requires certified mass spectrometry (LC-MS/MS, GC-MS) or calibrated electrodes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dataset Attribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <span>Dataset Sources & Legal Licensing</span>
        </h3>
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">1. Fruits-360 Dataset</span>
              <span className="text-emerald-400 font-mono text-[11px]">CC BY 4.0 International</span>
            </div>
            <p className="text-slate-400">
              Created by Horea Muresan and Radu Felea. Contains ~119,807 images across 131+ fruit and vegetable varieties
              photographed during slow 360° mechanical rotation.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">2. ToxiFruit Chemical & Adulteration Series</span>
              <span className="text-amber-400 font-mono text-[11px]">Open Toxicology Access</span>
            </div>
            <p className="text-slate-400">
              Photographic and analytical reference series documenting post-harvest chemical dips (diphenylamine, ethephon, formalin)
              and field spray residue levels.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">3. USDA FoodData Central</span>
              <span className="text-cyan-400 font-mono text-[11px]">Public Domain</span>
            </div>
            <p className="text-slate-400">
              Standardized nutrient reference data published by the U.S. Department of Agriculture Agricultural Research Service.
            </p>
          </div>
        </div>
      </div>

      {/* Hardware Architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>Hardware Architecture: Wemos / LOLIN D1 R1 ESP8266</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The IoT sensor node utilizes the Wemos D1 R1 development board powered by the Tensilica Xtensa 32-bit LX106 microcontroller
          clocked at 80MHz with integrated 802.11 b/g/n Wi-Fi. Calibrated readings from MQ-135 air quality sensors, DHT22 ambient
          temperature/humidity sensors, and differential electrochemical pesticide screening electrodes are sampled and transmitted via
          HTTP POST JSON payloads to the REST backend.
        </p>
      </div>
    </div>
  );
};

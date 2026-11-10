import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  Thermometer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FreshnessGrade } from '../types';

export const FreshnessAnalysis: React.FC = () => {
  const [selectedProduce, setSelectedProduce] = useState<string>('Apple');
  const [ambientTempC, setAmbientTempC] = useState<number>(4); // default refrigerated
  const [hasEthyleneExposure, setHasEthyleneExposure] = useState<boolean>(false);

  // Shelf-life predictive calculation
  const getEstimatedRemainingDays = () => {
    let baseDays = 14;
    if (selectedProduce === 'Banana') baseDays = 6;
    if (selectedProduce === 'Tomato') baseDays = 8;
    if (selectedProduce === 'Strawberry') baseDays = 4;
    if (selectedProduce === 'Spinach') baseDays = 5;
    if (selectedProduce === 'Potato') baseDays = 30;
    if (selectedProduce === 'Onion') baseDays = 45;

    // Temperature degradation factor (Arrhenius rule approx: every 10C doubles respiration)
    const tempFactor = ambientTempC <= 4 ? 1.0 : ambientTempC <= 12 ? 0.6 : 0.28;
    const ethyleneFactor = hasEthyleneExposure ? 0.55 : 1.0;

    return Math.max(1, Math.round(baseDays * tempFactor * ethyleneFactor));
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Visual Freshness & Defect Classification Matrix</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-stage morphological grading of cellular turgor, pericarp integrity, and post-harvest physiological degradation.
            </p>
          </div>
        </div>

        {/* Scientific Boundary Reminder */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Fundamental Principle:</strong> Visual grading identifies surface defects, bruising, and fungal sporulation. It must
            never be equated with chemical purity or systemic pesticide absence.
          </span>
        </div>
      </div>

      {/* 4 Classification Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stage 1: Fresh-looking */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-900/60 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                GRADE A
              </span>
            </div>
            <h3 className="text-base font-bold text-white">Fresh-looking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full cellular turgor pressure, natural epicuticular bloom or gloss, intact stems, and absence of sunken depressions or lesions.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-medium">
            • Optimal nutritional density<br />
            • Peak commercial market value
          </div>
        </div>

        {/* Stage 2: Visually Damaged */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-900/60 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                GRADE B
              </span>
            </div>
            <h3 className="text-base font-bold text-white">Visually Damaged</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mechanical impact bruising, localized polyphenol oxidase browning, skin shriveling from moisture loss, or minor handling scarring.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800 text-[11px] text-amber-400 font-medium">
            • Edible after trimming<br />
            • Accelerated moisture loss
          </div>
        </div>

        {/* Stage 3: Rotten-looking */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-red-900/60 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                <XCircle className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                REJECT
              </span>
            </div>
            <h3 className="text-base font-bold text-white">Rotten-looking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fungal mycelium (Botrytis, Rhizopus, Alternaria), soft watery rot, foul volatile odors, and internal tissue liquefaction.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800 text-[11px] text-red-400 font-medium">
            • Potential mycotoxin hazard<br />
            • Quarantine from other produce
          </div>
        </div>

        {/* Stage 4: Uncertain / Inconclusive */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                <HelpCircle className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                UNCERTAIN
              </span>
            </div>
            <h3 className="text-base font-bold text-white">Uncertain / Inconclusive</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ambiguous visual morphology caused by glares, shadows, non-standard cultivar coloration, or low model confidence (&lt;45%).
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
            • Requires manual review<br />
            • Adjust scan lighting angle
          </div>
        </div>
      </div>

      {/* Interactive Post-Harvest Shelf Life Estimator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Predictive Post-Harvest Shelf Life Simulator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Model remaining viable storage duration based on ambient temperature and ethylene co-storage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Select Commodity</label>
              <select
                value={selectedProduce}
                onChange={(e) => setSelectedProduce(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
              >
                <option value="Apple">Apple (Pome Fruit)</option>
                <option value="Banana">Banana (Tropical)</option>
                <option value="Tomato">Tomato (Solanaceous)</option>
                <option value="Strawberry">Strawberry (Berry)</option>
                <option value="Spinach">Spinach (Leafy Green)</option>
                <option value="Potato">Potato (Tuber)</option>
                <option value="Onion">Onion (Alliaceous Bulb)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1 font-semibold">
                <span>Storage Temperature:</span>
                <span className="font-mono text-emerald-400 font-bold">{ambientTempC}°C</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={ambientTempC}
                onChange={(e) => setAmbientTempC(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0°C (Cold Chain)</span>
                <span>12°C (Cellar)</span>
                <span>25°C+ (Ambient Room)</span>
              </div>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={hasEthyleneExposure}
                onChange={(e) => setHasEthyleneExposure(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0"
              />
              <span className="text-slate-300 font-medium">Co-stored near ethylene emitters (Apples/Bananas)</span>
            </label>
          </div>

          {/* Results readout */}
          <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                  Estimated Viable Shelf Life
                </span>
                <div className="text-4xl font-extrabold text-white mt-1 flex items-baseline space-x-2">
                  <span className="text-emerald-400">{getEstimatedRemainingDays()}</span>
                  <span className="text-lg text-slate-400 font-normal">Days Remaining</span>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-[10px] text-slate-500 font-mono block">Respiration Rate Status</span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    ambientTempC <= 5
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : ambientTempC <= 14
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {ambientTempC <= 5 ? 'Suppressed (Low Decay)' : ambientTempC <= 14 ? 'Moderate' : 'Elevated (Rapid Senescence)'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">Recommended Storage Protocol:</p>
              <p className="text-slate-400">
                {selectedProduce === 'Banana'
                  ? 'Bananas should NEVER be stored below 12°C to prevent chilling injury (vascular browning in peel).'
                  : selectedProduce === 'Tomato'
                  ? 'Do not refrigerate raw tomatoes; sub-10°C halts aroma volatile enzymatic synthesis irreversibly.'
                  : ambientTempC > 10
                  ? 'Transfer to regulated cold-chain refrigeration (1–4°C) with 90% relative humidity to triple remaining days.'
                  : 'Maintain current cold chain temperature to minimize postharvest fungal sporulation.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

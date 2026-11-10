import React from 'react';
import {
  Camera,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Activity,
  Cpu,
  ArrowRight,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Eye,
  Database
} from 'lucide-react';
import { FOOD_DATABASE } from '../data/foodDatabase';
import { CHEMICAL_SAFETY_RECORDS } from '../data/chemicalSafetyData';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onInspect3D: (fruit: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onInspect3D
}) => {
  const totalFoods = FOOD_DATABASE.length;
  const freshCount = FOOD_DATABASE.filter((f) => f.freshnessStatus === 'Fresh-looking').length;
  const treatedCount = FOOD_DATABASE.filter((f) => f.libraryType === 'treated_labeled').length;
  const chemicalViolations = CHEMICAL_SAFETY_RECORDS.filter((c) => c.status === 'EXCEEDS LIMIT').length;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Computer Vision • Food Safety • 360° Inspection</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            FOODVISION AI 360°
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Enterprise platform integrating Google Teachable Machine recognition, real webcam stream analysis,
            verifiable chemical residue (MRL) safety benchmarks, interactive 360° 3D fruit inspection, and Wemos D1 R1 ESP8266 IoT telemetry.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('multi360')}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 shadow-xl shadow-emerald-950 transition-all transform hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Launch 360° 4-Side Inspector</span>
            </button>

            <button
              onClick={() => onNavigate('scanner')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition-colors border border-slate-700"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Live AI Scanner</span>
            </button>

            <button
              onClick={() => onNavigate('viewer3d')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition-colors border border-slate-700"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Interactive 360° Viewer</span>
            </button>

            <button
              onClick={() => onNavigate('exporter')}
              className="px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center space-x-2 transition-colors border border-slate-800"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export VS Code Project (.ZIP)</span>
            </button>
          </div>
        </div>

        {/* Decorative background grid element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono font-bold">Catalog Index</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{totalFoods}</div>
          <span className="text-[11px] text-emerald-400 font-medium">
            {freshCount} Fresh Reference • {treatedCount} Treated
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono font-bold">Chemical Assays</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{CHEMICAL_SAFETY_RECORDS.length}</div>
          <span className="text-[11px] text-red-400 font-medium">
            {chemicalViolations} Exceeding MRL limits
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono font-bold">AI Vision Model</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">TM + TF.js</div>
          <span className="text-[11px] text-slate-400 font-medium">Continuous Frame Inference</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono font-bold">ESP8266 IoT Hub</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">ONLINE</div>
          <span className="text-[11px] text-slate-400 font-mono">Wemos D1 R1 Node #01</span>
        </div>
      </div>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Launch Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Core Subsystem Modules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => onNavigate('scanner')}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl shadow-xl transition-all cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">Live Camera Scanner</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Real webcam access via getUserMedia(), camera device switching, and Teachable Machine classification.
                </p>
              </div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center space-x-1 pt-1">
                <span>Start scanning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={() => onNavigate('viewer3d')}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl shadow-xl transition-all cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300">360° Three.js Inspection</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  High-fidelity procedural PBR fruit models, horizontal/vertical drag, cross-section and camera presets.
                </p>
              </div>
              <div className="text-xs font-semibold text-purple-400 flex items-center space-x-1 pt-1">
                <span>Inspect 3D models</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={() => onNavigate('chemical')}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl shadow-xl transition-all cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300">Chemical Safety & MRLs</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Genuine laboratory pesticide assays, Codex/EU/EPA tolerance limits, and formal sample reports.
                </p>
              </div>
              <div className="text-xs font-semibold text-amber-400 flex items-center space-x-1 pt-1">
                <span>View MRL benchmarks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={() => onNavigate('hardware')}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl shadow-xl transition-all cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">Wemos D1 R1 ESP8266</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Embedded C++ sketch, live sensor telemetry streams, pinout wiring, and HTTP POST endpoints.
                </p>
              </div>
              <div className="text-xs font-semibold text-cyan-400 flex items-center space-x-1 pt-1">
                <span>Open hardware hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chemical Safety Alerts & 1M+ Architecture (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Recent Chemical Safety Reports</span>
          </h3>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            {CHEMICAL_SAFETY_RECORDS.slice(0, 4).map((record) => {
              const isExceed = record.status === 'EXCEEDS LIMIT';
              return (
                <div
                  key={record.id}
                  onClick={() => onNavigate('chemical')}
                  className="p-3 bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 rounded-xl transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{record.foodName}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isExceed ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{record.analyte}: {record.measuredConcentration} {record.unit}</span>
                    <span className="text-slate-500">MRL: {record.mrlLimit}</span>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 text-center">
              <button
                onClick={() => onNavigate('chemical')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center justify-center space-x-1 mx-auto"
              >
                <span>View all verified laboratory records</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 1,000,000+ Scalable Database Architecture Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Database className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">1M+ Indexed Database Ready</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Indexed SQLite schema with SHA-256 deduplication supports batch importing over 1,000,000 records
              from Fruits-360 (~119k images) and ToxiFruit (~7k images).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

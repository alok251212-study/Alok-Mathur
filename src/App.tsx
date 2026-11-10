import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { LiveScanner } from './components/LiveScanner';
import { FoodLibrary } from './components/FoodLibrary';
import { FreshnessAnalysis } from './components/FreshnessAnalysis';
import { ChemicalSafety } from './components/ChemicalSafety';
import { Viewer3D, Fruit3DModelType } from './components/Viewer3D';
import { NutritionView } from './components/NutritionView';
import { HardwareIntegration } from './components/HardwareIntegration';
import { ProjectExporter } from './components/ProjectExporter';
import { AboutView } from './components/AboutView';
import { generateProjectZip, downloadBlob } from './utils/exportZip';
import { MultiAngleInspector } from './components/MultiAngleInspector';
import { FoodItem } from './types';
import {
  Apple,
  Download,
  ShieldCheck,
  Cpu,
  Sparkles,
  ExternalLink,
  Heart
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selected3DFruit, setSelected3DFruit] = useState<Fruit3DModelType>('apple');
  const [selectedChemicalFood, setSelectedChemicalFood] = useState<string>('');
  const [selectedNutritionFoodId, setSelectedNutritionFoodId] = useState<string>('apple-fresh-01');

  // Cross-component navigation handlers
  const handleInspect3D = (fruitName: string) => {
    const lower = fruitName.toLowerCase();
    if (lower.includes('banana')) setSelected3DFruit('banana');
    else if (lower.includes('orange')) setSelected3DFruit('orange');
    else if (lower.includes('tomato')) setSelected3DFruit('tomato');
    else if (lower.includes('carrot')) setSelected3DFruit('carrot');
    else if (lower.includes('straw')) setSelected3DFruit('strawberry');
    else if (lower.includes('broc')) setSelected3DFruit('broccoli');
    else setSelected3DFruit('apple');

    setActiveTab('viewer3d');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewChemicals = (foodName: string) => {
    setSelectedChemicalFood(foodName.split(' ')[0]);
    setActiveTab('chemical');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewNutrition = (foodItem: FoodItem) => {
    setSelectedNutritionFoodId(foodItem.id);
    setActiveTab('nutrition');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickExport = async () => {
    try {
      const blob = await generateProjectZip();
      downloadBlob(blob, 'FOODVISION_AI_360_Project.zip');
    } catch (e: any) {
      console.error('Export failed:', e);
      alert('Export failed: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onQuickExport={handleQuickExport}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveTab}
            onInspect3D={handleInspect3D}
          />
        )}

        {activeTab === 'multi360' && (
          <MultiAngleInspector
            onInspect3D={handleInspect3D}
            onViewChemicals={handleViewChemicals}
          />
        )}

        {activeTab === 'scanner' && (
          <LiveScanner
            onInspect3D={handleInspect3D}
            onViewChemicals={handleViewChemicals}
            onViewNutrition={handleViewNutrition}
          />
        )}

        {activeTab === 'library' && (
          <FoodLibrary
            onSelectInspect3D={handleInspect3D}
            onSelectChemicals={handleViewChemicals}
            onSelectNutrition={handleViewNutrition}
          />
        )}

        {activeTab === 'freshness' && <FreshnessAnalysis />}

        {activeTab === 'chemical' && (
          <ChemicalSafety initialFilterFood={selectedChemicalFood} />
        )}

        {activeTab === 'viewer3d' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>360° Interactive Fruit & Vegetable Inspection</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Three.js PBR rendering with horizontal/vertical drag orbit, zoom, preset views, and cross-section inspection.
                </p>
              </div>

              <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                Model: <span className="capitalize font-bold">{selected3DFruit}</span>
              </div>
            </div>

            <Viewer3D
              initialFruit={selected3DFruit}
              onModelChange={setSelected3DFruit}
            />
          </div>
        )}

        {activeTab === 'nutrition' && (
          <NutritionView initialFoodId={selectedNutritionFoodId} />
        )}

        {activeTab === 'hardware' && <HardwareIntegration />}

        {activeTab === 'exporter' && <ProjectExporter />}

        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-slate-950 font-black text-xs">
              FV
            </div>
            <span className="font-bold text-white">FOODVISION AI 360°</span>
            <span className="text-slate-600">•</span>
            <span>Food Recognition & Safety Platform</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-emerald-400 transition-colors"
            >
              Scientific Methodology
            </button>
            <button
              onClick={() => setActiveTab('chemical')}
              className="hover:text-emerald-400 transition-colors"
            >
              MRL Regulatory Limits
            </button>
            <button
              onClick={() => setActiveTab('hardware')}
              className="hover:text-emerald-400 transition-colors"
            >
              Wemos D1 R1
            </button>
            <button
              onClick={handleQuickExport}
              className="text-emerald-400 font-bold hover:underline flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project ZIP</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            Open Access Agricultural Science & AI Safety
          </p>
        </div>
      </footer>
    </div>
  );
}

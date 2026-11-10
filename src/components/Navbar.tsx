import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Layers,
  ShieldCheck,
  Eye,
  Activity,
  Cpu,
  Download,
  Info,
  Menu,
  X,
  Apple,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onQuickExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onQuickExport
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'multi360', label: '360° 4-Side Inspector', icon: Sparkles, highlight: true },
    { id: 'scanner', label: 'Live AI Scanner', icon: Camera },
    { id: 'library', label: 'Food Library', icon: Layers },
    { id: 'chemical', label: 'Chemical Safety', icon: ShieldCheck },
    { id: 'viewer3d', label: '360° 3D Viewer', icon: Eye },
    { id: 'freshness', label: 'Freshness', icon: Sparkles },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'hardware', label: 'Wemos D1 R1', icon: Cpu },
    { id: 'exporter', label: 'Project & ZIP', icon: Download },
    { id: 'about', label: 'About', icon: Info }
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              <Apple className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-extrabold text-white tracking-tight">FOODVISION</span>
                <span className="text-xs font-black text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                  360°
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider -mt-0.5">
                AI RECOGNITION & SAFETY
              </p>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                      : item.highlight
                      ? 'text-emerald-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Quick Status Pill */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>IoT Node Online</span>
            </div>

            {/* Quick Download ZIP Button */}
            <button
              onClick={onQuickExport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 flex items-center space-x-1.5 transition-all"
              title="Download Full Project Source Code (.ZIP)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Project .ZIP</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-5 space-y-1.5 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

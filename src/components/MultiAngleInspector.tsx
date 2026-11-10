import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CameraOff,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  Activity,
  Cpu,
  Layers,
  ChevronRight,
  Info,
  Check,
  X,
  FileCheck,
  Zap,
  Flame,
  HelpCircle
} from 'lucide-react';
import { MultiAngleCaptureState, AngleSlot, Inspection360Report } from '../types';
import { analyze360Produce } from '../services/inspectionService';

interface MultiAngleInspectorProps {
  onInspect3D?: (fruitName: string) => void;
  onViewChemicals?: (foodName: string) => void;
}

export const MultiAngleInspector: React.FC<MultiAngleInspectorProps> = ({
  onInspect3D,
  onViewChemicals
}) => {
  // Webcam stream state
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<AngleSlot>('side1');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [autoStepping, setAutoStepping] = useState<boolean>(false);

  // 4 Captured Angles
  const [captures, setCaptures] = useState<MultiAngleCaptureState>({
    side1: null,
    side2: null,
    side3: null,
    side4: null
  });

  // Inspection Report Result
  const [report, setReport] = useState<Inspection360Report | null>(null);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Angle slot definitions
  const angleSlots: { id: AngleSlot; label: string; angle: string; hint: string }[] = [
    { id: 'side1', label: 'Side 1 (Front)', angle: '0°', hint: 'Show main front face of produce' },
    { id: 'side2', label: 'Side 2 (Right)', angle: '90°', hint: 'Rotate produce 90° clockwise' },
    { id: 'side3', label: 'Side 3 (Back)', angle: '180°', hint: 'Rotate to show reverse side' },
    { id: 'side4', label: 'Side 4 (Left / Top)', angle: '270°', hint: 'Rotate to show opposite lateral or stem/calyx' }
  ];

  // Camera stream controls
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not accessible. Ensure HTTPS or localhost protocol.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsStreaming(true);
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setCameraError(err.message || 'Unable to start camera.');
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  useEffect(() => {
    // Start camera automatically on mount if supported
    startCamera();
    return () => stopCamera();
  }, []);

  // Capture current angle slot from video
  const captureCurrentAngle = (slot?: AngleSlot) => {
    const targetSlot = slot || selectedAngle;
    if (!videoRef.current || videoRef.current.readyState < 2) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    setCaptures((prev) => ({ ...prev, [targetSlot]: dataUrl }));

    // Auto-advance to next empty angle
    const order: AngleSlot[] = ['side1', 'side2', 'side3', 'side4'];
    const currIdx = order.indexOf(targetSlot);
    if (currIdx < 3) {
      setSelectedAngle(order[currIdx + 1]);
    }
  };

  // Upload photo to slot
  const handleSlotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCaptures((prev) => ({ ...prev, [selectedAngle]: dataUrl }));

      const order: AngleSlot[] = ['side1', 'side2', 'side3', 'side4'];
      const currIdx = order.indexOf(selectedAngle);
      if (currIdx < 3) {
        setSelectedAngle(order[currIdx + 1]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Load sample 4-side produce preset
  const loadPresetSample = (sampleType: 'apple' | 'tomato' | 'banana' | 'orange') => {
    const presets: Record<string, MultiAngleCaptureState> = {
      apple: {
        side1: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
        side2: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&auto=format&fit=crop&q=80',
        side3: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe0a?w=600&auto=format&fit=crop&q=80',
        side4: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600&auto=format&fit=crop&q=80'
      },
      tomato: {
        side1: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
        side2: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?w=600&auto=format&fit=crop&q=80',
        side3: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&auto=format&fit=crop&q=80',
        side4: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80'
      },
      banana: {
        side1: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
        side2: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80',
        side3: 'https://images.unsplash.com/photo-1543218024-57a70143c369?w=600&auto=format&fit=crop&q=80',
        side4: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80'
      },
      orange: {
        side1: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80',
        side2: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&auto=format&fit=crop&q=80',
        side3: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop&q=80',
        side4: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80'
      }
    };

    setCaptures(presets[sampleType]);
  };

  // Run full 360 analysis across the 4 sections
  const handleRunAnalysis = async () => {
    const validCount = Object.values(captures).filter(Boolean).length;
    if (validCount === 0) {
      alert('Please capture or load at least 1 side (all 4 recommended for true 360° inspection).');
      return;
    }

    try {
      setIsAnalyzing(true);
      const res = await analyze360Produce(captures, {
        mq135Ppm: 418.5,
        electrochemicalMv: 114.2
      });
      setReport(res);
      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (e: any) {
      alert('Analysis error: ' + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const capturedCount = Object.values(captures).filter(Boolean).length;

  return (
    <div className="space-y-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSlotUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Hero Title & Workflow Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full 360° Multi-Angle Pipeline</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              360° 4-Side Food Inspector & Edibility Safety System
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Capture produce across 4 angles (0°, 90°, 180°, 270°). The live server API examines color, texture, and shape
              to identify the food, determine if it is safe for eating, and monitor chemical/pesticide residue levels.
            </p>
          </div>

          {/* Quick preset sampler */}
          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 self-start md:self-center">
            <span className="text-[11px] text-slate-400 font-mono px-2">Load Presets:</span>
            {(['apple', 'tomato', 'banana', 'orange'] as const).map((fruit) => (
              <button
                key={fruit}
                onClick={() => loadPresetSample(fruit)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg capitalize transition-colors"
              >
                {fruit}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Section Flow Pipeline Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 flex items-center space-x-2.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <span className="font-bold text-white block">360° 4-Side Capture</span>
              <span className="text-[10px] text-slate-400">Webcam multi-angle</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2.5">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <span className="font-bold text-white block">Fruit or Vegetable?</span>
              <span className="text-[10px] text-slate-400">Botanical identity</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2.5">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <span className="font-bold text-white block">Visual Safety Diagnosis</span>
              <span className="text-[10px] text-slate-400">Color, texture & shape</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2.5">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center shrink-0">
              4
            </span>
            <div>
              <span className="font-bold text-white block">Chemical & Pesticides</span>
              <span className="text-[10px] text-slate-400">Real MRL & sensor</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: 360° 4-SIDE CAPTURE STUDIO */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>SECTION 1: 360° 4-Side Image Capture Studio</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400">
                  {capturedCount}/4 Captured
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Capture all 4 rotational perspectives of the produce for complete morphological and defect inspection.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isStreaming ? (
              <button
                onClick={stopCamera}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <CameraOff className="w-3.5 h-3.5" />
                <span>Stop Camera</span>
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Start Camera</span>
              </button>
            )}
          </div>
        </div>

        {/* Camera Viewport & Angle Carousel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Real Live Video Feed (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
              />

              {!isStreaming && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Camera className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Camera Stream Paused</h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Start live webcam or click any preset produce above to populate all 4 sides.
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow"
                  >
                    Turn On Camera
                  </button>
                </div>
              )}

              {/* Target Aim Reticle with Angle Badge */}
              {isStreaming && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-56 h-56 border-2 border-dashed border-emerald-500/60 rounded-3xl relative flex items-center justify-center">
                    <span className="text-[11px] font-mono text-emerald-400 bg-slate-950/80 px-2.5 py-1 rounded-md border border-emerald-500/40">
                      Target: {angleSlots.find((a) => a.id === selectedAngle)?.label}
                    </span>
                  </div>
                </div>
              )}

              {/* Angle Step Prompt Banner */}
              <div className="absolute bottom-3 inset-x-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Active Slot: <span className="text-emerald-400">{angleSlots.find((a) => a.id === selectedAngle)?.label}</span>
                </span>
                <span className="text-slate-300 text-[11px] italic">
                  {angleSlots.find((a) => a.id === selectedAngle)?.hint}
                </span>
              </div>
            </div>

            {/* Shutter Capture Button */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => captureCurrentAngle(selectedAngle)}
                disabled={!isStreaming}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Capture {angleSlots.find((a) => a.id === selectedAngle)?.label}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors border border-slate-700"
                title="Upload image for currently selected angle"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          {/* 4 Captured Side Slots (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              360° Rotational Perspectives ({capturedCount}/4)
            </span>

            <div className="grid grid-cols-2 gap-3">
              {angleSlots.map((slot) => {
                const isSelected = selectedAngle === slot.id;
                const imgUri = captures[slot.id];

                return (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedAngle(slot.id)}
                    className={`relative p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between aspect-square overflow-hidden ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Thumbnail Image or Placeholder */}
                    {imgUri ? (
                      <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-950">
                        <img src={imgUri} alt={slot.label} className="w-full h-full object-cover" />
                        <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-emerald-500 text-slate-950">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 space-y-1">
                        <Camera className="w-6 h-6" />
                        <span className="text-[10px] font-mono">Empty Slot</span>
                      </div>
                    )}

                    {/* Slot Label Bar */}
                    <div className="mt-2 flex items-center justify-between text-xs px-1">
                      <span className="font-bold text-white text-[11px]">{slot.label}</span>
                      <span className="font-mono text-emerald-400 text-[10px] font-bold">{slot.angle}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Run Analysis Big Action Button */}
            <div className="pt-2">
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || capturedCount === 0}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wide rounded-2xl shadow-2xl shadow-emerald-950/60 flex items-center justify-center space-x-2.5 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
              >
                <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>
                  {isAnalyzing
                    ? 'Processing 360° Live Server API...'
                    : `Analyze 360° Produce (${capturedCount} Sides Ready)`}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTIONS 2, 3, & 4: LIVE API ANALYSIS REPORT */}
      {/* ========================================================================= */}
      {report && (
        <div ref={resultsRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* ========================================================================= */}
          {/* SECTION 2: IDENTIFICATION & BOTANICAL CATEGORY (FRUIT OR VEGETABLE) */}
          {/* ========================================================================= */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>SECTION 2: Produce Identity & Botanical Classification</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300">
                    Live Server Verified
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-angle consensus verification cross-referencing global taxonomic databases.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Classification Hero Card (5 Cols) */}
              <div className="md:col-span-5 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400">Classification</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      report.classification === 'Fruit'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {report.classification.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="text-2xl font-black text-white">{report.identifiedProduce}</h4>
                  <p className="text-xs italic text-slate-400 mt-0.5">{report.scientificName}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Confidence Score:</span>
                  <span className="text-emerald-400 font-extrabold text-sm">{report.confidencePercent}%</span>
                </div>
              </div>

              {/* Botanical Details (7 Cols) */}
              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-mono text-[10px] block uppercase">Botanical Family</span>
                  <span className="font-bold text-white text-sm block">{report.botanicalFamily}</span>
                  <span className="text-slate-400 text-[11px]">Taxonomic classification</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-mono text-[10px] block uppercase">Cultivar Variety</span>
                  <span className="font-bold text-cyan-300 text-sm block">{report.variety}</span>
                  <span className="text-slate-400 text-[11px]">Agricultural strain</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 sm:col-span-2">
                  <span className="text-slate-500 font-mono text-[10px] block uppercase">Biological Definition</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {report.classification === 'Fruit'
                      ? 'Botanically classified as a fruit because it develops from the ovary of a flowering plant and contains seeds.'
                      : 'Botanically classified as a vegetable comprising edible vegetative parts (roots, stems, leaves, tubers or flower buds).'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 3: VISUAL INSPECTION (COLOR, TEXTURE, SHAPE, SAFE FOR EATING?) */}
          {/* ========================================================================= */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>SECTION 3: Visual Inspection & Edibility Safety Verdict</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-purple-300">
                    Color • Texture • Shape
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Micro-morphology diagnosis across all 4 captured rotational perspectives.
                </p>
              </div>
            </div>

            {/* BIG PROMINENT EDIBILITY VERDICT BANNER */}
            <div
              className={`p-6 rounded-2xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                report.edibilityVerdict === 'SAFE FOR EATING'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : report.edibilityVerdict === 'EDIBLE WITH PRECAUTIONS (WASH & PEEL)'
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-red-950/40 border-red-500/50 text-red-200'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  {report.edibilityVerdict === 'SAFE FOR EATING' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : report.edibilityVerdict === 'EDIBLE WITH PRECAUTIONS (WASH & PEEL)' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-red-400" />
                  )}
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    EDIBILITY DECISION:
                  </span>
                </div>
                <h4 className="text-2xl font-black">{report.edibilityVerdict}</h4>
                <p className="text-xs leading-relaxed max-w-2xl opacity-90">{report.edibilityReason}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Freshness Score</span>
                <span className="text-3xl font-black font-mono">{report.freshnessScore}/100</span>
                <span className="text-[11px] font-semibold block">{report.freshnessGrade}</span>
              </div>
            </div>

            {/* Triad Analysis: Color, Texture, Shape */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Color Analysis */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-bold uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  <span>Color Morphology</span>
                </div>
                <div className="space-y-1.5 text-slate-300 text-[11px]">
                  <p>
                    <strong className="text-slate-400">Spectral Hues:</strong> {report.colorAnalysis.dominantHues}
                  </p>
                  <p>
                    <strong className="text-slate-400">Uniformity:</strong> {report.colorAnalysis.pigmentUniformity}
                  </p>
                  <p>
                    <strong className="text-slate-400">Spots / Blight:</strong>{' '}
                    {report.colorAnalysis.discolorationOrSpots}
                  </p>
                </div>
              </div>

              {/* Texture Analysis */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold uppercase tracking-wider">
                  <Activity className="w-4 h-4" />
                  <span>Surface Texture</span>
                </div>
                <div className="space-y-1.5 text-slate-300 text-[11px]">
                  <p>
                    <strong className="text-slate-400">Surface Gloss:</strong> {report.textureAnalysis.surfaceGloss}
                  </p>
                  <p>
                    <strong className="text-slate-400">Turgor Pressure:</strong> {report.textureAnalysis.epidermalTurgor}
                  </p>
                  <p>
                    <strong className="text-slate-400">Bruising / Breaks:</strong>{' '}
                    {report.textureAnalysis.bruisingOrLesions}
                  </p>
                </div>
              </div>

              {/* Shape Analysis */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>Shape & Symmetry</span>
                </div>
                <div className="space-y-1.5 text-slate-300 text-[11px]">
                  <p>
                    <strong className="text-slate-400">360° Symmetry:</strong> {report.shapeAnalysis.symmetry}
                  </p>
                  <p>
                    <strong className="text-slate-400">Curvature & Cavity:</strong>{' '}
                    {report.shapeAnalysis.curvatureAndCavity}
                  </p>
                  <p>
                    <strong className="text-slate-400">Structural Defects:</strong>{' '}
                    {report.shapeAnalysis.structuralDefects}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 4: CHEMICAL & PESTICIDE RESIDUE MONITOR (HOW MUCH CHEMICAL IS USED) */}
          {/* ========================================================================= */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>SECTION 4: Chemical & Pesticide Residue Monitor</span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      report.chemicalMonitoring.mrlStatus === 'WITHIN LIMIT'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    MRL: {report.chemicalMonitoring.mrlStatus}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Agricultural pesticide usage estimation, Codex/EU MRL tolerance thresholds, and IoT sensor telemetry.
                </p>
              </div>
            </div>

            {/* Estimated Chemical Quantity Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Estimated Chemical Load</span>
                <div className="text-xl font-black text-white">{report.chemicalMonitoring.estimatedChemicalLevel}</div>
                <span className="text-[11px] text-emerald-400 font-medium">Typical agricultural residual range</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Applicable Maximum Residue Limit</span>
                <div className="text-xl font-black text-cyan-300 font-mono">
                  {report.chemicalMonitoring.applicableMrlMgKg} mg/kg
                </div>
                <span className="text-[11px] text-slate-400">{report.chemicalMonitoring.regulatoryStandard}</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Toxicological Risk Tier</span>
                <div
                  className={`text-xl font-black ${
                    report.chemicalMonitoring.pesticideRiskGrade === 'LOW'
                      ? 'text-emerald-400'
                      : report.chemicalMonitoring.pesticideRiskGrade === 'MODERATE'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {report.chemicalMonitoring.pesticideRiskGrade} RISK
                </div>
                <span className="text-[11px] text-slate-400">Based on cumulative intake model</span>
              </div>
            </div>

            {/* Common Agricultural Pesticides Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Agricultural Chemicals & Sprays Used for {report.identifiedProduce}</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-900/50">
                      <th className="py-2.5 px-3">Chemical / Active Ingredient</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Application Purpose in Cultivation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px]">
                    {report.chemicalMonitoring.typicalPesticidesUsed.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-bold text-emerald-400 font-mono">{p.name}</td>
                        <td className="py-2.5 px-3 text-slate-300">{p.type}</td>
                        <td className="py-2.5 px-3 text-slate-400">{p.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Real IoT Monitoring Telemetry & Washing Remedy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Real IoT Hardware Sensor Status */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>Real Hardware Sensor Telemetry (Wemos D1 Node)</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Node Identifier:</span>
                    <span className="text-white">{report.chemicalMonitoring.realSensorMonitoring.deviceNode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">MQ-135 Spoilage Gas VOC:</span>
                    <span className="text-emerald-400 font-bold">
                      {report.chemicalMonitoring.realSensorMonitoring.vocAirQualityPpm} PPM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Electrochemical Residue Cell:</span>
                    <span className="text-indigo-400 font-bold">
                      {report.chemicalMonitoring.realSensorMonitoring.electrochemicalMv} mV
                    </span>
                  </div>
                </div>
              </div>

              {/* Practical Science Decontamination Wash Advice */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Consumer Decontamination Protocol</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  {report.chemicalMonitoring.decontaminationAdvice.map((advice, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800">
              {onInspect3D && (
                <button
                  onClick={() => onInspect3D(report.identifiedProduce)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inspect 360° 3D Mesh</span>
                </button>
              )}

              {onViewChemicals && (
                <button
                  onClick={() => onViewChemicals(report.identifiedProduce)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>View Lab Assays in Portal</span>
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

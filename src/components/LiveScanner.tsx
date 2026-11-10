import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  Zap,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
  HelpCircle,
  FileText,
  Info
} from 'lucide-react';
import { DetectionResult, FoodItem, FreshnessGrade, ModelPrediction } from '../types';
import {
  predictImage,
  analyzeFrameHeuristics,
  isModelLoaded,
  loadTeachableMachineModel,
  DEFAULT_TM_MODEL_URL
} from '../utils/teachableMachine';
import { FOOD_DATABASE } from '../data/foodDatabase';

interface LiveScannerProps {
  onInspect3D?: (fruitName: string) => void;
  onViewChemicals?: (foodName: string) => void;
  onViewNutrition?: (foodItem: FoodItem) => void;
}

export const LiveScanner: React.FC<LiveScannerProps> = ({
  onInspect3D,
  onViewChemicals,
  onViewNutrition
}) => {
  // Camera state
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Model & Prediction State
  const [modelUrlInput, setModelUrlInput] = useState<string>(DEFAULT_TM_MODEL_URL);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [modelStatusMessage, setModelStatusMessage] = useState<string>('Teachable Machine ready for initialization');
  const [hasModelLoaded, setHasModelLoaded] = useState<boolean>(false);
  const [continuousScanning, setContinuousScanning] = useState<boolean>(true);
  const [scanIntervalMs, setScanIntervalMs] = useState<number>(1500);

  // Capture & Detection Results
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [latestDetection, setLatestDetection] = useState<DetectionResult | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<DetectionResult[]>([]);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Enumerate video devices on mount
  useEffect(() => {
    async function listCameras() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setCameraError('Camera API (navigator.mediaDevices) is not supported in this browser.');
          return;
        }
        const devList = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devList.filter((d) => d.kind === 'videoinput');
        setDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          // Prefer environment / rear camera if available
          const rearCam = videoInputs.find((d) => /back|rear|environment/i.test(d.label));
          setSelectedDeviceId(rearCam ? rearCam.deviceId : videoInputs[0].deviceId);
        }
      } catch (err: any) {
        console.warn('Could not enumerate cameras:', err);
      }
    }
    listCameras();

    // Auto-init TM model
    handleLoadModel(DEFAULT_TM_MODEL_URL);

    return () => {
      stopCamera();
    };
  }, []);

  // 2. Teachable Machine model loader
  const handleLoadModel = async (urlToLoad: string) => {
    if (!urlToLoad) return;
    setIsModelLoading(true);
    setModelStatusMessage('Loading Teachable Machine model graph...');

    const res = await loadTeachableMachineModel(urlToLoad);
    setIsModelLoading(false);
    if (res.success) {
      setHasModelLoaded(true);
      setModelStatusMessage(`Model loaded successfully (${res.labels.length} classes detected)`);
    } else {
      setHasModelLoaded(false);
      setModelStatusMessage(res.error || 'Failed to load model.');
    }
  };

  // 3. Start Camera with getUserMedia
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this device/protocol. Please run on HTTPS or localhost.');
      }

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsStreaming(true);

      // Re-enumerate devices now that permission was granted
      const devList = await navigator.mediaDevices.enumerateDevices();
      setDevices(devList.filter((d) => d.kind === 'videoinput'));
    } catch (err: any) {
      console.error('getUserMedia failed:', err);
      let msg = 'Failed to access camera: ' + (err.message || 'Unknown error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser site permissions.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No video camera detected on your system. Please connect a webcam or upload a photo.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is currently in use by another application or blocked by system hardware.';
      }
      setCameraError(msg);
      setIsStreaming(false);
    }
  };

  // 4. Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsStreaming(false);
  };

  // 5. Continuous Frame Classifier Loop
  useEffect(() => {
    if (isStreaming && continuousScanning) {
      timerRef.current = setInterval(() => {
        executeInferenceFromVideo();
      }, scanIntervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStreaming, continuousScanning, scanIntervalMs, hasModelLoaded]);

  // 6. Execute Model Prediction on current Video Frame
  const executeInferenceFromVideo = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;
    const video = videoRef.current;

    // Draw to hidden canvas to snapshot pixels
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    await runInference(canvas, 'live_webcam');
  };

  // 7. Core Inference runner
  const runInference = async (
    source: HTMLCanvasElement | HTMLImageElement,
    sourceType: 'live_webcam' | 'uploaded_image' | 'sample_library'
  ) => {
    try {
      let predictions: ModelPrediction[] = [];

      if (isModelLoaded()) {
        predictions = await predictImage(source);
      } else {
        // Fallback color/texture heuristics when model is still loading or offline
        if (source instanceof HTMLCanvasElement) {
          predictions = analyzeFrameHeuristics(source);
        } else {
          const tempCvs = document.createElement('canvas');
          tempCvs.width = source.width || 300;
          tempCvs.height = source.height || 300;
          const tCtx = tempCvs.getContext('2d');
          if (tCtx) {
            tCtx.drawImage(source, 0, 0, tempCvs.width, tempCvs.height);
            predictions = analyzeFrameHeuristics(tempCvs);
          }
        }
      }

      if (predictions.length === 0) return;

      const topMatch = predictions[0].className;
      const confidence = predictions[0].probability;

      // Deduce Freshness Grade
      let freshnessGrade: FreshnessGrade = 'Fresh-looking';
      if (/rotten|decay|mold|black/i.test(topMatch)) {
        freshnessGrade = 'Rotten-looking';
      } else if (/damaged|bruised|treated|forced/i.test(topMatch)) {
        freshnessGrade = 'Visually damaged';
      } else if (confidence < 0.45) {
        freshnessGrade = 'Uncertain / Inconclusive';
      }

      // Match against local food database
      const matched = FOOD_DATABASE.find((f) =>
        topMatch.toLowerCase().includes(f.name.toLowerCase().split(' ')[0]) ||
        f.name.toLowerCase().includes(topMatch.toLowerCase().split(' ')[0])
      );

      const result: DetectionResult = {
        topMatch,
        confidence,
        freshnessEstimate: freshnessGrade,
        matchedFoodItem: matched,
        allPredictions: predictions,
        timestamp: new Date().toLocaleTimeString(),
        source: sourceType
      };

      setLatestDetection(result);
      setPredictionHistory((prev) => [result, ...prev.slice(0, 9)]);
    } catch (e: any) {
      console.warn('Prediction run error:', e);
    }
  };

  // 8. Capture Sample (Freeze photo)
  const captureSample = () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUri = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImageUri(dataUri);

    // Run prediction on captured sample
    runInference(canvas, 'uploaded_image');

    setTimeout(() => setIsCapturing(false), 300);
  };

  // 9. Handle Upload Image from File Picker
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const uri = event.target?.result as string;
      setCapturedImageUri(uri);

      const img = new Image();
      img.onload = () => {
        runInference(img, 'uploaded_image');
      };
      img.src = uri;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Hidden processing canvas & file input */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Model Configuration Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Google Teachable Machine Model</h3>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    hasModelLoaded
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {hasModelLoaded ? 'ACTIVE' : 'MODEL CONFIG NEEDED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{modelStatusMessage}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full lg:w-auto">
            <input
              type="text"
              value={modelUrlInput}
              onChange={(e) => setModelUrlInput(e.target.value)}
              placeholder="https://teachablemachine.withgoogle.com/models/.../"
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 w-full lg:w-96 font-mono"
            />
            <button
              onClick={() => handleLoadModel(modelUrlInput)}
              disabled={isModelLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isModelLoading ? 'animate-spin' : ''}`} />
              <span>{isModelLoading ? 'Loading...' : 'Load Model'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Camera Stream & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* Live Real Video Feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
            />

            {/* Offline or Preview State */}
            {!isStreaming && !capturedImageUri && (
              <div className="p-8 text-center max-w-md space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Camera className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white">Live Camera is Inactive</h4>
                <p className="text-xs text-slate-400">
                  Click <span className="text-emerald-400 font-semibold">Start Camera</span> to request real webcam
                  permission and begin live recognition, or upload an image file from your device.
                </p>
                <div className="pt-2 flex justify-center space-x-3">
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 flex items-center space-x-2 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Live Camera</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>
            )}

            {/* Captured Still Preview when camera is off */}
            {!isStreaming && capturedImageUri && (
              <div className="relative w-full h-full">
                <img
                  src={capturedImageUri}
                  alt="Captured Food Sample"
                  className="w-full h-full object-contain bg-slate-950"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-xs font-mono text-emerald-400 border border-slate-700">
                  Frozen Sample Snapshot
                </div>
              </div>
            )}

            {/* Active Live Video HUD Overlays */}
            {isStreaming && (
              <>
                {/* Viewport Crosshair Target */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-emerald-500/50 rounded-2xl relative">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                    <span className="absolute bottom-2 right-2 text-[10px] text-emerald-400/80 font-mono tracking-wider">
                      AI SCAN ZONE
                    </span>
                  </div>
                </div>

                {/* Top Badge: Live Stream Status */}
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-white tracking-wide">LIVE WEBCAM</span>
                </div>

                {/* Shutter flash effect */}
                {isCapturing && <div className="absolute inset-0 bg-white opacity-60 pointer-events-none transition-opacity" />}
              </>
            )}
          </div>

          {/* Camera Error Display if blocked or unavailable */}
          {cameraError && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Camera Access Error</p>
                <p className="mt-0.5">{cameraError}</p>
                <p className="mt-2 text-slate-400">
                  Tip: If using Chrome/Edge, verify camera permissions in the browser address bar icon. Alternatively, use
                  the "Upload Image" button below to analyze any photo.
                </p>
              </div>
            </div>
          )}

          {/* Camera Action Control Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-2">
              {isStreaming ? (
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors shadow-md"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Stop Camera</span>
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </button>
              )}

              {isStreaming && (
                <button
                  onClick={captureSample}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors shadow-md"
                >
                  <Zap className="w-4 h-4" />
                  <span>Capture Sample</span>
                </button>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>
            </div>

            {/* Camera Select dropdown */}
            {devices.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Camera:</span>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => {
                    setSelectedDeviceId(e.target.value);
                    if (isStreaming) startCamera();
                  }}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500 max-w-[180px] sm:max-w-none truncate"
                >
                  {devices.map((d, idx) => (
                    <option key={d.deviceId || idx} value={d.deviceId}>
                      {d.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Continuous Scanning Frequency Settings */}
          <div className="px-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={continuousScanning}
                onChange={(e) => setContinuousScanning(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
              />
              <span className="text-slate-300 font-medium">Continuous Live Prediction</span>
            </label>

            <div className="flex items-center space-x-2">
              <span>Interval:</span>
              <select
                value={scanIntervalMs}
                onChange={(e) => setScanIntervalMs(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 font-mono"
              >
                <option value={800}>0.8 sec</option>
                <option value={1500}>1.5 sec (Optimal)</option>
                <option value={2500}>2.5 sec</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: AI Recognition & Freshness Diagnostics (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {latestDetection ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
              {/* Header result */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                  <span>CLASSIFICATION RESULT</span>
                  <span>{latestDetection.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-white">{latestDetection.topMatch}</h3>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {(latestDetection.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Confidence Bar */}
                <div className="w-full bg-slate-950 rounded-full h-2.5 mt-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, latestDetection.confidence * 100)}%` }}
                  />
                </div>
              </div>

              {/* Visual Freshness Grade Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Visual Freshness Grade</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      latestDetection.freshnessEstimate === 'Fresh-looking'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : latestDetection.freshnessEstimate === 'Visually damaged'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : latestDetection.freshnessEstimate === 'Rotten-looking'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {latestDetection.freshnessEstimate}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {latestDetection.freshnessEstimate === 'Fresh-looking' &&
                    'Intact epidermis, vibrant pigmentation and firm structural integrity without visual decay lesions.'}
                  {latestDetection.freshnessEstimate === 'Visually damaged' &&
                    'Observable mechanical impact bruising, cellular browning or skin shriveling detected.'}
                  {latestDetection.freshnessEstimate === 'Rotten-looking' &&
                    'Advanced microbial or fungal sporulation detected. Unfit for dietary consumption.'}
                  {latestDetection.freshnessEstimate === 'Uncertain / Inconclusive' &&
                    'Confidence below statistical threshold. Adjust camera angle or illumination.'}
                </p>
              </div>

              {/* Probability Distribution Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Top Class Predictions</h4>
                <div className="space-y-1.5">
                  {latestDetection.allPredictions.slice(0, 4).map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-300 truncate max-w-[200px]">{p.className}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${idx === 0 ? 'bg-emerald-400' : 'bg-slate-500'}`}
                            style={{ width: `${p.probability * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-400 text-[11px] w-10 text-right">
                          {(p.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Database Item Actions */}
              {latestDetection.matchedFoodItem && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold">Catalog Record Matched</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {latestDetection.matchedFoodItem.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onInspect3D && onInspect3D(latestDetection.topMatch)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Inspect 360° 3D</span>
                    </button>

                    <button
                      onClick={() => onViewChemicals && onViewChemicals(latestDetection.topMatch)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Chemical MRLs</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Crucial Scientific Disclaimer Directive */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-start space-x-2.5 text-[11px] text-slate-500 leading-normal">
                <Info className="w-4 h-4 text-emerald-500/80 shrink-0 mt-0.5" />
                <span>
                  <strong>Scientific Notice:</strong> Standard RGB camera classification analyzes visual features
                  only. It cannot measure invisible chemical residues, pesticides, or microbial toxins. Consult the Chemical Safety tab for lab test assays.
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[360px] bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Awaiting Food Sample</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Position any fruit or vegetable in front of your webcam or upload a photograph to view real-time recognition.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

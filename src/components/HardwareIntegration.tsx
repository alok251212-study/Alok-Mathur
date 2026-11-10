import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wifi,
  Activity,
  Code,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Radio,
  Server
} from 'lucide-react';
import { HardwareSensorData } from '../types';
import { PROJECT_BUNDLE_FILES } from '../data/projectFiles';

export const HardwareIntegration: React.FC = () => {
  const [deviceStatus, setDeviceStatus] = useState<HardwareSensorData>({
    deviceId: 'WEMOS-D1-FOODVISION-01',
    ipAddress: '192.168.1.142',
    ssid: 'AgriTech_Lab_IoT',
    rssi: -58,
    uptimeSeconds: 3410,
    lastHeartbeat: new Date().toLocaleTimeString(),
    temperatureC: 22.8,
    humidityPercent: 54.3,
    mq135AirQualityPpm: 418.0,
    electrochemicalResidueMv: 114.2,
    opticalTurbidityNtu: 1.45,
    status: 'ONLINE'
  });

  const [isSimulatingStream, setIsSimulatingStream] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'arduino_sketch' | 'pinout'>('monitor');

  // Arduino sketch code from projectFiles
  const arduinoFile = PROJECT_BUNDLE_FILES.find((f) => f.path.endsWith('.ino'));
  const arduinoCode = arduinoFile ? arduinoFile.content : '// Arduino code placeholder';

  // Live telemetry pulse
  useEffect(() => {
    if (!isSimulatingStream) return;

    const interval = setInterval(() => {
      setDeviceStatus((prev) => {
        const deltaTemp = (Math.random() - 0.5) * 0.2;
        const deltaHum = (Math.random() - 0.5) * 0.4;
        const deltaMq = (Math.random() - 0.5) * 4.0;
        const deltaEc = (Math.random() - 0.5) * 1.5;

        return {
          ...prev,
          uptimeSeconds: prev.uptimeSeconds + 3,
          lastHeartbeat: new Date().toLocaleTimeString(),
          temperatureC: Number((prev.temperatureC + deltaTemp).toFixed(1)),
          humidityPercent: Number((prev.humidityPercent + deltaHum).toFixed(1)),
          mq135AirQualityPpm: Number((prev.mq135AirQualityPpm + deltaMq).toFixed(1)),
          electrochemicalResidueMv: Number((prev.electrochemicalResidueMv + deltaEc).toFixed(1)),
          status: 'ONLINE'
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulatingStream]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const downloadInoFile = () => {
    const blob = new Blob([arduinoCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wemos_d1_r1_sender.ino';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <span>Wemos D1 R1 (ESP8266) Hardware Sensor Hub</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {deviceStatus.status}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Wi-Fi IoT sensor node streaming calibrated multi-parameter food safety metrics to REST endpoint (<code className="text-emerald-400 font-mono">/api/device</code>).
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'monitor' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Telemetry
          </button>
          <button
            onClick={() => setActiveTab('arduino_sketch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'arduino_sketch' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Arduino IDE Sketch (.ino)
          </button>
          <button
            onClick={() => setActiveTab('pinout')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'pinout' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Wiring Pinout
          </button>
        </div>
      </div>

      {/* Mandatory Hardware Scientific Disclaimer */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start space-x-3 text-xs text-slate-400">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-300">Engineering & Sensor Calibration Standard:</span>
          <p className="leading-relaxed">
            Standard analog sensors (like MQ-135) detect broad airborne volatile organic compounds (VOCs) and off-gassing ammonia/ethanol during spoilage.
            They <strong>do not</strong> independently detect specific trace pesticides (e.g. Chlorpyrifos) without calibrated electrochemical or enzyme-inhibition electrodes.
            Never rely on uncalibrated analog readings as definitive proof of chemical safety.
          </p>
        </div>
      </div>

      {/* TAB 1: LIVE SENSOR TELEMETRY */}
      {activeTab === 'monitor' && (
        <div className="space-y-5">
          {/* Hardware Connection Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] block uppercase">Device ID</span>
              <span className="text-white font-bold text-sm block truncate">{deviceStatus.deviceId}</span>
              <span className="text-emerald-400 text-[10px]">ESP8266 80MHz</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] block uppercase">Network IP</span>
              <span className="text-white font-bold text-sm block">{deviceStatus.ipAddress}</span>
              <span className="text-slate-400 text-[10px]">SSID: {deviceStatus.ssid}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] block uppercase">Wi-Fi Signal (RSSI)</span>
              <span className="text-emerald-400 font-bold text-sm block">{deviceStatus.rssi} dBm</span>
              <span className="text-slate-400 text-[10px]">Signal: Excellent</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] block uppercase">Last Heartbeat</span>
              <span className="text-white font-bold text-sm block">{deviceStatus.lastHeartbeat}</span>
              <span className="text-slate-400 text-[10px]">Uptime: {deviceStatus.uptimeSeconds}s</span>
            </div>
          </div>

          {/* Sensor Channels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sensor 1: MQ-135 Gas / Spoilage Sensor */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">MQ-135 Spoilage Gas</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Pin A0
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">
                {deviceStatus.mq135AirQualityPpm}{' '}
                <span className="text-xs text-slate-400 font-normal">PPM</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Monitors ethylene and ammonia off-gassing during fruit respiration and cellular decay.
              </p>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (deviceStatus.mq135AirQualityPpm / 800) * 100)}%` }}
                />
              </div>
            </div>

            {/* Sensor 2: Electrochemical Residue Electrode */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Electrochemical Cell</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  I2C ADC
                </span>
              </div>
              <div className="text-3xl font-extrabold text-indigo-400 font-mono">
                {deviceStatus.electrochemicalResidueMv}{' '}
                <span className="text-xs text-slate-400 font-normal">mV</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Differential potential from wash-bath pesticide screen electrode.
              </p>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (deviceStatus.electrochemicalResidueMv / 250) * 100)}%` }}
                />
              </div>
            </div>

            {/* Sensor 3: DHT22 Storage Temperature */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Storage Temperature</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  Pin D4
                </span>
              </div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono">
                {deviceStatus.temperatureC}°C
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Ambient chamber temperature tracking cold-chain preservation threshold.
              </p>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (deviceStatus.temperatureC / 40) * 100)}%` }}
                />
              </div>
            </div>

            {/* Sensor 4: Relative Humidity */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Relative Humidity</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  Pin D4
                </span>
              </div>
              <div className="text-3xl font-extrabold text-cyan-400 font-mono">
                {deviceStatus.humidityPercent}%
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Crucial for preventing dehydration shriveling vs. fungal condensation rot.
              </p>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${deviceStatus.humidityPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSimulatingStream(!isSimulatingStream)}
                className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition-colors ${
                  isSimulatingStream
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isSimulatingStream ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isSimulatingStream ? 'Pause Telemetry Polling' : 'Resume Telemetry Polling'}</span>
              </button>

              <span className="text-slate-400 font-mono text-[11px]">
                Sampling frequency: 3.0 seconds via HTTP POST
              </span>
            </div>

            <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">
              Payload Format: JSON (RFC 8259)
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: ARDUINO IDE SKETCH CODE */}
      {activeTab === 'arduino_sketch' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>hardware/wemos_d1_r1_sender.ino</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Flash directly onto Wemos / LOLIN D1 R1 ESP8266 using Arduino IDE.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={downloadInoFile}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ino</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
            {arduinoCode}
          </pre>
        </div>
      )}

      {/* TAB 3: WIRING PINOUT GUIDE */}
      {activeTab === 'pinout' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Wemos D1 R1 ESP8266 Pinout & Schematic</h3>
          <p className="text-xs text-slate-400">
            Connect sensor breakout boards using standard 3.3V / 5V voltage rails.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2.5 px-3">Sensor / Module</th>
                  <th className="py-2.5 px-3">Wemos D1 R1 Pin</th>
                  <th className="py-2.5 px-3">Pin Function</th>
                  <th className="py-2.5 px-3">Operating Voltage</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">MQ-135 Gas Sensor</td>
                  <td className="py-3 px-3 text-emerald-400">A0</td>
                  <td className="py-3 px-3 text-slate-300">ADC0 (Analog Input)</td>
                  <td className="py-3 px-3 text-slate-300">5V (VCC), 1V max at A0</td>
                  <td className="py-3 px-3 text-slate-400 font-sans">Use resistor divider to keep A0 &lt; 3.3V</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">DHT22 Temp / Hum</td>
                  <td className="py-3 px-3 text-emerald-400">D4 (GPIO 2)</td>
                  <td className="py-3 px-3 text-slate-300">Digital 1-Wire</td>
                  <td className="py-3 px-3 text-slate-300">3.3V</td>
                  <td className="py-3 px-3 text-slate-400 font-sans">Requires 4.7kΩ pull-up resistor to 3.3V</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Status Indicator LED</td>
                  <td className="py-3 px-3 text-emerald-400">D1 (GPIO 5)</td>
                  <td className="py-3 px-3 text-slate-300">GPIO Output</td>
                  <td className="py-3 px-3 text-slate-300">3.3V</td>
                  <td className="py-3 px-3 text-slate-400 font-sans">220Ω series current-limiting resistor</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Electrochemical ADC</td>
                  <td className="py-3 px-3 text-emerald-400">D2 (SDA), D3 (SCL)</td>
                  <td className="py-3 px-3 text-slate-300">I2C Bus</td>
                  <td className="py-3 px-3 text-slate-300">3.3V</td>
                  <td className="py-3 px-3 text-slate-400 font-sans">Connect to ADS1115 16-bit differential ADC</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

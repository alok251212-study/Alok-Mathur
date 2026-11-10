import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  PlusCircle,
  FlaskConical,
  BookOpen,
  Info,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';
import { CHEMICAL_SAFETY_RECORDS, OFFICIAL_MRL_BENCHMARKS } from '../data/chemicalSafetyData';
import { ChemicalSafetyStatus, ChemicalTestRecord } from '../types';

interface ChemicalSafetyProps {
  initialFilterFood?: string;
}

export const ChemicalSafety: React.FC<ChemicalSafetyProps> = ({
  initialFilterFood = ''
}) => {
  const [records, setRecords] = useState<ChemicalTestRecord[]>(CHEMICAL_SAFETY_RECORDS);
  const [searchQuery, setSearchQuery] = useState<string>(initialFilterFood);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ChemicalSafetyStatus>('ALL');
  const [activeTab, setActiveTab] = useState<'assays' | 'benchmarks' | 'log_new'>('assays');

  // Form for logging new verified test
  const [formFood, setFormFood] = useState<string>('Tomato');
  const [formAnalyte, setFormAnalyte] = useState<string>('Chlorpyrifos');
  const [formConcentration, setFormConcentration] = useState<string>('0.05');
  const [formMrl, setFormMrl] = useState<string>('0.01');
  const [formStandard, setFormStandard] = useState<string>('EU EFSA (Regulation EC 396/2005)');
  const [formLab, setFormLab] = useState<string>('National Food Testing Core');
  const [formMethod, setFormMethod] = useState<string>('LC-MS/MS Multi-Residue');
  const [formSampleId, setFormSampleId] = useState<string>(`SMP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Filtered records
  const filteredRecords = records.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchFood = r.foodName.toLowerCase().includes(q);
      const matchChem = r.analyte.toLowerCase().includes(q);
      const matchLab = r.testingLab.toLowerCase().includes(q);
      const matchSample = r.sampleId.toLowerCase().includes(q);
      if (!matchFood && !matchChem && !matchLab && !matchSample) return false;
    }
    return true;
  });

  const handleAddNewAssay = (e: React.FormEvent) => {
    e.preventDefault();
    const conc = parseFloat(formConcentration) || 0;
    const mrl = parseFloat(formMrl) || 0;
    const status: ChemicalSafetyStatus = conc <= mrl ? 'WITHIN LIMIT' : 'EXCEEDS LIMIT';

    const newRecord: ChemicalTestRecord = {
      id: `CHEM-${Date.now().toString().slice(-4)}`,
      foodName: formFood,
      analyte: formAnalyte,
      measuredConcentration: conc,
      unit: 'mg/kg',
      mrlLimit: mrl,
      status,
      countryOrStandard: formStandard,
      officialMrlSource: 'Official Regulatory Schedule',
      testingLab: formLab,
      testMethod: formMethod,
      sampleId: formSampleId,
      testDate: new Date().toISOString().split('T')[0],
      reportRef: `REP-${Math.floor(10000 + Math.random() * 90000)}`,
      notes: 'User verified laboratory submission.'
    };

    setRecords([newRecord, ...records]);
    setFormSuccessMessage(`Assay record logged: ${formFood} tested for ${formAnalyte}. Result: ${status}.`);
    setActiveTab('assays');
    setTimeout(() => setFormSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Critical Scientific Directive Header */}
      <div className="bg-amber-950/30 border border-amber-800/80 rounded-2xl p-5 shadow-xl text-amber-200 text-xs space-y-2">
        <div className="flex items-center space-x-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <h3 className="text-sm font-bold text-amber-300">
            Mandatory Scientific Notice: Optical Vision vs. Chemical Analysis
          </h3>
        </div>
        <p className="leading-relaxed text-amber-200/90">
          A standard RGB camera, optical lenses, and Teachable Machine AI models recognize visual surface morphology only.
          They <strong>CANNOT</strong> detect invisible molecular pesticide residues, formalin baths, heavy metal ions, or chemical adulterants.
          A fruit that looks fresh and glossy can still exceed legal Maximum Residue Limits (MRL). The records below are sourced strictly from
          certified chromatography assays (LC-MS/MS, GC-MS, HPLC).
        </p>
      </div>

      {/* Navigation & Metrics Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
              <span>Chemical Safety & MRL Regulatory Portal</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verified analytical laboratory assays cross-referenced against international Codex, EU EFSA, US EPA, and FSSAI standards.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('assays')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'assays' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lab Assays ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'benchmarks' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              MRL Benchmarks
            </button>
            <button
              onClick={() => setActiveTab('log_new')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'log_new' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Lab Report</span>
            </button>
          </div>
        </div>

        {formSuccessMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-700 text-emerald-200 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{formSuccessMessage}</span>
          </div>
        )}

        {/* Search & Filter on Assays */}
        {activeTab === 'assays' && (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-800">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by commodity, analyte (e.g. Chlorpyrifos, Formalin), or Sample ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 shrink-0">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="ALL">All Statuses</option>
                <option value="WITHIN LIMIT">WITHIN LIMIT</option>
                <option value="EXCEEDS LIMIT">EXCEEDS LIMIT</option>
                <option value="NOT VERIFIED">NOT VERIFIED</option>
                <option value="INCONCLUSIVE">INCONCLUSIVE</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: VERIFIED LAB ASSAYS LIST */}
      {activeTab === 'assays' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecords.map((r) => {
              const isWithin = r.status === 'WITHIN LIMIT';
              const isExceed = r.status === 'EXCEEDS LIMIT';

              return (
                <div
                  key={r.id}
                  className={`p-5 rounded-2xl bg-slate-900 border transition-all shadow-xl space-y-3.5 ${
                    isWithin
                      ? 'border-emerald-900/50 hover:border-emerald-500/50'
                      : isExceed
                      ? 'border-red-900/60 hover:border-red-500/60 bg-red-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {r.sampleId} • {r.testDate}
                      </span>
                      <h3 className="text-base font-bold text-white">{r.foodName}</h3>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-300 mt-0.5">
                        <span className="font-semibold text-emerald-400">{r.analyte}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-mono">{r.testMethod}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1 ${
                        isWithin
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isExceed
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isWithin ? <ShieldCheck className="w-3.5 h-3.5 mr-1" /> : <ShieldAlert className="w-3.5 h-3.5 mr-1" />}
                      <span>{r.status}</span>
                    </span>
                  </div>

                  {/* Quantitative Concentrations Bar */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Measured Concentration:</span>
                      <span className={`font-mono font-bold ${isExceed ? 'text-red-400' : 'text-emerald-400'}`}>
                        {r.measuredConcentration} {r.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Applicable MRL:</span>
                      <span className="font-mono text-slate-300 font-semibold">
                        {r.mrlLimit} {r.unit} ({r.countryOrStandard})
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isExceed ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{
                          width: `${Math.min(100, (r.measuredConcentration / (r.mrlLimit * 1.5 || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Laboratory Reference Details */}
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{r.testingLab}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono text-[11px] truncate">Report: {r.reportRef}</span>
                    </div>
                  </div>

                  {r.notes && (
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 italic">
                      "{r.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {filteredRecords.length === 0 && (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              No chemical records matched your search query.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OFFICIAL MRL BENCHMARK STANDARDS */}
      {activeTab === 'benchmarks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>International Maximum Residue Limit (MRL) Schedule</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Comparative tolerance limits enforced by Codex Alimentarius, EU EFSA, and US EPA.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2.5 px-3">Commodity</th>
                  <th className="py-2.5 px-3">Pesticide / Analyte</th>
                  <th className="py-2.5 px-3">Codex (mg/kg)</th>
                  <th className="py-2.5 px-3">EU EFSA (mg/kg)</th>
                  <th className="py-2.5 px-3">US EPA (mg/kg)</th>
                  <th className="py-2.5 px-3">Toxicological Concern</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {OFFICIAL_MRL_BENCHMARKS.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">{b.commodity}</td>
                    <td className="py-3 px-3 text-emerald-400 font-medium">{b.pesticide}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{b.codexLimit}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{b.euLimit}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{b.usEpaLimit}</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{b.primaryRisk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOG NEW VERIFIED LAB ASSAY */}
      {activeTab === 'log_new' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <span>Log Certified Laboratory Assay</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add genuine analytical measurements with sample IDs, testing protocols, and laboratory references.
            </p>
          </div>

          <form onSubmit={handleAddNewAssay} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Food / Commodity Name</label>
                <input
                  type="text"
                  required
                  value={formFood}
                  onChange={(e) => setFormFood(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Chemical Analyte / Pesticide</label>
                <input
                  type="text"
                  required
                  value={formAnalyte}
                  onChange={(e) => setFormAnalyte(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Measured Concentration (mg/kg)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={formConcentration}
                  onChange={(e) => setFormConcentration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Applicable MRL (mg/kg)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={formMrl}
                  onChange={(e) => setFormMrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Regulatory Standard</label>
                <select
                  value={formStandard}
                  onChange={(e) => setFormStandard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="Codex Alimentarius (FAO/WHO)">Codex Alimentarius (FAO/WHO)</option>
                  <option value="EU EFSA (Regulation EC 396/2005)">EU EFSA (Regulation EC 396/2005)</option>
                  <option value="US EPA / FDA FSMA">US EPA / FDA FSMA</option>
                  <option value="FSSAI Standard (India)">FSSAI Standard (India)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Test Method</label>
                <select
                  value={formMethod}
                  onChange={(e) => setFormMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="LC-MS/MS Multi-Residue">LC-MS/MS Multi-Residue</option>
                  <option value="GC-MS/MS QuEChERS">GC-MS/MS QuEChERS</option>
                  <option value="HPLC-DAD Chromatograph">HPLC-DAD Chromatograph</option>
                  <option value="Spectrophotometric Nash Method">Spectrophotometric Nash Method</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Testing Laboratory</label>
                <input
                  type="text"
                  required
                  value={formLab}
                  onChange={(e) => setFormLab(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Sample ID</label>
                <input
                  type="text"
                  required
                  value={formSampleId}
                  onChange={(e) => setFormSampleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('assays')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-950 flex items-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save Laboratory Assay</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

import { ChemicalTestRecord } from '../types';

export const CHEMICAL_SAFETY_RECORDS: ChemicalTestRecord[] = [
  {
    id: 'CHEM-2024-001',
    foodName: 'Tomato (Roma / Plum)',
    analyte: 'Chlorpyrifos',
    measuredConcentration: 0.14,
    unit: 'mg/kg',
    mrlLimit: 0.01,
    status: 'EXCEEDS LIMIT',
    countryOrStandard: 'EU EFSA (Regulation EC 396/2005)',
    officialMrlSource: 'EU Pesticide Database / EFSA Scientific Opinion',
    testingLab: 'Eurofins Agro Testing Services, Central Lab',
    testMethod: 'LC-MS/MS (Liquid Chromatography Tandem Mass Spectrometry)',
    sampleId: 'SMP-TM-2024-9982',
    testDate: '2024-10-14',
    reportRef: 'EF-AGRO-772910-R1',
    notes: 'Sample exceeds EU default MRL of 0.01 mg/kg for banned organophosphate chlorpyrifos. Pre-harvest interval (PHI) was violated.'
  },
  {
    id: 'CHEM-2024-002',
    foodName: 'Apple (Red Delicious)',
    analyte: 'Diphenylamine (DPA)',
    measuredConcentration: 0.04,
    unit: 'mg/kg',
    mrlLimit: 0.10,
    status: 'WITHIN LIMIT',
    countryOrStandard: 'Codex Alimentarius (FAO/WHO)',
    officialMrlSource: 'Codex Pesticide Residues in Food Online Database',
    testingLab: 'SGS Agri-Food Laboratories',
    testMethod: 'GC-MS/MS (Gas Chromatography Triple Quadrupole)',
    sampleId: 'SMP-AP-2024-1142',
    testDate: '2024-11-02',
    reportRef: 'SGS-RES-2024-5541',
    notes: 'Post-harvest superficial scald inhibitor detected. Residue level is well below Codex MRL limit of 0.10 mg/kg.'
  },
  {
    id: 'CHEM-2024-003',
    foodName: 'Apple (Post-Harvest DPA / Fungicide Treated)',
    analyte: 'Carbendazim',
    measuredConcentration: 0.85,
    unit: 'mg/kg',
    mrlLimit: 0.20,
    status: 'EXCEEDS LIMIT',
    countryOrStandard: 'US EPA / FDA Food Safety Modernization Act',
    officialMrlSource: '40 CFR Part 180 - Pesticide Tolerances',
    testingLab: 'ToxiFruit Analytical Toxicology Core',
    testMethod: 'HPLC-DAD (High Performance Liquid Chromatography with Diode-Array)',
    sampleId: 'TF-SAMP-APP-091',
    testDate: '2024-09-18',
    reportRef: 'TF-REP-88219-T1',
    notes: 'Systemic benzimidazole fungicide exceeded allowable tolerance limit due to repeated cold-storage wash dipping.'
  },
  {
    id: 'CHEM-2024-004',
    foodName: 'Cauliflower (Formalin Preserved Curd)',
    analyte: 'Formaldehyde (Free Formalin)',
    measuredConcentration: 12.4,
    unit: 'mg/kg',
    mrlLimit: 0.00,
    status: 'EXCEEDS LIMIT',
    countryOrStandard: 'FSSAI (Food Safety and Standards Authority of India)',
    officialMrlSource: 'FSSAI Food Safety and Standards (Prohibition and Restriction on Sales) Regulations',
    testingLab: 'National Food Quality Laboratory (NFQL)',
    testMethod: 'Spectrophotometric Acetylacetone Nash Reagent Method & HPLC confirmation',
    sampleId: 'SMP-CF-2024-4011',
    testDate: '2024-10-29',
    reportRef: 'NFQL-TOX-2024-3312',
    notes: 'ZERO TOLERANCE: Free formaldehyde intentionally added as unauthorized antimicrobial and whitening dip. Severe violation.'
  },
  {
    id: 'CHEM-2024-005',
    foodName: 'Grapes (Sulfur Dioxide Pad Treated)',
    analyte: 'Sulfur Dioxide (SO2 Residue)',
    measuredConcentration: 8.2,
    unit: 'mg/kg',
    mrlLimit: 10.0,
    status: 'WITHIN LIMIT',
    countryOrStandard: 'Codex Alimentarius / US EPA',
    officialMrlSource: 'Codex Standard 192-1995 for Food Additives',
    testingLab: 'BioQuality Postharvest Analytical Facility',
    testMethod: 'Optimized Monier-Williams Titrimetric Method',
    sampleId: 'SMP-GR-2024-7821',
    testDate: '2024-10-05',
    reportRef: 'BQ-LAB-9921',
    notes: 'SO2 residues from maritime generator pads remain within legal threshold (< 10 mg/kg). Declared as sulfur-treated export lot.'
  },
  {
    id: 'CHEM-2024-006',
    foodName: 'Banana (Cavendish)',
    analyte: 'Thiabendazole',
    measuredConcentration: 1.15,
    unit: 'mg/kg',
    mrlLimit: 5.00,
    status: 'WITHIN LIMIT',
    countryOrStandard: 'Codex Alimentarius (FAO/WHO)',
    officialMrlSource: 'Codex Alimentarius Pesticides Section',
    testingLab: 'Intertek Food Services Testing Lab',
    testMethod: 'LC-MS/MS Multi-Residue Screen',
    sampleId: 'SMP-BN-2024-6019',
    testDate: '2024-11-01',
    reportRef: 'INTK-F-2024-11029',
    notes: 'Post-harvest crown rot protectant detected primarily in peel; whole fruit concentration compliant with 5.0 mg/kg limit.'
  },
  {
    id: 'CHEM-2024-007',
    foodName: 'Spinach (Savoy)',
    analyte: 'Acetamiprid',
    measuredConcentration: 0.65,
    unit: 'mg/kg',
    mrlLimit: 3.00,
    status: 'WITHIN LIMIT',
    countryOrStandard: 'US EPA Pesticide Residue Program',
    officialMrlSource: 'EPA Electronic Code of Federal Regulations',
    testingLab: 'AgriSafe Laboratories Certified Lab',
    testMethod: 'LC-MS/MS QuEChERS Extraction',
    sampleId: 'SMP-SP-2024-3320',
    testDate: '2024-10-22',
    reportRef: 'AS-LAB-SP-8841',
    notes: 'Neonicotinoid insecticide applied for aphid vector suppression. Concentration compliant with US EPA 3.0 mg/kg tolerance.'
  },
  {
    id: 'CHEM-2024-008',
    foodName: 'Capsicum (Bell Pepper Green & Red)',
    analyte: 'Imidacloprid',
    measuredConcentration: 0.18,
    unit: 'mg/kg',
    mrlLimit: 0.50,
    status: 'WITHIN LIMIT',
    countryOrStandard: 'Codex Alimentarius (FAO/WHO)',
    officialMrlSource: 'Codex Alimentarius Index',
    testingLab: 'Eurofins Central Lab',
    testMethod: 'LC-MS/MS',
    sampleId: 'SMP-CP-2024-8190',
    testDate: '2024-10-18',
    reportRef: 'EF-CP-49021',
    notes: 'Systemic insecticide measured after greenhouse drip application. Level complies with standards.'
  },
  {
    id: 'CHEM-2024-009',
    foodName: 'Tomato (Alternaria Black Rot Infestation)',
    analyte: 'Alternariol (Mycotoxin)',
    measuredConcentration: 42.0,
    unit: 'mcg/kg',
    mrlLimit: 10.0,
    status: 'EXCEEDS LIMIT',
    countryOrStandard: 'EU Commission Recommendation (EU) 2022/553',
    officialMrlSource: 'Official Journal of the European Union on Alternaria toxins',
    testingLab: 'Toxicology Mycotoxin Research Laboratory',
    testMethod: 'UHPLC-MS/MS Multi-Mycotoxin Assay',
    sampleId: 'SMP-TM-MYCO-009',
    testDate: '2024-09-30',
    reportRef: 'TM-MYCO-2024-190',
    notes: 'Fungal colonization resulted in critical accumulation of alternariol and tentoxin. Food safety hazard.'
  },
  {
    id: 'CHEM-2024-010',
    foodName: 'Strawberry (Fragaria)',
    analyte: 'Captan',
    measuredConcentration: 2.10,
    unit: 'mg/kg',
    mrlLimit: 5.00,
    status: 'WITHIN LIMIT',
    countryOrStandard: 'Codex Alimentarius',
    officialMrlSource: 'Codex MRL Standards',
    testingLab: 'SGS Fruit & Berry Certified Center',
    testMethod: 'GC-MS Selective Ion Monitoring',
    sampleId: 'SMP-SB-2024-019',
    testDate: '2024-11-04',
    reportRef: 'SGS-SB-44910',
    notes: 'Contact phthalimide fungicide applied during flowering against gray mold. Complies with 5.0 mg/kg limit.'
  }
];

export interface MRLReferenceItem {
  commodity: string;
  pesticide: string;
  codexLimit: number;
  euLimit: number;
  usEpaLimit: number;
  unit: string;
  primaryRisk: string;
}

export const OFFICIAL_MRL_BENCHMARKS: MRLReferenceItem[] = [
  { commodity: 'Apple', pesticide: 'Chlorpyrifos', codexLimit: 0.5, euLimit: 0.01, usEpaLimit: 0.01, unit: 'mg/kg', primaryRisk: 'Neurotoxicity (Organophosphate cholinesterase inhibitor)' },
  { commodity: 'Apple', pesticide: 'Carbendazim', codexLimit: 0.5, euLimit: 0.1, usEpaLimit: 0.2, unit: 'mg/kg', primaryRisk: 'Endocrine disruption & reproductive toxicity' },
  { commodity: 'Apple', pesticide: 'Diphenylamine', codexLimit: 0.1, euLimit: 0.05, usEpaLimit: 0.1, unit: 'mg/kg', primaryRisk: 'Potential nitrosamine precursor' },
  { commodity: 'Banana', pesticide: 'Thiabendazole', codexLimit: 5.0, euLimit: 6.0, usEpaLimit: 3.0, unit: 'mg/kg', primaryRisk: 'Thyroid function disturbance' },
  { commodity: 'Banana', pesticide: 'Ethephon', codexLimit: 2.0, euLimit: 1.0, usEpaLimit: 2.0, unit: 'mg/kg', primaryRisk: 'Mucosal irritation & acetylcholinesterase inhibition' },
  { commodity: 'Tomato', pesticide: 'Chlorpyrifos', codexLimit: 0.5, euLimit: 0.01, usEpaLimit: 0.01, unit: 'mg/kg', primaryRisk: 'Developmental neurotoxicity' },
  { commodity: 'Tomato', pesticide: 'Acetamiprid', codexLimit: 0.5, euLimit: 0.5, usEpaLimit: 0.2, unit: 'mg/kg', primaryRisk: 'Neonicotinoid neural receptor affinity' },
  { commodity: 'Grapes', pesticide: 'Sulfur Dioxide', codexLimit: 10.0, euLimit: 10.0, usEpaLimit: 10.0, unit: 'mg/kg', primaryRisk: 'Severe bronchospasm in sulfite-sensitive individuals' },
  { commodity: 'Spinach', pesticide: 'Imidacloprid', codexLimit: 1.0, euLimit: 0.01, usEpaLimit: 3.5, unit: 'mg/kg', primaryRisk: 'Pollinator ecosystem hazard & chronic low-dose toxicity' },
  { commodity: 'Cauliflower', pesticide: 'Formalin (Adulterant)', codexLimit: 0.0, euLimit: 0.0, usEpaLimit: 0.0, unit: 'mg/kg', primaryRisk: 'Group 1 Human Carcinogen (Nasopharyngeal cancer)' }
];

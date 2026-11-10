export type FoodCategory = 'Fruit' | 'Vegetable';

export type FreshnessGrade = 'Fresh-looking' | 'Visually damaged' | 'Rotten-looking' | 'Uncertain / Inconclusive';

export type ChemicalSafetyStatus = 'WITHIN LIMIT' | 'EXCEEDS LIMIT' | 'NOT VERIFIED' | 'INCONCLUSIVE';

export interface NutritionalInfo {
  servingSize: string; // e.g. "100g"
  calories: number; // kcal
  carbohydrates: number; // g
  protein: number; // g
  fat: number; // g
  fiber: number; // g
  sugars: number; // g
  glycemicIndex: number;
  vitamins: {
    vitaminC_mg: number;
    vitaminA_mcg?: number;
    vitaminB6_mg?: number;
    vitaminK_mcg?: number;
    folate_mcg?: number;
    potassium_mg: number;
    calcium_mg: number;
    iron_mg: number;
  };
  healthBenefits: string[];
  culinaryUses: string[];
  storageAdvice: string;
}

export interface ChemicalTestRecord {
  id: string;
  foodName: string;
  analyte: string; // e.g. "Chlorpyrifos", "Formalin", "Acetamiprid"
  measuredConcentration: number;
  unit: string; // e.g. "mg/kg"
  mrlLimit: number; // Maximum Residue Limit in mg/kg
  status: ChemicalSafetyStatus;
  countryOrStandard: string; // e.g. "Codex Alimentarius", "EU EFSA", "US EPA", "FSSAI"
  officialMrlSource: string;
  testingLab: string;
  testMethod: string; // e.g. "LC-MS/MS", "GC-MS", "HPLC", "Rapid Immunoassay"
  sampleId: string;
  testDate: string;
  reportRef: string;
  notes?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  scientificName: string;
  category: FoodCategory;
  libraryType: 'fresh_reference' | 'treated_labeled' | 'general';
  datasetSource: string; // e.g. "Fruits-360", "ToxiFruit Dataset", "USDA FoodData Central"
  datasetLabel: string; // e.g. "Apple_Fresh_A1", "Banana_Treated_Ethephon"
  imageUrl: string;
  freshnessStatus: FreshnessGrade;
  freshnessScore: number; // 0 - 100
  shelfLifeDays: number;
  optimalTemp: string;
  chemicalEvidence: ChemicalSafetyStatus;
  chemicalTestsCount: number;
  nutrition: NutritionalInfo;
  description: string;
  license: string;
}

export interface ModelPrediction {
  className: string;
  probability: number;
}

export interface DetectionResult {
  topMatch: string;
  confidence: number;
  freshnessEstimate: FreshnessGrade;
  matchedFoodItem?: FoodItem;
  allPredictions: ModelPrediction[];
  timestamp: string;
  source: 'live_webcam' | 'uploaded_image' | 'sample_library';
}

export interface TeachableMachineConfig {
  modelUrl: string;
  isCustomUrl: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  labels: string[];
}

export interface HardwareSensorData {
  deviceId: string;
  ipAddress: string;
  ssid: string;
  rssi: number;
  uptimeSeconds: number;
  lastHeartbeat: string;
  temperatureC: number;
  humidityPercent: number;
  mq135AirQualityPpm: number;
  electrochemicalResidueMv: number;
  opticalTurbidityNtu: number;
  status: 'ONLINE' | 'OFFLINE' | 'TRANSMITTING';
}

export type AngleSlot = 'side1' | 'side2' | 'side3' | 'side4';

export interface MultiAngleCaptureState {
  side1: string | null; // Front 0°
  side2: string | null; // Right 90°
  side3: string | null; // Back 180°
  side4: string | null; // Left / Top 270°
}

export type EdibilityVerdict =
  | 'SAFE FOR EATING'
  | 'EDIBLE WITH PRECAUTIONS (WASH & PEEL)'
  | 'UNSAFE / DO NOT EAT';

export interface Inspection360Report {
  id: string;
  timestamp: string;
  // Section 1: Capture meta
  capturedAnglesCount: number;
  images: MultiAngleCaptureState;
  
  // Section 2: Fruit or Vegetable classification
  classification: FoodCategory; // 'Fruit' | 'Vegetable'
  identifiedProduce: string;
  scientificName: string;
  variety: string;
  confidencePercent: number;
  botanicalFamily: string;

  // Section 3: Visual inspection (color, texture, shape, safe for eating?)
  colorAnalysis: {
    dominantHues: string;
    pigmentUniformity: string;
    discolorationOrSpots: string;
  };
  textureAnalysis: {
    surfaceGloss: string;
    epidermalTurgor: string;
    bruisingOrLesions: string;
  };
  shapeAnalysis: {
    symmetry: string;
    curvatureAndCavity: string;
    structuralDefects: string;
  };
  edibilityVerdict: EdibilityVerdict;
  edibilityReason: string;
  freshnessGrade: FreshnessGrade;
  freshnessScore: number;

  // Section 4: Chemical & pesticide monitor (roughly how much chemical is used)
  chemicalMonitoring: {
    estimatedChemicalLevel: string; // e.g. "Low (0.04 mg/kg)"
    pesticideRiskGrade: 'LOW' | 'MODERATE' | 'HIGH';
    typicalPesticidesUsed: { name: string; type: string; purpose: string }[];
    estimatedResidueMgKg: number;
    applicableMrlMgKg: number;
    mrlStatus: 'WITHIN LIMIT' | 'EXCEEDS LIMIT';
    regulatoryStandard: string;
    realSensorMonitoring: {
      vocAirQualityPpm: number;
      electrochemicalMv: number;
      deviceNode: string;
    };
    decontaminationAdvice: string[];
  };
}

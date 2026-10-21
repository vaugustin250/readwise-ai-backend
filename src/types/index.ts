export interface ReadingBuddy {
  id: string;
  name: string;
  series: string;
  tagline: string;
  badge: string;
  emoji: string;
  superpower: string;
  themePrimary: string;
  themeSecondary: string;
  themeShadow: string;
  themeSurface: string;
  textColor: string;
  cheerQuote: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  grade: string;
  language: string;
}

export interface GazePoint {
  x: number; // normalized 0..1 across passage width
  y: number; // normalized 0..1 across passage height
  timestamp: number;
  wordIndex: number;
  dwellMs: number;
  isRegression: boolean;
  saccadeAmplitudePx?: number;
}

export type WordFluencyStatus = 'unread' | 'fluent' | 'hesitated' | 'regressed' | 'mispronounced';

export interface WordTelemetry {
  word: string;
  index: number;
  status: WordFluencyStatus;
  dwellMs: number;
  hesitationMs: number;
  regressionCount: number;
  spokenTranscript?: string;
  pronunciationConfidence: number;
}

export interface LimeRule {
  feature: string;
  label: string;
  condition: string;
  weight: number; // positive = pushes toward risk, negative = protective
  measuredValue: string;
  normativeRange: string;
}

export interface ModalitySubScores {
  ocularRisk: number; // 0..1
  acousticRisk: number; // 0..1
  cognitiveRisk: number; // 0..1
}

export interface SeventeenFeatureVector {
  // 5 ETDD70 Ocular Biomechanical Features
  dwell_time_trial: number;
  n_regress_trial: number;
  mean_fix_dur_trial: number;
  ratio_progress_regress_trial: number;
  mean_sacc_ampl_trial: number;
  // 2 Acoustic Speech Features
  speech_hesitation_rate: number;
  speech_phoneme_stability: number;
  // 2 Cognitive & Phonological Features
  cognitive_working_memory: number;
  phonological_awareness_score: number;
  // 8 Stage-1 1D-CNN + BiLSTM Deep Gaze Sequence Embeddings
  gaze_emb_0: number;
  gaze_emb_1: number;
  gaze_emb_2: number;
  gaze_emb_3: number;
  gaze_emb_4: number;
  gaze_emb_5: number;
  gaze_emb_6: number;
  gaze_emb_7: number;
}

export interface AssessmentResult {
  childId: number;
  riskProbability: number;
  screeningLevel: string;
  confidenceScore: number;
  baseValueShap: number;
  featureContributionsShap: Record<string, number>;
  all17Shap: Record<string, number>;
  limeExplanation: {
    intercept: number;
    localPrediction: number;
    rSquared: number;
    rules: LimeRule[];
  };
  modalitySubScores: ModalitySubScores;
  features17: SeventeenFeatureVector;
  readingSpeedWpm: number;
  wordAccuracyPct: number;
  gazeTrajectory: GazePoint[];
  wordTelemetry: WordTelemetry[];
  personalizedLearningPlan: {
    primary_focus?: string;
    recommended_activities?: string[];
    weekly_schedule?: string;
    clinical_rationale?: string;
    [key: string]: unknown;
  };
  disclaimer: string;
  captureMode?: 'live_sensors' | 'benchmark_preset';
  presetName?: string;
}

export interface ProgressRecord {
  date: string;
  risk_score: number;
  regressions: number;
  hesitations: number;
  reading_speed_wpm: number;
}

export interface User {
  id?: number;
  email: string;
  token?: string;
}

export type ScreenRoute =
  | 'onboarding'
  | 'login'
  | 'dashboard'
  | 'add_child'
  | 'assessment_selection'
  | 'buddy_select'
  | 'reading_assessment'
  | 'cognitive_game'
  | 'results'
  | 'learning_activity'
  | 'progress';

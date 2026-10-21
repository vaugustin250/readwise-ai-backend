class CognitiveScoreService {
  private static instance: CognitiveScoreService;
  private workingMemoryCache: Record<string, number> = {};
  private phonologicalCache: Record<string, number> = {};

  private constructor() {
    try {
      const wm = localStorage.getItem('readwise_wm_scores');
      const ph = localStorage.getItem('readwise_ph_scores');
      if (wm) this.workingMemoryCache = JSON.parse(wm);
      if (ph) this.phonologicalCache = JSON.parse(ph);
    } catch (_) {
      // Ignore
    }
  }

  public static getInstance(): CognitiveScoreService {
    if (!CognitiveScoreService.instance) {
      CognitiveScoreService.instance = new CognitiveScoreService();
    }
    return CognitiveScoreService.instance;
  }

  public recordScores(childId: string, workingMemory: number, phonologicalAwareness: number) {
    this.workingMemoryCache[childId] = workingMemory;
    this.phonologicalCache[childId] = phonologicalAwareness;
    try {
      localStorage.setItem('readwise_wm_scores', JSON.stringify(this.workingMemoryCache));
      localStorage.setItem('readwise_ph_scores', JSON.stringify(this.phonologicalCache));
    } catch (_) {
      // Ignore
    }
  }

  public getWorkingMemory(childId: string): number {
    return this.workingMemoryCache[childId] ?? 80.0;
  }

  public getPhonologicalAwareness(childId: string): number {
    return this.phonologicalCache[childId] ?? 82.0;
  }
}

export const cognitiveScoreService = CognitiveScoreService.getInstance();

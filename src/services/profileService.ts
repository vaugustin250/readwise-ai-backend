import { ChildProfile, ProgressRecord } from '../types';
import { authService } from './authService';

const DEFAULT_CHILDREN: ChildProfile[] = [
  { id: '1', name: 'Arun', age: 9, grade: 'Grade 4', language: 'English' },
  { id: '2', name: 'Maya', age: 8, grade: 'Grade 3', language: 'English' },
];

const DEFAULT_HISTORY: ProgressRecord[] = [
  { date: 'Session 1', risk_score: 0.84, regressions: 34, hesitations: 5.2, reading_speed_wpm: 58 },
  { date: 'Session 2', risk_score: 0.76, regressions: 28, hesitations: 4.1, reading_speed_wpm: 66 },
  { date: 'Session 3', risk_score: 0.68, regressions: 22, hesitations: 3.2, reading_speed_wpm: 74 },
  { date: 'Session 4', risk_score: 0.52, regressions: 16, hesitations: 2.3, reading_speed_wpm: 85 },
];

class ProfileService {
  private static instance: ProfileService;
  private localCache: ChildProfile[] = [];
  public baseUrl = 'https://readwise-ai-backend.onrender.com';

  private constructor() {
    try {
      const saved = localStorage.getItem('readwise_profiles');
      if (saved) {
        this.localCache = JSON.parse(saved);
      } else {
        this.localCache = [...DEFAULT_CHILDREN];
        localStorage.setItem('readwise_profiles', JSON.stringify(this.localCache));
      }
    } catch (_) {
      this.localCache = [...DEFAULT_CHILDREN];
    }
  }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  public async getChildren(): Promise<ChildProfile[]> {
    const token = authService.getAuthToken();
    if (token) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/profiles/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            this.localCache = list.map((item: any) => ({
              id: item.id?.toString() || '1',
              name: item.name || 'Child',
              age: item.age || 9,
              grade: item.grade || 'Grade 4',
              language: item.language || 'English',
            }));
            localStorage.setItem('readwise_profiles', JSON.stringify(this.localCache));
            return this.localCache;
          }
        }
      } catch (e) {
        console.warn('Backend profiles note: using local cache', e);
      }
    }
    return [...this.localCache];
  }

  public async addChild(child: Omit<ChildProfile, 'id'>): Promise<ChildProfile> {
    const newChild: ChildProfile = {
      ...child,
      id: (Date.now() % 100000).toString(),
    };

    const token = authService.getAuthToken();
    if (token) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/profiles/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: child.name,
            age: child.age,
            grade: child.grade,
            language: child.language || 'English',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          newChild.id = data.id?.toString() || newChild.id;
        }
      } catch (e) {
        console.warn('Backend add profile offline fallback:', e);
      }
    }

    this.localCache.push(newChild);
    localStorage.setItem('readwise_profiles', JSON.stringify(this.localCache));
    return newChild;
  }

  public async getProgressHistory(childId: string): Promise<ProgressRecord[]> {
    const token = authService.getAuthToken();
    if (token) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/assessments/progress/${childId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            return list.map((r: any) => ({
              date: r.date || 'Recent',
              risk_score: Number(r.risk_score) || 0.5,
              regressions: r.gaze_regressions ?? 18,
              hesitations: Number(r.reading_hesitations) || 2.1,
              reading_speed_wpm: 75.0,
            }));
          }
        }
      } catch (e) {
        console.warn('Progress history fetch fallback to local history:', e);
      }
    }

    // Check localStorage history for this child
    try {
      const storedHistory = localStorage.getItem(`readwise_history_${childId}`);
      if (storedHistory) {
        return JSON.parse(storedHistory);
      }
    } catch (_) {
      // Ignore
    }

    return [...DEFAULT_HISTORY];
  }

  public saveAssessmentToHistory(childId: string, riskScore: number, regressions: number, hesitations: number) {
    try {
      const current = this.getProgressHistoryDirect(childId);
      const sessionNum = current.length + 1;
      const newRecord: ProgressRecord = {
        date: `Session ${sessionNum}`,
        risk_score: Number(riskScore.toFixed(2)),
        regressions,
        hesitations: Number(hesitations.toFixed(1)),
        reading_speed_wpm: Math.min(110, Math.max(50, Math.round(95 - riskScore * 40))),
      };
      const updated = [...current, newRecord];
      localStorage.setItem(`readwise_history_${childId}`, JSON.stringify(updated));
    } catch (_) {
      // Ignore
    }
  }

  private getProgressHistoryDirect(childId: string): ProgressRecord[] {
    try {
      const stored = localStorage.getItem(`readwise_history_${childId}`);
      if (stored) return JSON.parse(stored);
    } catch (_) {
      // Ignore
    }
    return [...DEFAULT_HISTORY];
  }
}

export const profileService = ProfileService.getInstance();

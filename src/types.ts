export interface AnalysisResult {
  licensePlates: string[];
  platesByColor?: {
    [color: string]: string[];
  };
  carCrashDetected: boolean;
  crashDescription?: string;
  suspiciousActivity: {
    description: string;
    riskLevel: 'bajo' | 'medio' | 'alto';
    recommendation: string;
  };
  pacoraSecurityTips: string[];
}

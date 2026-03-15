export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Clause {
  id: string;
  text: string;
  explanation: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  recommendation?: string;
  category?: string; // e.g., "Privacy", "Liability", "Termination"
}

export interface DocumentAnalysis {
  id: string;
  documentName: string;
  overallRiskScore: number; // 0-100
  clauses: Clause[];
  summary: string;
  createdAt: Date;
  status: "PENDING" | "COMPLETED" | "FAILED";
}

export interface NegotiationRequest {
  documentId: string;
  targetClauseIds: string[];
  userNotes?: string;
}

export interface NegotiationEmail {
  id: string;
  subject: string;
  body: string;
  targetClauses: string[];
  generatedAt: Date;
}

// API Response Wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

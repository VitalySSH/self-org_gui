export interface CriticismPointResponse {
  criticism_text: string;
  severity: string;
  evidence: string[];
  suggested_fix: string;
  reasoning: string;
}

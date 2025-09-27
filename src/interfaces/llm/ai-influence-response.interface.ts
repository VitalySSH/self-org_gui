export interface AIInfluenceResponse {
  solution_id: string;
  total_versions: number;
  ai_interactions: number;
  collective_influence_percentage: number;
  ai_contribution_timeline: Record<string, any>[];
}

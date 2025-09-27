export interface IntegrationRequest {
  solution_id: string;
  interaction_id: string;
  accepted_items: Record<string, any>[];
  user_modifications?: string[];
}

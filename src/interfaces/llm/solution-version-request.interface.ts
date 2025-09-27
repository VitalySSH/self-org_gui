export interface SolutionVersionRequest {
  solution_id: string;
  new_content: string;
  change_description: string;
  influenced_by_interactions?: string[];
}

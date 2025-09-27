import { ImprovementSuggestionResponse } from 'src/interfaces';

export interface ImprovementsResponse {
  interaction_id: string;
  suggestions: ImprovementSuggestionResponse[];
  total_count: number;
}

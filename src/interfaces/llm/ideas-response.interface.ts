import { CollectiveIdeaResponse } from 'src/interfaces';

export interface IdeasResponse {
  interaction_id: string;
  ideas: CollectiveIdeaResponse[];
  total_count: number;
}

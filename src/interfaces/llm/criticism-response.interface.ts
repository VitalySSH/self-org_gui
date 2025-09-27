import { CriticismPointResponse } from 'src/interfaces';

export interface CriticismResponse {
  interaction_id: string;
  criticisms: CriticismPointResponse[];
  total_count: number;
}

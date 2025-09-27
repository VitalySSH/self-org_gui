import { ItemResponse } from 'src/interfaces';

export interface InteractionResponse {
  interaction_id: string;
  item_responses: ItemResponse[];
}

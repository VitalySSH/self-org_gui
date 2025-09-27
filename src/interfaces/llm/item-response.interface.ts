import { ItemResponseType } from 'src/shared/types.ts';

export interface ItemResponse {
  item_index: number;
  response: ItemResponseType;
  reasoning?: string;
  modification?: string;
  original_text?: string;
}

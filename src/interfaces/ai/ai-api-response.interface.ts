import { AIResponseStatus } from 'src/shared/types.ts';

export interface AiApiResponse {
  status: AIResponseStatus;
  content: string;
}

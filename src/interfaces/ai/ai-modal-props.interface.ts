import { AiApiResponse } from 'src/interfaces/ai/ai-api-response.interface.ts';

export interface AiModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  request: () => Promise<AiApiResponse>;
}

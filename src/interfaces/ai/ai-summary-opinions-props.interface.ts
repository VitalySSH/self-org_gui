import { Resource } from 'src/shared/types.ts';

export interface AiSummaryOpinionsProps {
  visible: boolean;
  onClose: () => void;
  resource: Resource;
  ruleId?: string;
  initiativeId?: string;
}

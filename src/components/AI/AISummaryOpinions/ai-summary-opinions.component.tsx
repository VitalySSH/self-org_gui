import { AiSummaryOpinionsProps } from 'src/interfaces';
import { AIModal } from 'src/components/AI/AIModal/ai-modal.component.tsx';

export function AISummaryOpinions(props: AiSummaryOpinionsProps) {
  return (
    <AIModal visible={props.visible} onClose={props.onClose} />
  );
}
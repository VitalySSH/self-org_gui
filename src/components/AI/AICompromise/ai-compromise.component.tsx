import { AiResourceProps } from 'src/interfaces';
import { AIModal } from 'src/components/AI/AIModal/ai-modal.component.tsx';
import { AiApiResponse } from 'src/interfaces/ai/ai-api-response.interface.ts';


// Заглушка для вызова API
async function fetchAICompromise(): Promise<AiApiResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'OK',
        content: 'Здесь будет отображаться ответ LLM, в котором будут предложены различные варианты компрописных решений по данному голосованию.',
      });
    }, 2000);
  });
}

export function AiCompromise(props: AiResourceProps) {
  return (
    <AIModal
      visible={props.visible}
      onClose={props.onClose}
      title="Поиск компромиссов"
      request={fetchAICompromise}
    />
  );
}
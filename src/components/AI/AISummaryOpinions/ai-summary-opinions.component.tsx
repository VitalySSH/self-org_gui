import { AiResourceProps } from 'src/interfaces';
import { AIModal } from 'src/components/AI/AIModal/ai-modal.component.tsx';
import { AiApiResponse } from 'src/interfaces/ai/ai-api-response.interface.ts';

// Заглушка для вызова API
async function fetchAISummary(): Promise<AiApiResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'OK',
        content: 'Здесь будет отображаться ответ LLM, которая обобщит мнения участников голосования, предоставит статистические данные и ответит на любые вопросы, как если бы они были заданы коллективному разуму всех членов сообшества.',
      });
    }, 2000);
  });
}

export function AISummaryOpinions(props: AiResourceProps) {
  return (
    <AIModal
      visible={props.visible}
      onClose={props.onClose}
      title="Сумма мнений участников голосования"
      request={fetchAISummary}
    />
  );
}
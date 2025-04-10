import { Modal } from 'antd';
import { RecommendationModalProps } from 'src/interfaces';

export const RecommendationVotingModal = ({ open, onCancel }: RecommendationModalProps) => {
  return (
    <Modal
      title="Рекомендации по настройкам голосования"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div>
        <h4>Оптимальные значения:</h4>
        <ul>
          <li><strong>Кворум</strong>: 50-70% (обеспечивает активное участие)
          </li>
          <li><strong>Избирательный порог</strong>: 60-75% (баланс между гибкостью и решительностью)
          </li>
          <li><strong>Значимое меньшинство</strong>: 15-30% (учёт альтернативных мнений)
          </li>
        </ul>
        <p>Настройки влияют на процесс принятия решений. Регулируйте в
          зависимости от размера сообщества и важности вопросов.</p>
      </div>
    </Modal>
  );
};
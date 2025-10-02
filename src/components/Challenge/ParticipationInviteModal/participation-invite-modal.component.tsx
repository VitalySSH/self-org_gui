import { Modal, Button, Card } from 'antd';
import {
  UserOutlined,
  BulbOutlined,
  EditOutlined,
  TeamOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import './participation-invite-modal.component.scss';

interface ParticipationInviteModalProps {
  visible: boolean;
  onCancel: () => void;
  onUseAuthorSolution: () => void;
  onSelectDirection: () => void;
  onStartFromScratch: () => void;
  hasAuthorSolution: boolean;
  totalSolutions: number;
}

export function ParticipationInviteModal({
  visible,
  onCancel,
  onUseAuthorSolution,
  onSelectDirection,
  onStartFromScratch,
  hasAuthorSolution,
  totalSolutions,
}: ParticipationInviteModalProps) {
  const hasMultipleSolutions = totalSolutions > 0;

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      className="participation-invite-modal"
      destroyOnHidden
      keyboard
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
      }}
      wrapClassName="participation-invite-modal"
    >
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-icon">
            <TeamOutlined />
          </div>
          <div className="modal-text">
            <h2>Присоединиться к решению задачи</h2>
            <p>
              Выберите, как вы хотите начать работу над решением этой задачи. Вы
              всегда сможете изменить свое решение позже.
            </p>
          </div>
        </div>

        <div className="modal-scrollable-content">
          <div className="participation-options">
            {/* Вариант 1: Использовать решение автора */}
            {hasAuthorSolution && (
              <Card
                className="option-card author-solution-option"
                hoverable
                onClick={onUseAuthorSolution}
              >
                <div className="option-content">
                  <div className="option-icon">
                    <UserOutlined />
                  </div>
                  <div className="option-info">
                    <h3>Взять за основу решение автора</h3>
                    <p>
                      Скопировать текст решения автора как отправную точку. Вы
                      сможете изменять и дополнять его по своему усмотрению.
                    </p>
                    <div className="option-features">
                      <span>✓ Быстрый старт</span>
                      <span>✓ Проверенная основа</span>
                      <span>✓ Готовая структура</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Вариант 2: Выбрать направление из КИ */}
            {hasMultipleSolutions && (
              <Card
                className="option-card ai-direction-option"
                hoverable
                onClick={onSelectDirection}
              >
                <div className="option-content">
                  <div className="option-icon">
                    <RobotOutlined />
                  </div>
                  <div className="option-info">
                    <h3>Выбрать направление из КИ</h3>
                    <p>
                      ИИ проанализирует существующие решения и предложит
                      основные направления подходов. Выберите подходящее вам.
                    </p>
                    <div className="option-features">
                      <span>🤖 Анализ ИИ</span>
                      <span>📊 Разные подходы</span>
                      <span>💡 Умные предложения</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Вариант 3: Начать с нуля */}
            <Card
              className="option-card scratch-option"
              hoverable
              onClick={onStartFromScratch}
            >
              <div className="option-content">
                <div className="option-icon">
                  <EditOutlined />
                </div>
                <div className="option-info">
                  <h3>Начать с чистого листа</h3>
                  <p>
                    Создать собственное решение с нуля. Подходит для тех, кто
                    хочет предложить принципиально новый подход.
                  </p>
                  <div className="option-features">
                    <span>🎯 Полная свобода</span>
                    <span>🚀 Оригинальность</span>
                    <span>💭 Творческий подход</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="modal-info">
            <div className="info-section">
              <BulbOutlined className="info-icon" />
              <div className="info-text">
                <strong>Что дальше?</strong>
                <p>
                  После выбора способа участия у вас будет доступ к инструментам
                  коллективного интеллекта: запрос идей, предложений по
                  улучшению и конструктивной критики.
                </p>
              </div>
            </div>

            {totalSolutions > 0 && (
              <div className="stats-section">
                <span className="stats-label">Текущая статистика:</span>
                <div className="stats-items">
                  <div className="stats-item">
                    <TeamOutlined className="stats-icon" />
                    <span>Всего решений: {totalSolutions}</span>
                  </div>
                  {hasAuthorSolution && (
                    <div className="stats-item">
                      <UserOutlined className="stats-icon" />
                      <span>Есть решение автора</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <Button type="default" onClick={onCancel} size="large">
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  );
}

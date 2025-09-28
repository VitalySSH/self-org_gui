import { useState, useEffect } from 'react';
import { Modal, Button, Card, Spin, Empty } from 'antd';
import {
  RobotOutlined,
  BulbOutlined,
  TeamOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { ThinkingDirectionResponse } from 'src/interfaces';
import './direction-selection-modal.component.scss';

interface DirectionSelectionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (direction: ThinkingDirectionResponse) => void;
}

export function DirectionSelectionModal({
  visible,
  onCancel,
  onSelect,
}: DirectionSelectionModalProps) {
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState<ThinkingDirectionResponse[]>([]);
  const [selectedDirection, setSelectedDirection] =
    useState<ThinkingDirectionResponse | null>(null);

  // Заглушка для загрузки направлений
  useEffect(() => {
    if (visible) {
      setLoading(true);
      // TODO: Заменить на реальный вызов API
      setTimeout(() => {
        const mockDirections: ThinkingDirectionResponse[] = [
          {
            title: 'Аналитический подход',
            description:
              'Систематический анализ проблемы с разбивкой на составные части и поиском логических связей.',
            key_approaches: [
              'Декомпозиция задачи',
              'Причинно-следственный анализ',
              'Структурированное планирование',
            ],
            participants_count: 3,
            initial_solution_text: 'Начнем с детального анализа проблемы...',
            example_excerpts: [
              'Разобьем задачу на этапы',
              'Проанализируем каждый компонент',
            ],
          },
          {
            title: 'Творческий подход',
            description:
              'Нестандартные решения через креативное мышление и инновационные методы.',
            key_approaches: [
              'Мозговой штурм',
              'Латеральное мышление',
              'Синтез идей',
            ],
            participants_count: 2,
            initial_solution_text:
              'Попробуем взглянуть на проблему под новым углом...',
            example_excerpts: [
              'Что если мы попробуем...',
              'Альтернативный способ',
            ],
          },
          {
            title: 'Практический подход',
            description:
              'Фокус на быстрой реализации и получении конкретных результатов.',
            key_approaches: [
              'MVP разработка',
              'Итеративное улучшение',
              'Прототипирование',
            ],
            participants_count: 4,
            initial_solution_text:
              'Создадим минимально жизнеспособное решение...',
            example_excerpts: [
              'Начнем с простого варианта',
              'Проверим на практике',
            ],
          },
        ];
        setDirections(mockDirections);
        setLoading(false);
      }, 1500);
    }
  }, [visible]);

  const handleSelect = () => {
    if (selectedDirection) {
      onSelect(selectedDirection);
    }
  };

  const handleDirectionClick = (direction: ThinkingDirectionResponse) => {
    setSelectedDirection(direction);
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      className="direction-selection-modal"
      destroyOnClose
    >
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-icon">
            <RobotOutlined />
          </div>
          <h2>Выберите направление решения</h2>
          <p>
            ИИ проанализировал существующие решения и выделил основные подходы.
            Выберите наиболее подходящий вам для создания начального решения.
          </p>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-section">
              <Spin size="large" />
              <p>ИИ анализирует существующие решения...</p>
            </div>
          ) : directions.length === 0 ? (
            <Empty
              description="Не удалось получить направления"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="directions-list">
              {directions.map((direction, index) => (
                <Card
                  key={index}
                  className={`direction-card ${
                    selectedDirection === direction ? 'selected' : ''
                  }`}
                  hoverable
                  onClick={() => handleDirectionClick(direction)}
                >
                  <div className="direction-content">
                    <div className="direction-header">
                      <div className="direction-info">
                        <h3>{direction.title}</h3>
                        <div className="direction-meta">
                          <span className="participants-count">
                            <TeamOutlined /> {direction.participants_count}{' '}
                            участника
                          </span>
                        </div>
                      </div>
                      <div className="selection-indicator">
                        {selectedDirection === direction && (
                          <div className="selected-badge">
                            <CheckOutlined />
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="direction-description">
                      {direction.description}
                    </p>

                    <div className="key-approaches">
                      <h4>Ключевые подходы:</h4>
                      <div className="approaches-list">
                        {direction.key_approaches.map((approach, idx) => (
                          <span key={idx} className="approach-tag">
                            {approach}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="example-excerpts">
                      <h4>Примеры из решений:</h4>
                      <div className="excerpts-list">
                        {direction.example_excerpts.map((excerpt, idx) => (
                          <div key={idx} className="excerpt-item">
                            "{excerpt}"
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="initial-solution-preview">
                      <h4>Начальный текст:</h4>
                      <div className="solution-text">
                        {direction.initial_solution_text}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="modal-info">
          <div className="info-section">
            <BulbOutlined className="info-icon" />
            <div className="info-text">
              <strong>Что происходит после выбора?</strong>
              <p>
                Выбранный подход будет использован как основа для вашего
                решения. Вы сможете редактировать и дополнять его по своему
                усмотрению.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <Button type="default" onClick={onCancel} size="large">
            Отмена
          </Button>
          <Button
            type="primary"
            onClick={handleSelect}
            size="large"
            disabled={!selectedDirection}
            icon={<CheckOutlined />}
          >
            Выбрать подход
          </Button>
        </div>
      </div>
    </Modal>
  );
}

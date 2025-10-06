import { useState } from 'react';
import { Modal, Button, Card, Spin, Empty } from 'antd';
import {
  RobotOutlined,
  BulbOutlined,
  TeamOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { ThinkingDirection } from 'src/interfaces';
import './direction-selection-modal.component.scss';
import { AdvancedEditor } from 'src/components';

interface DirectionSelectionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (direction: ThinkingDirection) => void;
  directions: ThinkingDirection[];
  loading?: boolean;
}

export function DirectionSelectionModal({
  visible,
  onCancel,
  onSelect,
  directions,
  loading = false,
}: DirectionSelectionModalProps) {
  const [selectedDirection, setSelectedDirection] =
    useState<ThinkingDirection | null>(null);

  const handleSelect = () => {
    if (selectedDirection) {
      onSelect(selectedDirection);
      setSelectedDirection(null); // Сбросить выбор после отправки
    }
  };

  const handleDirectionClick = (direction: ThinkingDirection) => {
    setSelectedDirection(direction);
  };

  const handleCancel = () => {
    setSelectedDirection(null); // Сбросить выбор при отмене
    onCancel();
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className="direction-selection-modal"
      destroyOnHidden={true}
      maskClosable={false}
      keyboard={false}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
      }}
      wrapClassName="direction-selection-modal"
    >
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-icon">
            <RobotOutlined />
          </div>
          <div className="modal-text">
            <h2>Выберите направление решения</h2>
            <p>
              ИИ проанализировал существующие решения и выделил основные
              подходы. Выберите наиболее подходящий вам для создания начального
              решения.
            </p>
          </div>
        </div>

        <div className="modal-scrollable-content">
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
                              участников
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
                        <AdvancedEditor
                          value={
                            direction.initial_solution_text ||
                            'Описание не указано'
                          }
                          minHeight={100}
                          readonly={true}
                        />
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
        </div>

        <div className="modal-actions">
          <Button type="default" onClick={handleCancel} size="large">
            Отмена
          </Button>
          <Button
            type="primary"
            onClick={handleSelect}
            size="large"
            disabled={!selectedDirection || loading}
            icon={<CheckOutlined />}
          >
            Выбрать подход
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { Modal, Spin, Progress, Timeline, Empty } from 'antd';
import {
  RobotOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { AIInfluenceResponse } from 'src/interfaces';
import './solution-ai-influence-modal.component.scss';

interface SolutionAIInfluenceModalProps {
  visible: boolean;
  onCancel: () => void;
  data: AIInfluenceResponse | null;
  loading: boolean;
}

export function SolutionAIInfluenceModal({
  visible,
  onCancel,
  data,
  loading,
}: SolutionAIInfluenceModalProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      className="solution-ai-influence-modal"
      destroyOnHidden={true}
      maskClosable={true}
      keyboard={true}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-icon">
            <RobotOutlined />
          </div>
          <div className="modal-text">
            <h2>Влияние коллективного интеллекта</h2>
            <p>Анализ вклада ИИ в развитие решения</p>
          </div>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-section">
              <Spin size="large" />
              <p>Загрузка статистики...</p>
            </div>
          ) : !data ? (
            <Empty description="Данные недоступны" />
          ) : (
            <>
              {/* Основные метрики */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">
                    <LineChartOutlined />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{data.total_versions}</div>
                    <div className="metric-label">Всего версий</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">
                    <ThunderboltOutlined />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{data.ai_interactions}</div>
                    <div className="metric-label">Взаимодействий с ИИ</div>
                  </div>
                </div>

                <div className="metric-card highlight">
                  <div className="metric-icon">
                    <StarOutlined />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      {data.collective_influence_percentage}%
                    </div>
                    <div className="metric-label">Влияние КИ</div>
                  </div>
                </div>
              </div>

              {/* Прогресс влияния */}
              <div className="influence-progress">
                <h4>Степень влияния коллективного интеллекта</h4>
                <Progress
                  percent={data.collective_influence_percentage}
                  strokeColor={{
                    '0%': '#6366f1',
                    '100%': '#8b5cf6',
                  }}
                  size="default"
                  status="active"
                />
                <p className="progress-description">
                  {data.collective_influence_percentage < 30
                    ? 'Минимальное влияние - решение развивается самостоятельно'
                    : data.collective_influence_percentage < 60
                      ? 'Умеренное влияние - ИИ помогает улучшать решение'
                      : 'Значительное влияние - активное сотрудничество с ИИ'}
                </p>
              </div>

              {/* Временная шкала взаимодействий */}
              {data.ai_contribution_timeline &&
                data.ai_contribution_timeline.length > 0 && (
                  <div className="timeline-section">
                    <h4>
                      <ClockCircleOutlined /> История взаимодействий
                    </h4>
                    <Timeline
                      mode="left"
                      items={data.ai_contribution_timeline.map((item: any) => ({
                        color:
                          item.type === 'ideas'
                            ? '#f59e0b'
                            : item.type === 'improvements'
                              ? '#10b981'
                              : '#ef4444',
                        children: (
                          <div className="timeline-item">
                            <div className="timeline-header">
                              <span className="timeline-type">
                                {item.type === 'ideas'
                                  ? '💡 Генерация идей'
                                  : item.type === 'improvements'
                                    ? '⚡ Улучшения'
                                    : '🔍 Критический анализ'}
                              </span>
                              <span className="timeline-date">
                                {formatDate(item.timestamp)}
                              </span>
                            </div>
                            <div className="timeline-description">
                              {item.description || 'Взаимодействие с ИИ'}
                            </div>
                          </div>
                        ),
                      }))}
                    />
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

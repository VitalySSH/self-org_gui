import { Modal, Spin, Empty } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  RobotOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { CollectiveMetricsResponse } from 'src/interfaces';
import './collective-metrics-modal.component.scss';

interface CollectiveMetricsModalProps {
  visible: boolean;
  onCancel: () => void;
  data: CollectiveMetricsResponse | null;
  loading: boolean;
}

export function CollectiveMetricsModal({
  visible,
  onCancel,
  data,
  loading,
}: CollectiveMetricsModalProps) {
  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'low':
      case 'низкая':
        return '#999';
      case 'medium':
      case 'средняя':
        return '#fa8c16';
      case 'high':
      case 'высокая':
        return '#52c41a';
      default:
        return '#666';
    }
  };

  const getIntensityLabel = (intensity: string) => {
    const labels: Record<string, string> = {
      low: 'Низкая',
      medium: 'Средняя',
      high: 'Высокая',
    };
    return labels[intensity.toLowerCase()] || intensity;
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      className="collective-metrics-modal"
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
            <TeamOutlined />
          </div>
          <div className="modal-text">
            <h2>Метрики коллективного интеллекта</h2>
            <p>Статистика сотрудничества и вклада ИИ в решение задачи</p>
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
                  <div className="metric-icon solutions">
                    <LineChartOutlined />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{data.total_solutions}</div>
                    <div className="metric-label">Всего решений</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon participants">
                    <UserOutlined />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      {data.unique_participants}
                    </div>
                    <div className="metric-label">Участников</div>
                  </div>
                </div>
              </div>

              {/* Средние показатели */}
              <div className="average-metrics">
                <div className="average-card">
                  <div className="average-header">
                    <RobotOutlined className="average-icon" />
                    <h4>Среднее влияние КИ</h4>
                  </div>
                  <div className="average-value">
                    {data.average_collective_influence}%
                  </div>
                  <div className="average-bar">
                    <div
                      className="average-bar-fill"
                      style={{ width: `${data.average_collective_influence}%` }}
                    />
                  </div>
                  <p className="average-description">
                    В среднем {data.average_collective_influence}% содержания
                    решений создано при участии коллективного интеллекта
                  </p>
                </div>

                <div className="average-card">
                  <div className="average-header">
                    <ThunderboltOutlined className="average-icon" />
                    <h4>Использование ИИ</h4>
                  </div>
                  <div className="average-value">
                    {data.ai_utilization_rate}%
                  </div>
                  <div className="average-bar">
                    <div
                      className="average-bar-fill ai"
                      style={{ width: `${data.ai_utilization_rate}%` }}
                    />
                  </div>
                  <p className="average-description">
                    {data.ai_utilization_rate}% участников активно используют
                    возможности коллективного интеллекта
                  </p>
                </div>
              </div>

              {/* Интенсивность сотрудничества */}
              <div className="intensity-section">
                <h4>Интенсивность сотрудничества</h4>
                <div
                  className="intensity-badge"
                  style={{
                    backgroundColor: `${getIntensityColor(data.collaboration_intensity)}22`,
                    borderColor: getIntensityColor(
                      data.collaboration_intensity
                    ),
                    color: getIntensityColor(data.collaboration_intensity),
                  }}
                >
                  {getIntensityLabel(data.collaboration_intensity)}
                </div>
                <p className="intensity-description">
                  {data.collaboration_intensity.toLowerCase() === 'low' ||
                  data.collaboration_intensity.toLowerCase() === 'низкая'
                    ? 'Участники работают преимущественно самостоятельно'
                    : data.collaboration_intensity.toLowerCase() === 'medium' ||
                        data.collaboration_intensity.toLowerCase() === 'средняя'
                      ? 'Умеренное использование коллективного интеллекта'
                      : 'Активное сотрудничество с использованием ИИ'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

import { useState } from 'react';
import { Card, Select, message } from 'antd';
import {
  ExperimentOutlined,
  UpOutlined,
  DownOutlined,
  FileTextOutlined,
  UserOutlined,
  TagOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { ChallengeModel } from 'src/models';
import './challenge-info-card.component.scss';
import { AdvancedEditor } from 'src/components';

interface ChallengeInfoCardProps {
  challenge: ChallengeModel;
  isAuthor: boolean;
}

const statusOptions = [
  { value: 'new_challenge', label: 'Новая', color: '#999' },
  { value: 'challenge_at_work', label: 'В работе', color: '#fa8c16' },
  { value: 'challenge_solved', label: 'Решена', color: '#52c41a' },
  // { value: 'archived', label: 'Архивная', color: '#666' },
];

export function ChallengeInfoCard({
  challenge,
  isAuthor,
}: ChallengeInfoCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    challenge.status?.code || 'new'
  );
  const [messageApi, contextHolder] = message.useMessage();

  const handleStatusChange = async (newStatus: string) => {
    try {
      // TODO: Обновить статус задачи через API
      setCurrentStatus(newStatus);
      messageApi.success('Статус задачи обновлен');
    } catch (error) {
      console.error('Error updating challenge status:', error);
      messageApi.error('Ошибка обновления статуса');
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Не указано';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCurrentStatusInfo = () => {
    return (
      statusOptions.find((option) => option.value === currentStatus) ||
      statusOptions[0]
    );
  };

  return (
    <Card className="challenge-card challenge-info-card">
      {contextHolder}

      <div className="card-header">
        <div className="card-title">
          <div className="card-icon">
            <ExperimentOutlined />
          </div>
          Информация о задаче
        </div>

        <div className="card-actions">
          {isAuthor && (
            <Select
              value={currentStatus}
              onChange={handleStatusChange}
              options={statusOptions}
              className="status-select"
              size="small"
            />
          )}

          <button
            className={`collapse-button ${collapsed ? 'collapsed' : ''}`}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <DownOutlined /> : <UpOutlined />}
          </button>
        </div>
      </div>

      <div className={`card-content ${collapsed ? 'collapsed' : ''}`}>
        {/* Заголовок задачи */}
        <div className="challenge-title-section">
          <h1 className="challenge-title">{challenge.title}</h1>

          <div className="challenge-meta">
            <div className="meta-item">
              <UserOutlined className="meta-icon" />
              <span>Автор: {challenge.creator?.fullname}</span>
            </div>

            {challenge.category && (
              <div className="meta-item">
                <TagOutlined className="meta-icon" />
                <span>Категория: {challenge.category.name}</span>
              </div>
            )}

            <div className="meta-item">
              <CalendarOutlined className="meta-icon" />
              <span>Создано: {formatDate(challenge.created_at)}</span>
            </div>

            <div className="meta-item">
              <div className={`status-badge ${getCurrentStatusInfo().value}`}>
                {getCurrentStatusInfo().label}
              </div>
            </div>
          </div>
        </div>

        {/* Описание задачи */}
        <div className="content-block">
          <div className="content-label">
            <FileTextOutlined />
            Описание задачи
          </div>
          <AdvancedEditor
            value={challenge.description || 'Описание не указано'}
            readonly={true}
          />
        </div>

        {isAuthor && (
          <div className="author-note">
            <p>
              💡 Как автор задачи, вы можете изменять её статус и отмечать
              понравившиеся решения участников.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

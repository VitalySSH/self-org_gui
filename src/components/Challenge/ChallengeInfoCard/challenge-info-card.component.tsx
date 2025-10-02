import { useState } from 'react';
import { Card, Select, message, Tooltip, Button } from 'antd';
import {
  ExperimentOutlined,
  UpOutlined,
  DownOutlined,
  FileTextOutlined,
  UserOutlined,
  TagOutlined,
  LineChartOutlined,
  // CalendarOutlined,
} from '@ant-design/icons';
import { ChallengeModel, StatusModel } from 'src/models';
import './challenge-info-card.component.scss';
import { AdvancedEditor, CollectiveMetricsModal } from 'src/components';
import { CrudDataSourceService, LlmApiService } from 'src/services';
import { CollectiveMetricsResponse } from 'src/interfaces';

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
  const llmService = new LlmApiService();
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [metricsData, setMetricsData] =
    useState<CollectiveMetricsResponse | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const challengeService = new CrudDataSourceService(ChallengeModel);
  const statusService = new CrudDataSourceService(StatusModel);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setCurrentStatus(newStatus);
      const statuses = await statusService.list([
        { field: 'code', op: 'equals', val: newStatus },
      ]);
      challenge.status = statuses.data[0];
      await challengeService.save(challenge);

      messageApi.success('Статус задачи обновлен');
    } catch (error) {
      console.error('Error updating challenge status:', error);
      messageApi.error('Ошибка обновления статуса');
    }
  };

  const handleShowMetrics = async () => {
    if (!challenge?.id) return;

    setShowMetricsModal(true);
    setLoadingMetrics(true);

    try {
      const response = await llmService.getCollectiveMetrics(challenge.id);
      setMetricsData(response.data);
    } catch (error) {
      console.error('Error loading collective metrics:', error);
      messageApi.error('Ошибка загрузки метрик коллективного интеллекта');
    } finally {
      setLoadingMetrics(false);
    }
  };

  // const formatDate = (date: Date | string | undefined) => {
  //   if (!date) return 'Не указано';
  //   const d = typeof date === 'string' ? new Date(date) : date;
  //   return d.toLocaleDateString('ru-RU', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //   });
  // };

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
          <Tooltip title="Метрики коллективного интеллекта">
            <Button
              type="text"
              size="small"
              icon={<LineChartOutlined />}
              onClick={handleShowMetrics}
              className="metrics-button"
            >
              Статистика
            </Button>
          </Tooltip>

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

            {/*<div className="meta-item">*/}
            {/*  <CalendarOutlined className="meta-icon" />*/}
            {/*  <span>Создано: {formatDate(challenge.created_at)}</span>*/}
            {/*</div>*/}

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

      <CollectiveMetricsModal
        visible={showMetricsModal}
        onCancel={() => setShowMetricsModal(false)}
        data={metricsData}
        loading={loadingMetrics}
      />
    </Card>
  );
}

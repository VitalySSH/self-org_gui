import { useState } from 'react';
import { Card, Select, Button, Spin, message, Tooltip } from 'antd';
import {
  EditOutlined,
  RobotOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  HistoryOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  ChallengeModel,
  SolutionModel,
  SolutionVersionModel,
} from 'src/models';
import { SolutionEditor } from 'src/components';
import './user-workspace-card.component.scss';
import { CrudDataSourceService } from 'src/services';

interface UserSolution {
  solution: SolutionModel;
  currentVersion: SolutionVersionModel;
  allVersions: SolutionVersionModel[];
}

interface UserWorkspaceCardProps {
  challenge: ChallengeModel;
  userSolution: UserSolution | null;
  isAuthor: boolean;
  onParticipate: () => void;
  onAIRequest: (type: 'ideas' | 'improvements' | 'criticism') => void;
  onSaveNewVersion: (content: string, versionNumber: number) => Promise<void>;
}

const statusOptions = [
  { value: 'draft', label: 'Черновик', color: '#999' },
  {
    value: 'ready_for_review',
    label: 'Готово для просмотра',
    color: '#fa8c16',
  },
  { value: 'completed', label: 'Завершено', color: '#52c41a' },
];

export function UserWorkspaceCard({
  userSolution,
  onParticipate,
  onAIRequest,
  onSaveNewVersion,
}: UserWorkspaceCardProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedVersion, setSelectedVersion] = useState<number>(
    userSolution?.currentVersion.version_number || 1
  );
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [solutionStatus, setSolutionStatus] = useState(
    userSolution?.solution.status || 'draft'
  );
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [editedContent, setEditedContent] = useState(
    userSolution?.currentVersion.content || ''
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasSubstantialChanges, setHasSubstantialChanges] = useState(false);

  const solutionService = new CrudDataSourceService(SolutionModel);
  const versionService = new CrudDataSourceService(SolutionVersionModel);

  // Если у пользователя нет решения
  if (!userSolution) {
    return (
      <Card className="challenge-card user-workspace-card no-solution">
        {contextHolder}

        <div className="card-header">
          <div className="card-title">
            <div className="card-icon">
              <EditOutlined />
            </div>
            Ваше участие
          </div>
        </div>

        <div className="card-content">
          <div className="no-solution-content">
            <div className="no-solution-icon">
              <PlusOutlined />
            </div>
            <h3>Присоединяйтесь к решению задачи</h3>
            <p>
              Вы еще не участвуете в решении этой задачи. Присоединитесь к
              коллективному поиску решения и получите помощь от ИИ и других
              участников сообщества.
            </p>
            <Button
              type="primary"
              size="large"
              onClick={onParticipate}
              className="participate-button"
              icon={<RobotOutlined />}
            >
              Начать участие
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      // TODO: Обновить статус решения через API
      setSolutionStatus(newStatus);
      messageApi.success('Статус решения обновлен');
    } catch (error) {
      console.error('Error updating solution status:', error);
      messageApi.error('Ошибка обновления статуса');
    }
  };

  const handleVersionChange = (versionNumber: number) => {
    if (hasUnsavedChanges) {
      messageApi.warning('У вас есть несохраненные изменения');
      return;
    }

    setSelectedVersion(versionNumber);
    const version = userSolution.allVersions.find(
      (v) => v.version_number === versionNumber
    );
    if (version) {
      setEditedContent(version.content);
    }
  };

  const handleContentChange = (content: string) => {
    setEditedContent(content);
    const currentVersionContent = getCurrentVersion()?.content || '';

    // Проверяем наличие изменений
    const hasChanges =
      content !== currentVersionContent && content.trim() !== '';
    setHasUnsavedChanges(hasChanges);

    // Проверяем существенность изменений (более 10% от исходного текста или более 100 символов)
    if (hasChanges) {
      const originalLength = currentVersionContent.length;
      const changedLength = Math.abs(content.length - originalLength);
      const changePercentage =
        originalLength > 0 ? (changedLength / originalLength) * 100 : 100;

      const isSubstantial = changePercentage > 10 || changedLength > 100;
      setHasSubstantialChanges(isSubstantial);
    } else {
      setHasSubstantialChanges(false);
    }
  };

  const handleSaveCurrentVersion = async () => {
    if (!hasUnsavedChanges) {
      messageApi.info('Нет изменений для сохранения');
      return;
    }

    try {
      const solution = solutionService.createRecord();
      solution.id = userSolution.solution.id;
      solution.current_content = editedContent;
      await solutionService.save(solution);

      const version = versionService.createRecord();
      version.id = userSolution.currentVersion.id;
      version.content = editedContent;
      await versionService.save(version);
      messageApi.success('Изменения сохранены в текущей версии');
      setHasUnsavedChanges(false);
      setHasSubstantialChanges(false);
    } catch (error) {
      console.error('Error saving current version:', error);
      messageApi.error('Ошибка сохранения изменений');
    }
  };

  const handleSaveNewVersion = async () => {
    if (!hasUnsavedChanges) {
      messageApi.info('Нет изменений для сохранения');
      return;
    }

    try {
      const versionNumber = selectedVersion + 1;
      await onSaveNewVersion(editedContent, versionNumber);
      setHasUnsavedChanges(false);
      setHasSubstantialChanges(false);
      messageApi.success('Новая версия создана');
    } catch (error) {
      console.error('Error saving new version:', error);
      messageApi.error('Ошибка создания новой версии');
    }
  };

  const handleAIRequest = async (
    type: 'ideas' | 'improvements' | 'criticism'
  ) => {
    if (hasUnsavedChanges) {
      messageApi.warning('Сохраните изменения перед запросом к ИИ');
      return;
    }

    setIsProcessingAI(true);
    try {
      await onAIRequest(type);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const getCurrentVersion = () => {
    return userSolution.allVersions.find(
      (v) => v.version_number === selectedVersion
    );
  };

  const getStatusInfo = (status: string) => {
    return (
      statusOptions.find((option) => option.value === status) ||
      statusOptions[0]
    );
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Не указано';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="challenge-card user-workspace-card">
      {contextHolder}

      <div className="card-header">
        <div className="card-title">
          <div className="card-icon">
            <EditOutlined />
          </div>
          Ваше решение
        </div>

        <div className="card-actions">
          <Select
            value={solutionStatus}
            onChange={handleStatusChange}
            options={statusOptions}
            className="status-select"
            size="small"
          />
        </div>
      </div>

      <div className="card-content">
        {/* Контролы версий */}
        <div className="version-controls">
          <div className="version-selector">
            <Select
              value={selectedVersion}
              onChange={handleVersionChange}
              disabled={hasUnsavedChanges}
              className="version-select"
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <div className="version-divider" />
                  <Button
                    type="text"
                    icon={<HistoryOutlined />}
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    size="small"
                    style={{ width: '100%' }}
                  >
                    История версий
                  </Button>
                </div>
              )}
            >
              {userSolution.allVersions.map((version) => (
                <Select.Option
                  key={version.version_number}
                  value={version.version_number}
                >
                  Версия {version.version_number}
                  {version.created_at && (
                    <span className="version-date">
                      {' '}
                      — {formatDate(version.created_at)}
                    </span>
                  )}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="version-actions">
            {hasUnsavedChanges && (
              <div className="save-buttons">
                <Tooltip title="Сохранить изменения в текущей версии решения">
                  <Button
                    type="default"
                    size="small"
                    icon={<SaveOutlined />}
                    onClick={handleSaveCurrentVersion}
                    className="save-current-button"
                  >
                    Сохранить
                  </Button>
                </Tooltip>

                {hasSubstantialChanges && (
                  <Tooltip title="Создать новую версию решения">
                    <Button
                      type="primary"
                      size="small"
                      icon={<SaveOutlined />}
                      onClick={handleSaveNewVersion}
                      className="save-new-version-button"
                    >
                      Новая версия
                    </Button>
                  </Tooltip>
                )}
              </div>
            )}

            <div
              className={`status-badge ${getStatusInfo(solutionStatus).value}`}
            >
              {getStatusInfo(solutionStatus).label}
            </div>
          </div>
        </div>

        {/* Редактор решения */}
        <div className="solution-editor-section">
          <SolutionEditor
            value={editedContent}
            onChange={handleContentChange}
            disabled={
              selectedVersion !== userSolution.currentVersion.version_number
            }
            placeholder="Начните писать ваше решение..."
          />
        </div>

        {/* ИИ действия */}
        <div className="ai-actions-section">
          <div className="ai-actions-header">
            <h4>Коллективный интеллект</h4>
            <p>Используйте общую интеллектуальную мощь сообщества</p>
          </div>

          <div className="ai-actions">
            <Button
              className="ai-button ideas-button"
              icon={<BulbOutlined />}
              onClick={() => handleAIRequest('ideas')}
              disabled={isProcessingAI || !userSolution}
              loading={isProcessingAI}
            >
              Сгенерировать гипотезы
            </Button>

            <Button
              className="ai-button improvements-button"
              icon={<ThunderboltOutlined />}
              onClick={() => handleAIRequest('improvements')}
              disabled={isProcessingAI || !userSolution}
              loading={isProcessingAI}
            >
              Усилить решение
            </Button>

            <Button
              className="ai-button criticism-button"
              icon={<ExclamationCircleOutlined />}
              onClick={() => handleAIRequest('criticism')}
              disabled={isProcessingAI || !userSolution}
              loading={isProcessingAI}
            >
              Выявить уязвимости
            </Button>
          </div>

          {isProcessingAI && (
            <div className="ai-processing">
              <Spin size="small" />
              <span>ИИ анализирует ваше решение...</span>
            </div>
          )}
        </div>

        {/* История версий (расширенная) */}
        {showVersionHistory && (
          <div className="version-history">
            <h4>История версий</h4>
            <div className="version-list">
              {userSolution.allVersions.map((version) => (
                <div
                  key={version.version_number}
                  className={`version-item ${
                    version.version_number === selectedVersion ? 'active' : ''
                  }`}
                  onClick={() => handleVersionChange(version.version_number)}
                >
                  <div className="version-info">
                    <span className="version-number">
                      v{version.version_number}
                    </span>
                    <span className="version-date">
                      {formatDate(version.created_at)}
                    </span>
                  </div>
                  {version.change_description && (
                    <div className="version-description">
                      {version.change_description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

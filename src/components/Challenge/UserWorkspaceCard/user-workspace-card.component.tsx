import { useState, useEffect } from 'react';
import { Card, Select, Button, Spin, message, Tooltip, Modal } from 'antd';
import {
  EditOutlined,
  RobotOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  HistoryOutlined,
  PlusOutlined,
  DeleteOutlined,
  LineChartOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  ChallengeModel,
  SolutionModel,
  SolutionVersionModel,
} from 'src/models';
import { SolutionAIInfluenceModal, SolutionEditor } from 'src/components';
import './user-workspace-card.component.scss';
import { CrudDataSourceService, LlmApiService } from 'src/services';
import { AIInfluenceResponse, RateLimitCheckAllResponse } from 'src/interfaces';

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
  onSolutionDeleted?: () => void;
  onStatusChanged?: () => void;
  totalSolutions: number;
  rateLimits?: RateLimitCheckAllResponse | null;
}

const statusOptions = [
  { value: 'draft', label: 'Черновик', color: '#999' },
  { value: 'completed', label: 'Готово', color: '#52c41a' },
];

export function UserWorkspaceCard({
  userSolution,
  onParticipate,
  onAIRequest,
  onSaveNewVersion,
  onSolutionDeleted,
  onStatusChanged,
  totalSolutions = 0,
  rateLimits,
}: UserWorkspaceCardProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [solutionStatus, setSolutionStatus] = useState('draft');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasSubstantialChanges, setHasSubstantialChanges] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInfluenceModal, setShowInfluenceModal] = useState(false);
  const [influenceData, setInfluenceData] =
    useState<AIInfluenceResponse | null>(null);
  const [loadingInfluence, setLoadingInfluence] = useState(false);
  const [showFirstVersionTip, setShowFirstVersionTip] = useState(false);

  // Состояния для таймеров rate limiting
  const [ideasTimeLeft, setIdeasTimeLeft] = useState(0);
  const [improvementsTimeLeft, setImprovementsTimeLeft] = useState(0);
  const [criticismTimeLeft, setCriticismTimeLeft] = useState(0);

  const solutionService = new CrudDataSourceService(SolutionModel);
  const versionService = new CrudDataSourceService(SolutionVersionModel);
  const llmService = new LlmApiService();

  // Инициализация таймеров на основе rate limits
  useEffect(() => {
    if (rateLimits?.request_types) {
      const { ideas, improvements, criticism } = rateLimits.request_types;

      if (!ideas.available) {
        setIdeasTimeLeft(ideas.seconds_remaining);
      }
      if (!improvements.available) {
        setImprovementsTimeLeft(improvements.seconds_remaining);
      }
      if (!criticism.available) {
        setCriticismTimeLeft(criticism.seconds_remaining);
      }
    }
  }, [rateLimits]);

  // Таймеры для отсчёта времени
  useEffect(() => {
    const interval = setInterval(() => {
      setIdeasTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setImprovementsTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setCriticismTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Форматирование времени
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (userSolution) {
      setSelectedVersion(userSolution.currentVersion.version_number);
      setSolutionStatus(userSolution.solution.status || 'draft');
      setEditedContent(userSolution.currentVersion.content || '');
      setHasUnsavedChanges(false);
      setHasSubstantialChanges(false);
      setShowVersionHistory(false);
    } else {
      setSelectedVersion(1);
      setSolutionStatus('draft');
      setEditedContent('');
      setHasUnsavedChanges(false);
      setHasSubstantialChanges(false);
      setShowVersionHistory(false);
    }
  }, [userSolution]);

  useEffect(() => {
    if (userSolution && userSolution.allVersions.length === 1) {
      const tipShownKey = `first-version-tip-shown-${userSolution.solution.id}`;
      const wasTipShown = localStorage.getItem(tipShownKey);

      if (!wasTipShown) {
        setShowFirstVersionTip(true);
      }
    } else {
      setShowFirstVersionTip(false);
    }
  }, [userSolution]);

  const handleDeleteSolution = () => {
    Modal.confirm({
      title: 'Удалить своё решение?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p>
            Вы уверены, что хотите удалить своё решение и прекратить участие в
            этой задаче?
          </p>
          <p style={{ marginTop: '12px' }}>
            <strong>Это действие нельзя отменить.</strong> Будут удалены:
          </p>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Все версии вашего решения</li>
            <li>История взаимодействий с коллективным интеллектом</li>
            <li>Все связанные данные</li>
          </ul>
          <p style={{ marginTop: '12px', color: '#666' }}>
            Вы сможете начать новое участие в любое время, но текущие данные
            будут потеряны безвозвратно.
          </p>
        </div>
      ),
      okText: 'Да, удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      maskClosable: false,
      keyboard: false,
      onOk: async () => {
        if (!userSolution?.solution.id) return;

        setIsDeleting(true);
        try {
          await llmService.deleteSolution(userSolution.solution.id);
          messageApi.success('Ваше решение успешно удалено');

          if (onSolutionDeleted) {
            onSolutionDeleted();
          }
        } catch (error) {
          console.error('Error deleting solution:', error);
          messageApi.error('Ошибка при удалении решения');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleShowInfluence = async () => {
    if (!userSolution?.solution.id) return;

    setShowInfluenceModal(true);
    setLoadingInfluence(true);

    try {
      const response = await llmService.getSolutionAIInfluence(
        userSolution.solution.id
      );
      setInfluenceData(response.data);
    } catch (error) {
      console.error('Error loading AI influence:', error);
      messageApi.error('Ошибка загрузки статистики влияния ИИ');
    } finally {
      setLoadingInfluence(false);
    }
  };

  const handleCloseTip = () => {
    if (userSolution) {
      const tipShownKey = `first-version-tip-shown-${userSolution.solution.id}`;
      localStorage.setItem(tipShownKey, 'true');
    }
    setShowFirstVersionTip(false);
  };

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
              Не нужно быть экспертом, чтобы внести ценный вклад. Поделитесь
              своим взглядом на проблему — даже неочевидные мысли и аналогии из
              вашего опыта могут стать катализатором для других участников.
              Коллективный интеллект сильнее, когда объединяет разные точки
              зрения.
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
      setSolutionStatus(newStatus);
      const solution = solutionService.createRecord();
      solution.id = userSolution.solution.id;
      solution.status = newStatus;
      await solutionService.save(solution);

      if (onStatusChanged) {
        onStatusChanged();
      }

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

    const hasChanges =
      content !== currentVersionContent && content.trim() !== '';
    setHasUnsavedChanges(hasChanges);

    if (hasChanges) {
      const originalLength = currentVersionContent.length;
      const changedLength = Math.abs(content.length - originalLength);
      const changePercentage =
        originalLength > 0 ? (changedLength / originalLength) * 100 : 100;

      const isSubstantial = changePercentage > 20 || changedLength > 100;
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

  // Проверка доступности кнопок AI
  const isIdeasDisabled = ideasTimeLeft > 0 || isProcessingAI;
  const isImprovementsDisabled = improvementsTimeLeft > 0 || isProcessingAI;
  const isCriticismDisabled = criticismTimeLeft > 0 || isProcessingAI;

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
              popupRender={(menu) => (
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

            <Tooltip title="Удалить своё решение и прекратить участие">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteSolution}
                loading={isDeleting}
                className="delete-solution-button"
              >
                Удалить
              </Button>
            </Tooltip>

            <Tooltip title="Статистика влияния коллективного интеллекта">
              <Button
                type="text"
                size="small"
                icon={<LineChartOutlined />}
                onClick={handleShowInfluence}
                className="influence-button"
              >
                Статистика
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Редактор решения */}
        <div className="solution-editor-section">
          <SolutionEditor
            value={editedContent}
            onChange={handleContentChange}
            readonly={
              selectedVersion !== userSolution.currentVersion.version_number
            }
            placeholder="Начните писать ваше решение..."
          />
        </div>

        {/* Подсказка для первой версии */}
        {showFirstVersionTip && (
          <div className="first-version-tip">
            <div className="tip-header">
              <div className="tip-icon">
                <BulbOutlined />
              </div>
              <h5>Ваш вклад важен!</h5>
              <button className="tip-close" onClick={handleCloseTip}>
                ×
              </button>
            </div>
            <div className="tip-content">
              <p>
                Даже если вы не являетесь экспертом в области этой задачи, ваше
                мнение делает коллективный интеллект сильнее. Поделитесь любой
                информацией, которая может быть полезна другим участникам.
              </p>
              <ul className="tip-suggestions">
                <li>Есть ли аналогии из вашей профессиональной области?</li>
                <li>В каком направлении вы бы начали искать решение?</li>
                <li>Какие вопросы возникают при изучении задачи?</li>
                <li>Что вас вдохновляет или интригует в этой проблеме?</li>
              </ul>
              <p className="tip-footer">
                Любая мысль, даже неочевидная, может стать ключом к прорыву.
                Коллективный интеллект строится на разнообразии взглядов.
              </p>
            </div>
            <div className="tip-actions">
              <Button type="primary" size="small" onClick={handleCloseTip}>
                Понятно, приступаю к работе
              </Button>
            </div>
          </div>
        )}

        {/* ИИ действия */}
        <div className="ai-actions-section">
          <div className="ai-actions-header">
            <h4>Коллективный интеллект</h4>
            <p>Используйте общую интеллектуальную мощь сообщества</p>
          </div>

          {totalSolutions > 2 ? (
            <>
              <div className="ai-actions">
                <Tooltip
                  title={
                    ideasTimeLeft > 0
                      ? `Доступно через ${formatTime(ideasTimeLeft)}`
                      : 'Сгенерировать новые идеи на основе других решений'
                  }
                >
                  <Button
                    className="ai-button ideas-button"
                    icon={
                      ideasTimeLeft > 0 ? (
                        <ClockCircleOutlined />
                      ) : (
                        <BulbOutlined />
                      )
                    }
                    onClick={() => handleAIRequest('ideas')}
                    disabled={isIdeasDisabled}
                    loading={isProcessingAI}
                  >
                    {ideasTimeLeft > 0
                      ? `Гипотезы (${formatTime(ideasTimeLeft)})`
                      : 'Сгенерировать гипотезы'}
                  </Button>
                </Tooltip>

                <Tooltip
                  title={
                    improvementsTimeLeft > 0
                      ? `Доступно через ${formatTime(improvementsTimeLeft)}`
                      : 'Получить предложения по улучшению решения'
                  }
                >
                  <Button
                    className="ai-button improvements-button"
                    icon={
                      improvementsTimeLeft > 0 ? (
                        <ClockCircleOutlined />
                      ) : (
                        <ThunderboltOutlined />
                      )
                    }
                    onClick={() => handleAIRequest('improvements')}
                    disabled={isImprovementsDisabled}
                    loading={isProcessingAI}
                  >
                    {improvementsTimeLeft > 0
                      ? `Усилить (${formatTime(improvementsTimeLeft)})`
                      : 'Усилить решение'}
                  </Button>
                </Tooltip>

                <Tooltip
                  title={
                    criticismTimeLeft > 0
                      ? `Доступно через ${formatTime(criticismTimeLeft)}`
                      : 'Выявить слабые места и уязвимости'
                  }
                >
                  <Button
                    className="ai-button criticism-button"
                    icon={
                      criticismTimeLeft > 0 ? (
                        <ClockCircleOutlined />
                      ) : (
                        <ExclamationCircleOutlined />
                      )
                    }
                    onClick={() => handleAIRequest('criticism')}
                    disabled={isCriticismDisabled}
                    loading={isProcessingAI}
                  >
                    {criticismTimeLeft > 0
                      ? `Уязвимости (${formatTime(criticismTimeLeft)})`
                      : 'Выявить уязвимости'}
                  </Button>
                </Tooltip>
              </div>

              {isProcessingAI && (
                <div className="ai-processing">
                  <Spin size="small" />
                  <span>ИИ анализирует ваше решение...</span>
                </div>
              )}
            </>
          ) : (
            <div className="ai-inactive">
              <div className="ai-inactive-icon">
                <TeamOutlined />
              </div>
              <div className="ai-inactive-text">
                <h5>Коллективный интеллект пока недоступен</h5>
                <p>
                  Для активации требуется минимум 3 решения от участников.
                  Сейчас: <strong>{totalSolutions}</strong> из 3
                </p>
                <p className="ai-inactive-hint">
                  💡 Пригласите коллег присоединиться к решению задачи или
                  дождитесь других участников
                </p>
              </div>
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

      <SolutionAIInfluenceModal
        visible={showInfluenceModal}
        onCancel={() => setShowInfluenceModal(false)}
        data={influenceData}
        loading={loadingInfluence}
      />
    </Card>
  );
}

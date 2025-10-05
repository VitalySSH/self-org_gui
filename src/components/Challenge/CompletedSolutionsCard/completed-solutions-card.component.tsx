import { useState } from 'react';
import { Card, List, Empty, Button, message, Pagination, Tooltip } from 'antd';
import { AIInfluenceResponse, CompletedSolution } from 'src/interfaces';
import {
  SolutionOutlined,
  UpOutlined,
  DownOutlined,
  UserOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import './completed-solutions-card.component.scss';
import { CrudDataSourceService, LlmApiService } from 'src/services';
import { AdvancedEditor, SolutionAIInfluenceModal } from 'src/components';
import { SolutionModel } from 'src/models';

interface CompletedSolutionsCardProps {
  solutions: CompletedSolution[];
  isAuthor: boolean;
}

export function CompletedSolutionsCard({
  solutions,
  isAuthor,
}: CompletedSolutionsCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(
    new Set()
  );
  const [likedSolutions, setLikedSolutions] = useState<Set<string>>(new Set());
  const [messageApi, contextHolder] = message.useMessage();
  const [showInfluenceModal, setShowInfluenceModal] = useState(false);
  const [influenceData, setInfluenceData] =
    useState<AIInfluenceResponse | null>(null);
  const [loadingInfluence, setLoadingInfluence] = useState(false);

  const llmService = new LlmApiService();
  const solutionService = new CrudDataSourceService(SolutionModel);

  const handleToggleExpand = (solutionId: string) => {
    const newExpanded = new Set(expandedSolutions);
    if (newExpanded.has(solutionId)) {
      newExpanded.delete(solutionId);
    } else {
      newExpanded.add(solutionId);
    }
    setExpandedSolutions(newExpanded);
  };

  const handleToggleLike = async (solutionId: string) => {
    if (!isAuthor) return;

    try {
      const newLiked = new Set(likedSolutions);
      const isAuthorLike = newLiked.has(solutionId);
      if (isAuthorLike) {
        newLiked.delete(solutionId);
        messageApi.success('Отметка убрана');
      } else {
        newLiked.add(solutionId);
        messageApi.success('Решение отмечено как понравившееся');
      }
      setLikedSolutions(newLiked);

      const solution = solutionService.createRecord();
      solution.id = solutionId;
      solution.is_author_like = isAuthorLike;
      await solutionService.save(solution);
    } catch (error) {
      console.error('Error toggling like:', error);
      messageApi.error('Ошибка при изменении отметки');
    }
  };

  const handleShowInfluence = async (solutionId: string) => {
    setShowInfluenceModal(true);
    setLoadingInfluence(true);

    try {
      const response = await llmService.getSolutionAIInfluence(solutionId);
      setInfluenceData(response.data);
    } catch (error) {
      console.error('Error loading AI influence:', error);
      messageApi.error('Ошибка загрузки статистики влияния ИИ');
    } finally {
      setLoadingInfluence(false);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Не указано';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  // Пагинация
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSolutions = solutions.slice(startIndex, endIndex);

  return (
    <Card className="challenge-card completed-solutions-card">
      {contextHolder}

      <div className="card-header">
        <div className="card-title">
          <div className="card-icon">
            <SolutionOutlined />
          </div>
          Готовые решения
          {solutions.length > 0 && (
            <span className="solutions-count">({solutions.length})</span>
          )}
        </div>

        <div className="card-actions">
          <button
            className={`collapse-button ${collapsed ? 'collapsed' : ''}`}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <DownOutlined /> : <UpOutlined />}
          </button>
        </div>
      </div>

      <div className={`card-content ${collapsed ? 'collapsed' : ''}`}>
        {solutions.length === 0 ? (
          <Empty
            description="Пока нет готовых решений"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '40px 20px' }}
          >
            <p style={{ color: '#666', fontSize: '14px', marginTop: '16px' }}>
              Готовые решения будут отображаться здесь после того, как участники
              изменят статус своих решений на "Завершено"
            </p>
          </Empty>
        ) : (
          <>
            <List
              itemLayout="vertical"
              dataSource={paginatedSolutions}
              renderItem={(solution) => {
                const isExpanded = expandedSolutions.has(solution.id);
                const isLiked = likedSolutions.has(solution.id);

                return (
                  <List.Item key={solution.id} className="solution-item">
                    <div className="solution-header">
                      <div className="solution-meta">
                        <div className="author-info">
                          <UserOutlined className="author-icon" />
                          <span className="author-name">
                            {solution.authorName}
                          </span>
                        </div>

                        <div className="solution-details">
                          <div className="date-info">
                            <ClockCircleOutlined className="date-icon" />
                            <span>{formatDate(solution.updatedAt)}</span>
                          </div>

                          {!isAuthor && solution.isAuthorLike && (
                            <Tooltip title="Автор задачи отметил это решение как полезное или понравившееся">
                              <div className="author-liked-badge">
                                <StarFilled className="author-liked-icon" />
                                <span>Отмечено автором</span>
                              </div>
                            </Tooltip>
                          )}
                        </div>
                      </div>

                      <div className="solution-actions">
                        {isAuthor && (
                          <Button
                            type="text"
                            size="small"
                            icon={isLiked ? <StarFilled /> : <StarOutlined />}
                            onClick={() => handleToggleLike(solution.id)}
                            className={`like-button ${isLiked ? 'liked' : ''}`}
                            title={
                              isLiked
                                ? 'Убрать отметку'
                                : 'Отметить как понравившееся'
                            }
                          />
                        )}

                        <Button
                          type="text"
                          size="small"
                          icon={<LineChartOutlined />}
                          onClick={() => handleShowInfluence(solution.id)}
                          className="stats-button"
                          title="Статистика влияния ИИ"
                        />

                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleToggleExpand(solution.id)}
                          className="expand-button"
                        >
                          {isExpanded ? 'Свернуть' : 'Развернуть'}
                        </Button>
                      </div>
                    </div>

                    <div className="solution-content">
                      {isExpanded ? (
                        <AdvancedEditor
                          value={solution.content}
                          readonly={true}
                          showToolbar={false}
                          autoHeight={true}
                          initialPreviewMode={true}
                        />
                      ) : (
                        <div className="content-preview">
                          {truncateContent(solution.content)}
                        </div>
                      )}

                      {solution.content.length > 300 && !isExpanded && (
                        <div className="read-more">
                          <Button
                            type="link"
                            size="small"
                            onClick={() => handleToggleExpand(solution.id)}
                            className="read-more-button"
                          >
                            Читать полностью
                          </Button>
                        </div>
                      )}
                    </div>

                    {isAuthor && (
                      <div className="author-note">
                        {isLiked ? (
                          <span className="liked-note">
                            ⭐ Отмечено вами как понравившееся
                          </span>
                        ) : (
                          <span className="like-suggestion">
                            Оцените это решение, если оно вам помогло
                          </span>
                        )}
                      </div>
                    )}
                  </List.Item>
                );
              }}
            />

            {solutions.length > pageSize && (
              <div className="solutions-pagination">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={solutions.length}
                  onChange={setCurrentPage}
                  size="small"
                  showSizeChanger={false}
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} из ${total} решений`
                  }
                />
              </div>
            )}
          </>
        )}

        {isAuthor && solutions.length > 0 && (
          <div className="author-actions">
            <div className="author-actions-header">
              <h4>Действия автора</h4>
              <p>
                Как автор задачи, вы можете отметить решения, которые вам
                понравились
              </p>
            </div>

            <div className="liked-solutions-summary">
              <span>
                Отмечено решений: <strong>{likedSolutions.size}</strong> из{' '}
                {solutions.length}
              </span>
            </div>
          </div>
        )}
      </div>

      <SolutionAIInfluenceModal
        visible={showInfluenceModal}
        onCancel={() => {
          setShowInfluenceModal(false);
        }}
        data={influenceData}
        loading={loadingInfluence}
      />
    </Card>
  );
}

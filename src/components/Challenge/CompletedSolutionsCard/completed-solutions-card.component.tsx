import { useState } from 'react';
import { Card, List, Empty, Button, message, Pagination } from 'antd';
import {
  SolutionOutlined,
  UpOutlined,
  DownOutlined,
  UserOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import './completed-solutions-card.component.scss';

interface CompletedSolution {
  id: string;
  authorName: string;
  authorId: string;
  content: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isLiked?: boolean;
  likesCount?: number;
}

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
      // TODO: Реализовать API для лайков решений
      const newLiked = new Set(likedSolutions);
      if (newLiked.has(solutionId)) {
        newLiked.delete(solutionId);
        messageApi.success('Отметка убрана');
      } else {
        newLiked.add(solutionId);
        messageApi.success('Решение отмечено как понравившееся');
      }
      setLikedSolutions(newLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      messageApi.error('Ошибка при изменении отметки');
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ready_for_review':
        return { label: 'На рассмотрении', class: 'ready-for-review' };
      case 'completed':
        return { label: 'Завершено', class: 'completed' };
      default:
        return { label: 'Неизвестно', class: 'draft' };
    }
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
                const statusInfo = getStatusInfo(solution.status);

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
                          <div className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.label}
                          </div>

                          <div className="date-info">
                            <ClockCircleOutlined className="date-icon" />
                            <span>{formatDate(solution.updatedAt)}</span>
                          </div>
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
                          icon={<EyeOutlined />}
                          onClick={() => handleToggleExpand(solution.id)}
                          className="expand-button"
                        >
                          {isExpanded ? 'Свернуть' : 'Развернуть'}
                        </Button>
                      </div>
                    </div>

                    <div className="solution-content">
                      <div className="content-text">
                        {isExpanded
                          ? solution.content
                          : truncateContent(solution.content)}
                      </div>

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
    </Card>
  );
}

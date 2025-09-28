import { useState } from 'react';
import { Card } from 'antd';
import {
  UserOutlined,
  UpOutlined,
  DownOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { SolutionModel, SolutionVersionModel } from 'src/models';
import './author-solution-card.component.scss';
import { AdvancedEditor } from 'src/components';

interface AuthorSolutionCardProps {
  authorSolution: {
    solution: SolutionModel;
    currentVersion: SolutionVersionModel;
  };
  authorName: string;
}

export function AuthorSolutionCard({
  authorSolution,
  authorName,
}: AuthorSolutionCardProps) {
  const [collapsed, setCollapsed] = useState(false);

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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Черновик', class: 'draft' };
      case 'ready_for_review':
        return { label: 'Готово для просмотра', class: 'ready-for-review' };
      case 'completed':
        return { label: 'Завершено', class: 'completed' };
      default:
        return { label: 'Неизвестно', class: 'draft' };
    }
  };

  const statusInfo = getStatusInfo(authorSolution.solution.status);

  return (
    <Card className="challenge-card author-solution-card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon">
            <UserOutlined />
          </div>
          Решение автора
        </div>

        <div className="card-actions">
          <div className={`status-badge ${statusInfo.class}`}>
            {statusInfo.label}
          </div>

          <button
            className={`collapse-button ${collapsed ? 'collapsed' : ''}`}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <DownOutlined /> : <UpOutlined />}
          </button>
        </div>
      </div>

      <div className={`card-content ${collapsed ? 'collapsed' : ''}`}>
        {/* Мета информация о решении */}
        <div className="solution-meta">
          <div className="meta-item">
            <UserOutlined className="meta-icon" />
            <span>Автор: {authorName}</span>
          </div>

          <div className="meta-item">
            <ClockCircleOutlined className="meta-icon" />
            <span>
              Создано: {formatDate(authorSolution.solution.created_at)}
            </span>
          </div>

          {authorSolution.currentVersion.created_at && (
            <div className="meta-item">
              <FileTextOutlined className="meta-icon" />
              <span>
                Версия {authorSolution.currentVersion.version_number} от{' '}
                {formatDate(authorSolution.currentVersion.created_at)}
              </span>
            </div>
          )}
        </div>

        {/* Текст решения */}
        <div className="content-block">
          <div className="content-label">
            <FileTextOutlined />
            Текст решения
          </div>
          <AdvancedEditor
            value={
              authorSolution.currentVersion.content ||
              'Решение пока не добавлено'
            }
            readonly={true}
          />
        </div>

        {/* Описание изменений (если есть) */}
        {authorSolution.currentVersion.change_description && (
          <div className="content-block">
            <div className="content-label">
              <ClockCircleOutlined />
              Описание изменений
            </div>
            <div className="content-text readonly change-description">
              {authorSolution.currentVersion.change_description}
            </div>
          </div>
        )}

        {/* Информационное сообщение */}
        <div className="author-solution-note">
          <p>
            💡 Это решение автора задачи. Вы можете использовать его как основу
            для своего решения или изучить подход к решению проблемы.
          </p>
        </div>
      </div>
    </Card>
  );
}

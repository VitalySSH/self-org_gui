import './member-request-vote-card.component.scss';
import { Card } from 'antd';
import { useState } from 'react';
import {
  MemberRequestCardProps,
  TableMemberRequest,
} from 'src/interfaces';
import {
  MemberRequestVoteButton,
} from 'src/components';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

export function MemberRequestVoteCard({ item, setLoading }: MemberRequestCardProps<TableMemberRequest>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_REASON_LENGTH = 20;

  const renderActions = () => {
    return [
      <MemberRequestVoteButton
        key={item.key}
        tableRow={item}
        setLoading={setLoading}
      />
    ];
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const renderReason = () => {
    if (!item.reason) return null;

    const shouldTruncate = item.reason.length > MAX_REASON_LENGTH;
    const displayText = isExpanded || !shouldTruncate
      ? item.reason
      : `${item.reason.substring(0, MAX_REASON_LENGTH)}...`;

    return (
      <div className="reason-container">
        <div className="reason-content">
          <strong>Сопроводительное письмо:</strong>
          <span className={`reason-text ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {displayText}
          </span>
        </div>
        {shouldTruncate && (
          <div className="expand-button" onClick={toggleExpand}>
            {isExpanded ? (
              <>
                <UpOutlined /> Свернуть текст
              </>
            ) : (
              <>
                <DownOutlined /> Раскрыть текст
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="member-request-vote-card" actions={renderActions()}>
      <div className="card-content">
        <div>
          <strong>Участник сообщества:</strong> {item.member}
        </div>
        <div>
          <strong>Решение:</strong> {item.decision}
        </div>
        <div>
          <strong>Статус:</strong> {item.status}
        </div>
        <div>
          <strong>Дата подачи:</strong> {item.created}
        </div>
        {renderReason()}
      </div>
    </Card>
  );
}
import { Card } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { MemberRequestCardProps, MemberRequestCardItem } from 'src/interfaces';
import {
  CoverLetter,
  MemberRequestVoteButton,
  MemberRequestVotesButton,
} from 'src/components';
import './member-request-vote-card.component.scss';

export function MemberRequestVoteCard({
  item,
  setLoading,
  isParent,
}: MemberRequestCardProps<MemberRequestCardItem>) {
  const renderActions = () => {
    if (isParent) {
      return [<MemberRequestVotesButton key={item.key} item={item} />];
    } else {
      return [
        <MemberRequestVoteButton
          key={item.key}
          item={item}
          setLoading={setLoading}
        />,
      ];
    }
  };

  return (
    <Card
      className={`member-request-vote-card ${!isParent ? 'expanded-card' : ''}`}
      actions={renderActions()}
    >
      <div className="card-content">
        <div className="info-item member-info">
          <span className="info-label">Участник:</span>
          <span className="info-value">{item.member}</span>
        </div>

        <div className="info-item decision-info">
          <span className="info-label">Решение:</span>
          <span className="info-value">{item.decision}</span>
        </div>

        <div className="info-item status-info">
          <span className="info-label">Статус:</span>
          <span className="info-value">{item.status}</span>
        </div>

        <div className="info-item date-info">
          <span className="info-label">Дата подачи:</span>
          <span className="info-value">{item.created}</span>
        </div>

        {!isParent && item.reason && (
          <div className="reason-section">
            <div className="reason-label">
              <FileTextOutlined className="reason-icon" />
              Сопроводительное письмо
            </div>
            <CoverLetter letter={item.reason} showIcon={false} />
          </div>
        )}
      </div>
    </Card>
  );
}
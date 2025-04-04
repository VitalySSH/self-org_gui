import './member-request-vote-card.component.scss';
import { Card } from 'antd';
import { MemberRequestCardProps, MemberRequestCardItem } from 'src/interfaces';
import {
  CoverLetter,
  MemberRequestVoteButton,
  MemberRequestVotesButton,
} from 'src/components';

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
        {!isParent && <CoverLetter letter={item.reason} />}
      </div>
    </Card>
  );
}

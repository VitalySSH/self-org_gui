import './member-request-vote-card.component.scss';
import { Card } from 'antd';
import { MemberRequestCardProps, TableMemberRequest } from 'src/interfaces';
import { CoverLetter, MemberRequestVoteButton } from 'src/components';

export function MemberRequestVoteCard({
  item,
  setLoading,
}: MemberRequestCardProps<TableMemberRequest>) {
  const renderActions = () => {
    return [
      <MemberRequestVoteButton
        key={item.key}
        tableRow={item}
        setLoading={setLoading}
      />,
    ];
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
        <CoverLetter letter={item.reason} />
      </div>
    </Card>
  );
}

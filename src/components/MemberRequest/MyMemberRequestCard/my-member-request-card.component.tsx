import './my-member-request-card.component.scss';
import { Card, Button, Badge } from 'antd';
import {
  MemberRequestCardProps,
  MyMemberRequestCardItem,
} from 'src/interfaces';
import { TeamOutlined } from '@ant-design/icons';
import {
  CoverLetter,
  MemberRequestDisputeButton,
  MemberRequestJoinButton,
  MemberRequestRemoveButton,
} from 'src/components';
import {
  CommunityMemberCode,
  OnConsiderationCode,
  MemberExcludedCode,
  RequestSuccessfulCode,
  RequestDeniedCode,
} from 'src/consts';
import Meta from 'antd/es/card/Meta';

export function MyMemberRequestCard({
  item,
  setLoading,
  onShowSubCommunities,
}: MemberRequestCardProps<MyMemberRequestCardItem>) {
  const renderActions = () => {
    const mainAction = (() => {
      switch (item.statusCode) {
        case OnConsiderationCode:
          return (
            <MemberRequestRemoveButton item={item} setLoading={setLoading} />
          );
        case RequestDeniedCode:
          return (
            <MemberRequestRemoveButton item={item} setLoading={setLoading} />
          );
        case RequestSuccessfulCode:
          return (
            <MemberRequestJoinButton item={item} setLoading={setLoading} />
          );
        case CommunityMemberCode:
          return (
            <MemberRequestRemoveButton item={item} setLoading={setLoading} />
          );
        case MemberExcludedCode:
          return (
            <MemberRequestDisputeButton item={item} setLoading={setLoading} />
          );
        default:
          return null;
      }
    })();

    const subcommunitiesAction = item.children?.length ? (
      <Badge count={item.children.length} size="small" offset={[-5, 5]}>
        <Button
          type="text"
          icon={<TeamOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onShowSubCommunities?.(item);
          }}
        >
          Подсообщества
        </Button>
      </Badge>
    ) : null;

    return [mainAction, subcommunitiesAction].filter(Boolean);
  };

  return (
    <Card className="member-request-card" actions={renderActions()}>
      <Meta
        title={item.communityName}
        description={item.communityDescription}
      />

      <div className="card-content">
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

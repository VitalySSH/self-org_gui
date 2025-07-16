import { Tabs } from 'antd';
import {
  CommunitySettings,
  CommonAddMemberRequests,
  ParameterStatistics,
} from 'src/pages';
import {
  SettingOutlined,
  BarChartOutlined,
  UserAddOutlined,
} from '@ant-design/icons';

export function CommunitySummary(props: any) {
  const communityId = props?.communityId;

  const items = [
    {
      label: (
        <span className="workspace-tab-label">
          <SettingOutlined />
          Общие настройки
        </span>
      ),
      key: '1',
      children: <CommunitySettings communityId={communityId} />,
    },
    {
      label: (
        <span className="workspace-tab-label">
          <BarChartOutlined />
          Статистика параметров
        </span>
      ),
      key: '2',
      children: <ParameterStatistics communityId={communityId} />,
    },
    {
      label: (
        <span className="workspace-tab-label">
          <UserAddOutlined />
          Заявки на вступление
        </span>
      ),
      key: '3',
      children: <CommonAddMemberRequests communityId={communityId} />,
    },
  ];

  return (
    <div className="workspace-page workspace-tabs-full-width">
      <Tabs
        defaultActiveKey="1"
        items={items}
        className="workspace-tabs"
        size="large"
      />
    </div>
  );
}
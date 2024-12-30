import { Layout, Tabs } from "antd";
import {
    CommunitySettings,
    CommonAddMemberRequests,
    ParameterStatistics,
    CommonSubCommunities
} from "src/pages";

export function CommunitySummary(props: any) {

    const communityId = props?.communityId;

    const items = [
        {
            label: 'Общие настройки',
            key: '1',
            children: <CommunitySettings communityId={communityId} />,
        },
        {
            label: 'Внутренние сообщества',
            key: '2',
            children: <CommonSubCommunities communityId={communityId} />,
        },
        {
            label: 'Статистика параметров',
            key: '3',
            children: <ParameterStatistics communityId={communityId} />,
        },
        {
            label: 'Заявки на вступление',
            key: '4',
            children: <CommonAddMemberRequests communityId={communityId} />,
        }
    ];

    return (
        <Layout className="community-work-space">
            <Tabs
                defaultActiveKey="1"
                type="card"
                items={items}
            />
        </Layout>
    );
}


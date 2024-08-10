import {
    Layout,
    Tabs,
} from "antd";
import {
    CommunitySettings
} from "../CommunitySettings/community-settings.page.tsx";
import {
    CommonAddMemberRequests
} from "../../membership/CommonAddMemberRequests/common-add-member-requests.page.tsx";
import {
    CommonRemoveMemberRequests
} from "../../membership/CommonRemoveMemberRequests/common-remove-member-requests.page.tsx";

export function CommunitySummary(props: any) {

    const communityId = props?.communityId;

    const items = [
        {
            label: 'Общие настройки',
            key: '1',
            children: <CommunitySettings communityId={communityId} />,
        },
        {
            label: 'Заявки на вступление',
            key: '2',
            children: <CommonAddMemberRequests communityId={communityId} />,
        },
        {
            label: 'Заявки на исключение',
            key: '3',
            children: <CommonRemoveMemberRequests communityId={communityId} />,
        }
    ];

    return (
        <Layout>
            <Tabs
                defaultActiveKey="1"
                centered
                items={items}
            />
        </Layout>
    );
}


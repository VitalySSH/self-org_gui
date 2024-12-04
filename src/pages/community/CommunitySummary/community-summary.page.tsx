import { ConfigProvider, Layout, Tabs } from "antd";
import {
    CommunitySettings,
    CommonAddMemberRequests,
    ParameterStatistics
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
            label: 'Статистика параметров',
            key: '2',
            children: <ParameterStatistics communityId={communityId} />,
        },
        {
            label: 'Заявки на вступление',
            key: '3',
            children: <CommonAddMemberRequests communityId={communityId} />,
        }
    ];

    return (
        <Layout>
            <ConfigProvider
                theme={{
                    components: {
                        Tabs: {
                            itemSelectedColor: 'black',
                            itemColor: '#7e7f80',
                            itemHoverColor: 'red',
                            titleFontSize: 16,
                        },
                    },
                }}
            >
                <Tabs
                    defaultActiveKey="1"
                    type="card"
                    items={items}
                />
            </ConfigProvider>
        </Layout>
    );
}


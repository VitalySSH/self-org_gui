import { Layout, List, Space, Typography } from "antd";
import { CrudDataSourceService } from "../../../services";
import { CommunityModel } from "../../../models";
import { useEffect, useState } from "react";
import { AuthContextProvider, CommunityCard } from "../../../interfaces";
import { useAuth } from "../../../hooks";
import { AllCommunityCard } from "../../../components";



export function AllCommunities() {

    const authData: AuthContextProvider = useAuth();
    const [loading, setLoading] =
        useState(true);
    const [dataSource, setDataSource] =
        useState([] as CommunityCard[]);

    const communityService =
        new CrudDataSourceService(CommunityModel);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData = () => {
        if (loading) {
            communityService
                .list(undefined, undefined, undefined,
                [
                    'user_settings.user',
                    'main_settings.name',
                    'main_settings.description',
                    'main_settings.adding_members.creator',
                ])
                .then(data => {
                    const items: CommunityCard[] = [];
                    data.forEach(community => {
                        const isMyCommunity =
                            (community.user_settings || [])
                                .filter(
                                    (ucs) =>
                                        ucs.user?.id === authData.user?.id
                                ).length > 0;
                        const isAddRequest =
                            (community.main_settings?.adding_members || [])
                                .filter(
                                    (rm) =>
                                        rm.creator?.id === authData.user?.id
                                ).length > 0;
                        const item = {
                            id: community.id || '',
                            title: community
                                .main_settings?.name?.name || '',
                            description: community
                                .main_settings?.description?.value || '',
                            members: (community.user_settings || []).length,
                            isMyCommunity: isMyCommunity || isAddRequest,
                        };
                        items.push(item);
                    });
                    setDataSource(items);
                }).catch((error) => {
                console.log(error);
            }).finally(() => {
                setLoading(false);
            });
        }
    }

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <Layout
            style={{height: '100%', overflowY: "scroll"}}
        >
            <Space
                direction="vertical"
                className="communities"
            >
                <Typography.Title level={3}>Сообщества</Typography.Title>
                <List
                    itemLayout="vertical"
                    dataSource={dataSource}
                    loading={loading}
                    locale={{emptyText: "Нет сообществ"}}
                    pagination={{
                        position: 'bottom',
                        align: 'center'
                    }}
                    size="large"
                    renderItem={(item: CommunityCard) => (
                        <List.Item>
                            <AllCommunityCard key={item.id} item={item} />
                        </List.Item>
                    )}
                />
            </Space>
        </Layout>
    );
}

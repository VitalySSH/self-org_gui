import { Card, Layout, List, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import {
    CommunityAOService,
} from "../../../services";
import Meta from "antd/es/card/Meta";
import { useNavigate } from "react-router-dom";
import { CommunityCard } from "../../../interfaces";

export function MyCommunities() {

    const navigate = useNavigate();
    const [loading, setLoading] =
        useState(true);
    const [dataSource, setDataSource] =
        useState([] as CommunityCard[]);

    const communityService = new CommunityAOService();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData = () => {
        if (loading) {
            communityService
                .myList(undefined, undefined, undefined,
                    [
                        'user_settings',
                        'main_settings.name',
                        'main_settings.description',
                    ])
                .then(data => {
                    const communities: CommunityCard[] = [];
                    data.forEach(community => {
                        const communityItem = {
                            id: community.id || '',
                            title: community
                                .main_settings?.name?.name || '',
                            description: community
                                .main_settings?.description?.value || '',
                            members: (community.user_settings || []).length,
                        };
                        communities.push(communityItem);
                    });
                    setDataSource(communities);
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
            style={{ height: '100%', overflowY: "scroll" }}
        >
            <Space
                direction="vertical"
                className="communities"
            >
                <Typography.Title level={3}>Мои сообщества</Typography.Title>
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
                            <Card
                                onClick={() => {
                                    const path =
                                        `/my-communities/${item.id}`;
                                    navigate(path);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                <Meta
                                    title={item.title}
                                    description={item.description}
                                />
                                <div className="community-members">
                                    Участников: {item.members}
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            </Space>
        </Layout>
    );
}


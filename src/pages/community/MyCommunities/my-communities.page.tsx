import { Card, Layout, List, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import {
    CommunityAoDataSourceService,
} from "../../../services";
import { CommunityModel } from "../../../models";
import { CloseSquareOutlined, CheckSquareOutlined } from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import { useNavigate } from "react-router-dom";
import { CommunityCard } from "../../../interfaces";

export function MyCommunities() {

    const navigate = useNavigate();
    const [loading, setLoading] =
        useState(true);
    const [dataSource, setDataSource] =
        useState([] as CommunityCard[]);

    const communityService =
        new CommunityAoDataSourceService(CommunityModel);

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
                    renderItem={(item: CommunityCard) => (
                        <List.Item>
                            <Card
                                actions={[
                                    <div
                                        style={{
                                            display: "flex",
                                            color: "black",
                                            alignContent: "center",
                                            justifyContent: "center",
                                        }}
                                        onClick={() => {
                                            const path =
                                                `/my-communities/${item.id}`;
                                            navigate(path);
                                        }}
                                    >
                                        <CheckSquareOutlined
                                            style={{
                                                fontSize: 18
                                            }}
                                        />
                                        <span
                                            style={{
                                                marginLeft: 10
                                            }}
                                        >Перейти</span>
                                    </div>,
                                    <div
                                        style={{
                                            display: "flex",
                                            color: "black",
                                            alignContent: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <CloseSquareOutlined
                                            style={{
                                                fontSize: 18
                                            }}
                                        />
                                        <span
                                            style={{
                                                marginLeft: 10
                                            }}
                                        >Покинуть</span>
                                    </div>,
                                ]}
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


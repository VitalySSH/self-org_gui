import { SolutionOutlined } from "@ant-design/icons"
import { Card, Layout, List, Space, Typography } from "antd";
import { CrudDataSourceService } from "../../../services";
import { CommunityModel } from "../../../models";
import { useEffect, useState } from "react";
import Meta from "antd/es/card/Meta";
import { CommunityCard } from "../../../interfaces";


export function AllCommunities() {

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
                    'user_settings',
                    'main_settings.name',
                    'main_settings.description',
                ])
                .then(data => {
                    const items: CommunityCard[] = [];
                    data.forEach(community => {
                        const item = {
                            id: community.id || '',
                            title: community
                                .main_settings?.name?.name || '',
                            description: community
                                .main_settings?.description?.value || '',
                            members: (community.user_settings || []).length,
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
            style={{ height: '100%', overflowY: "scroll" }}
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
                                    >
                                        <SolutionOutlined
                                            style={{
                                                fontSize: 18
                                            }}
                                        />
                                        <span
                                            style={{
                                                marginLeft: 10
                                            }}
                                        >Заявка на вступление</span>
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

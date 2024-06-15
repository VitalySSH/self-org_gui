import { EllipsisOutlined } from "@ant-design/icons"
import { Card, Layout, List, Space, Typography } from "antd";
import { CrudDataSourceService } from "../../../services";
import { CommunityModel } from "../../../models";
import { useEffect, useState } from "react";
import Meta from "antd/es/card/Meta";


export function AllCommunities() {

    const [loading, setLoading] =
        useState(true);
    const [dataSource, setDataSource] =
        useState([] as { title: string, description: string }[]);

    const communityService =
        new CrudDataSourceService(CommunityModel);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData = () => {
        if (loading) {
            communityService
                .list(undefined, undefined, undefined,
                ['main_settings.name', 'main_settings.description'])
                .then(data => {
                    const items: { title: string, description: string }[] = [];
                    data.forEach(community => {
                        const item = {
                            title: community
                                .main_settings?.name?.name || '',
                            description: community
                                .main_settings?.description?.value || '',
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
        <Layout>
            <Space
                direction="vertical"
                className="communities"
            >
                <Typography.Title level={3}>Сообщества</Typography.Title>
                <List
                    itemLayout="vertical"
                    dataSource={dataSource}
                    loading={loading}
                    renderItem={(item: { title: string; description: string; }) => (
                        <List.Item>
                            <Card
                                actions={[
                                    <EllipsisOutlined key="ellipsis" />,
                                ]}
                            >
                                <Meta
                                    title={item.title}
                                    description={item.description}
                                />
                            </Card>
                        </List.Item>
                    )}
                />
            </Space>
        </Layout>
    );
}

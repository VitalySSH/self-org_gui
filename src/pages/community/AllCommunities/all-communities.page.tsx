import { Card, List, Space, Typography } from "antd";
import { CrudDataSourceService } from "../../../services";
import { CommunityModel } from "../../../models";
import { useEffect, useState } from "react";


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
                            title: community.main_settings?.name?.name || '',
                            description: community.main_settings?.description?.value || '',
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

    const onClick = () => {

    }

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <Space
            direction="vertical"
            style={{
                width: "40vw",
                overflow: "auto",
                padding: "0 6px",
            }}
        >
            <Typography.Title level={3}>Сообщества</Typography.Title>
            <List
                itemLayout="vertical"
                dataSource={dataSource}
                loading={loading}
                renderItem={(item: { title: string; description: string; }) => (
                    <List.Item>
                        <Card
                            title={item.title}
                            onClick={onClick}
                            style={{
                                cursor: "pointer",
                            }}
                            styles={{
                                body: {
                                    width: '100%',
                                    height: 120,
                                    overflowY: "scroll",
                                    overflowX: "hidden",
                                }
                            }}
                        >{item.description}</Card>
                    </List.Item>
                )}/>
        </Space>
    );
}

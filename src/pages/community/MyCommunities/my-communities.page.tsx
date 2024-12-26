import { Card, Layout, List, Typography } from "antd";
import { useEffect, useState } from "react";
import { StopOutlined } from "@ant-design/icons";
import {
    CommunityAOService,
} from "src/services";
import Meta from "antd/es/card/Meta";
import { useNavigate } from "react-router-dom";
import { AuthContextProvider, CommunityCard } from "src/interfaces";
import { useAuth } from "src/hooks";

export function MyCommunities() {

    const navigate = useNavigate();
    const authData: AuthContextProvider = useAuth();

    const [loading, setLoading] =
        useState(true);
    const [dataSource, setDataSource] =
        useState([] as CommunityCard[]);

    const communityService = new CommunityAOService();

    // FIXME: переделать на функционал оспаривания решения
    const getActions = (item: CommunityCard) => {
        if (item.isBlocked) {
            return [
                <div
                    style={{
                        display: "flex",
                        color: "black",
                        alignContent: "center",
                        justifyContent: "center",
                        cursor: "auto",
                    }}
                >
                    <StopOutlined
                        style={{ fontSize: 24 }}
                        disabled
                    />
                    <span
                        style={{
                            marginLeft: 10
                        }}
                    >Вы заблокированы большинством голосов</span>
                </div>
            ];
        } else {
            return [];
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData = () => {
        if (loading) {
            communityService
                .myList(undefined, undefined, undefined,
                    [
                        'user_settings.user',
                        'main_settings.name',
                        'main_settings.description',
                    ])
                .then(data => {
                    const communities: CommunityCard[] = [];
                    data.forEach(community => {
                        const settings =
                            (community.user_settings || [])
                                .filter((settings) =>
                                    settings.user?.id === authData.user?.id);
                        const isBlocked =
                            settings.length ? settings[0].is_blocked : false;
                        const communityItem = {
                            id: community.id || '',
                            title: community
                                .main_settings?.name?.name || '',
                            description: community
                                .main_settings?.description?.value || '',
                            members: (community.user_settings || []).length,
                            isBlocked: isBlocked,
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

    const getOnClick = (item: CommunityCard) => {
        const onClick = () => {
            navigate(`/my-communities/${item.id}`);
        }

        return !item.isBlocked ? onClick : undefined;
    }

    const getCardStyle = (item: CommunityCard) => {
        return !item.isBlocked ? { cursor: "pointer" } : {};
    }

    return (
        <Layout className="communities-list">
            <Typography.Title
                level={3}
                style={{ textAlign: "center" }}
            >
                Мои сообщества
            </Typography.Title>
            <List
                itemLayout="vertical"
                dataSource={dataSource}
                loading={loading}
                locale={{emptyText: "Нет сообществ"}}
                pagination={ dataSource.length >= 20 ? {
                    position: 'bottom',
                    align: 'end'
                } : false }
                size="large"
                renderItem={(item: CommunityCard) => (
                    <List.Item>
                        <Card
                            onClick={ getOnClick(item) }
                            style={ getCardStyle(item) }
                            actions={ getActions(item) }
                        >
                            <Meta
                                title={ item.title }
                                description={ item.description }
                            />
                            <div className="community-members">
                                Участников: { item.members }
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
        </Layout>
    );
}


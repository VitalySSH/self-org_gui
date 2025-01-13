import { List } from "antd";
import { CrudDataSourceService } from "src/services";
import { CommunityModel } from "src/models";
import { useEffect, useState } from "react";
import { AuthContextProvider, CommunityCardInterface } from "src/interfaces";
import { useAuth } from "src/hooks";
import { CommunityCard } from "src/components";


export function AllCommunities() {

    const authData: AuthContextProvider = useAuth();
    const [loading, setLoading] =
        useState(true);
    const [dataSource, setDataSource] =
        useState([] as CommunityCardInterface[]);

    const communityService =
        new CrudDataSourceService(CommunityModel);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData = () => {
        if (loading) {
            communityService
                .list([
                    {
                        field: 'parent_id',
                        op: 'null',
                        val: false,
                    },
                ],
                undefined, undefined,
                [
                    'user_settings.user',
                    'main_settings.name',
                    'main_settings.description',
                    'main_settings.adding_members.creator',
                ])
                .then(data => {
                    const items: CommunityCardInterface[] = [];
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
                                        rm.member?.id === authData.user?.id
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
        <div className="communities-list">
            <div className="page-header">
                Сообщества
            </div>
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 1,
                    md: 1,
                    lg: 1,
                    xl: 2,
                    xxl: 2
                }}
                itemLayout="vertical"
                dataSource={dataSource}
                loading={loading}
                locale={{emptyText: "Нет сообществ"}}
                pagination={dataSource.length >= 20 ? {
                    position: 'bottom',
                    align: 'end'
                } : false}
                size="large"
                renderItem={(item: CommunityCardInterface) => (
                    <List.Item>
                        <CommunityCard
                            key={item.id}
                            item={item}
                            actions={[]}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
}

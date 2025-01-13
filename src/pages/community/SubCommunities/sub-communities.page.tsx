import { List } from "antd";
import { CommunityCardInterface } from "src/interfaces";
import { CommunityCard } from "src/components";
import { useEffect, useState } from "react";
import { CommunityAOService } from "src/services";

export function SubCommunities(props: any) {

    const communityId = props?.communityId;

    const [loading, setLoading] =
        useState(true);
    const [
        dataSource,
        setDataSource
    ] = useState([] as CommunityCardInterface[]);

    const communityService = new CommunityAOService();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData = () => {
        if (loading) {
            communityService
                .getSubCommunities(communityId)
                .then(items => {
                    setDataSource(items);
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
                Внутренние сообщества
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

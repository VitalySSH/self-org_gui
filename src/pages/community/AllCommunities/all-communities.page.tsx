import { Card, List } from "antd";
import { CrudDataSourceService } from "../../../services";
import { CommunityModel } from "../../../models";
import { useEffect, useState } from "react";


export function AllCommunities() {

    const [loading, setLoading] = useState(true);
    const [dataSource, setDataSource] =
        useState([] as { title: string, description: string }[]);
    const communityService = new CrudDataSourceService(CommunityModel);

    useEffect(() => {
        if (loading) {
            communityService.list(undefined, undefined, undefined,
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
    }, [communityService]);

    return (
        <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={dataSource}
            loading={loading}
            renderItem={(item: { title: string, description: string }) => (
                <List.Item>
                    <Card title={item.title}>{item.description}</Card>
                </List.Item>
            )}
        />
    );
}

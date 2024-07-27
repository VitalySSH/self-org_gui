import { Layout, Space, Typography } from "antd";

export function AddMemberRequest(props: any) {

    const communityId = props?.communityId;

    return (
        <Layout
            style={{height: '100%', overflowY: "scroll"}}
        >
            <Space
                direction="vertical"
                className="communities"
            >
                <Typography.Title level={3}>Заявки пользователей на вступление в сообщество</Typography.Title>
            </Space>
        </Layout>
    );
}

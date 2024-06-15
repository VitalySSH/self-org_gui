import { Layout, Space, Typography } from "antd";

export function NewCommunity() {
    return (
        <Layout>
            <Space
                direction="vertical"
                className="communities"
            >
                <Typography.Title
                    level={3}
                    style={{ textAlign: "center" }}
                >Новое сообщество</Typography.Title>
            </Space>
        </Layout>
    );
}


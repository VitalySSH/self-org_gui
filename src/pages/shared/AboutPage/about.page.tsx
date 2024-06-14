import { Flex, Image, Space, Typography, Layout } from "antd";

export function AboutPage() {
    return (
        <Layout>
            <div
                style={{
                    marginLeft: "auto",
                    marginRight: "auto",
                    maxWidth: "60%",
                    textAlign: "center",
                }}
            >
                <Typography.Title
                    level={1}
                >Платформа для управления сообществами</Typography.Title>
                <div
                    style={{
                        margin: "0 0 30px 0",
                        padding: "0 1 30px 0",
                        borderStyle: "solid",
                        borderWidth: "0 0 1px 0",
                        borderColor: "red",
                    }}
                ></div>
            </div>
            <Space
                style={{
                    padding: 30,
                }}
            >
                <div
                    style={{
                        maxWidth: 500,
                        fontSize: 20,
                    }}
                >Экспериментальный проект, основанный на принципах прямой
                    демократии, предлагает широкие возможности для
                    самоорганизации и управления различными небольшими
                    сообществами.
                </div>
                <Flex align="center" justify="flex-end">
                    <Image
                        height={400}
                        preview={false}
                        src="/community.svg"
                        style={{
                            margin: 20
                        }}
                    />
                </Flex>
            </Space>
        </Layout>
    )
}

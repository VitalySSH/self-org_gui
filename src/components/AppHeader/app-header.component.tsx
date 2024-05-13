import { MailOutlined, BellFilled, UserOutlined } from "@ant-design/icons"
import { Avatar, Badge, Flex, Space } from "antd";
import { useLocalStorage } from "../../hooks";

export function AppHeader() {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [user, _setUser] = useLocalStorage('user', null);
    let userName = '';
    if (user) {
        userName = `${user.firstname } ${user.surname }`
    }

    return (
        <Flex>
            <Space>
                <Avatar
                    icon={<UserOutlined />}
                    size={40}
                    style={{
                        color: "black",
                        background: "white" ,
                        borderWidth: 2,
                        borderColor: "black",
                        cursor: "pointer"
                    }}
                />
                <div style={{ marginRight: 20 }}>
                    <span>{ userName }</span>
                </div>
                <Badge count={2} dot style={{ marginRight: 20 }}>
                    <MailOutlined style={{
                        fontSize: 24,
                        marginRight: 20,
                        cursor: "pointer",
                    }}/>
                </Badge>
                <Badge count={5} style={{ marginRight: 20 }}>
                    <BellFilled style={{
                        fontSize: 24,
                        marginRight: 20,
                        cursor: "pointer",
                    }}/>
                </Badge>
            </Space>
        </Flex>
    )
}
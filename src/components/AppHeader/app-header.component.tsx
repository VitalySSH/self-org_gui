import {
    MailOutlined,
    BellFilled,
    UserOutlined,
    QuestionCircleFilled,
    LogoutOutlined,
} from "@ant-design/icons"
import {
    Avatar,
    Badge,
    Flex,
    notification,
    NotificationArgsProps,
    Space
} from "antd";
import { useLocalStorage } from "../../hooks";
import { useNavigate } from "react-router-dom";
import './app-header.component.css';

type NotificationPlacement = NotificationArgsProps['placement'];


export function AppHeader() {

    const navigate = useNavigate();
    const [api, contextHolder] =
        notification.useNotification();

    const [user, setUser] = useLocalStorage('user', null);
    let userName = '';
    if (user) {
        userName = `${user.firstname } ${user.surname }`
    }

    const avatarOnClick = () => {
        navigate('/my-profile');
    }

    const openNotification = (placement: NotificationPlacement) => {
        api.info({
            message: `Уведомление`,
            description: 'Не тыкай сюда!',
            placement,
        });
    };

    const LogoutOnClick = () => {
        setUser(null);
        navigate('/sign-in');
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
                    onClick={avatarOnClick}
                />
                <div className="user-name">
                    <span>{ userName }</span>
                </div>
                <LogoutOutlined
                    style={{
                        marginRight: 20,
                        fontSize: 24,
                        cursor: "pointer",
                    }}
                    onClick={LogoutOnClick}
                />
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
                <Space>
                    {contextHolder}
                    <QuestionCircleFilled
                        onClick={() => openNotification('bottomRight')}
                        style={{
                            fontSize: 28,
                            marginRight: 20,
                            cursor: "pointer",
                        }}
                    />
                </Space>
            </Space>
        </Flex>
    )
}
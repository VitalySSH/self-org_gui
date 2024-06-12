import { LoginOutlined } from "@ant-design/icons";
import { Flex, Space } from "antd";
import { useNavigate } from "react-router-dom";

export function NotAuthHeaderIcons() {

    const navigate = useNavigate();

    const loginOnClick = () => {
        navigate('/sign-in');
    }

    return (
        <Flex>
            <Space>
                <LoginOutlined style={{
                    fontSize: 24,
                    cursor: "pointer"
                }}
                onClick={loginOnClick}
                />
                <div className="icon-text">
                    <span>Войти</span>
                </div>
            </Space>
        </Flex>
    )
}
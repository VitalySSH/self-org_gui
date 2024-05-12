import { MailOutlined, BellFilled } from "@ant-design/icons"
import { Badge, Image, Space } from "antd";
import {useNavigate} from "react-router-dom";

export function AppHeader() {

    const navigate = useNavigate();
    const onClickImage = () => {
        navigate('/');
    }

    return (
        <div className="AppHeader">
            <a href="">
                <Image
                height={40}
                preview={false}
                src="/utu_logo.png"
                onClick={onClickImage}
                >
                </Image>
            </a>
            <Space>
                <Badge count={2} dot>
                    <MailOutlined style={{ fontSize: 24 }}/>
                </Badge>
                <Badge count={5}>
                    <BellFilled style={{ fontSize: 24 }}/>
                </Badge>
            </Space>
        </div>
    )
}
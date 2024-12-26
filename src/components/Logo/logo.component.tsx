import { Flex, Image } from "antd";
import { useNavigate } from "react-router-dom";

export function Logo() {

    const navigate = useNavigate();
    const onClickImage = () => {
        navigate('/', { preventScrollReset: true });
    }

    return (
        <Flex>
            <Image
                height={40}
                preview={false}
                src="/utu_logo.png"
                onClick={onClickImage}
                className="logo"
            >
            </Image>
        </Flex>
    )
}

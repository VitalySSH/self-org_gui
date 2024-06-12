import { Flex, Image } from "antd";
import { useNavigate } from "react-router-dom";

export function Logo() {

    const navigate = useNavigate();
    const onClickImage = () => {
        navigate('/', { preventScrollReset: true });
    }

    return (
        <Flex align="center" justify="center">
            <Image
                height={40}
                preview={false}
                src="/utu_logo.png"
                onClick={onClickImage}
                style={{
                    width: "auto",
                    cursor: "pointer",
                    position: "fixed",
                    top: 8,
                    marginLeft: 21,
                }}
            >
            </Image>
        </Flex>
    )
}

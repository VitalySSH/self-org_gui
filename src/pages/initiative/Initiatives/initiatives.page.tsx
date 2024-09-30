import { Flex, Image } from "antd";

export function Initiatives(props: any) {

    return (
        <Flex align="center" justify="center">
            <Image
                preview={false}
                src="/reconstruktion.png"
                style={{
                    marginTop: 200,
                    maxWidth: 700
                }}
            />
        </Flex>
    );
}


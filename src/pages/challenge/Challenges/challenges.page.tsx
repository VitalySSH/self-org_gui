import { Flex, Image } from 'antd';

export function Challenges(props: any) {
  console.log(props);

  return (
    <div className="content-container">
      <Flex align="center" justify="center">
        <Image
          preview={false}
          src="/reconstruktion.png"
          style={{
            marginTop: 200,
            maxWidth: 500,
          }}
        />
      </Flex>
    </div>
  );
}

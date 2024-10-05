import { Button, message } from "antd";
import { RequestExcludedCode } from "../../consts";


export function MemberRequestDisputeButton(props: any) {

    const tableRow = props.tableRow;
    const [messageApi, contextHolder] =
        message.useMessage();

    const successInfo = (content: string) => {
        messageApi.open({
            type: 'success',
            content: content,
        }).then();
    };

    const errorInfo = (content: string) => {
        messageApi.open({
            type: 'error',
            content: content,
        }).then();
    };


    return (
        <>
            {contextHolder}
            <Button
                disabled={tableRow.statusCode !== RequestExcludedCode}
                style={{ width: '90%' }}
            >
                Оспорить
            </Button>
        </>
    );
}

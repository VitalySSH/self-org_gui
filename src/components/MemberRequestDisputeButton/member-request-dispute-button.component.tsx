import { Button, message } from "antd";


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
                disabled={tableRow.statusCode !== 'excluded'}
                style={{ width: '90%' }}
            >
                Оспорить
            </Button>
        </>
    );
}

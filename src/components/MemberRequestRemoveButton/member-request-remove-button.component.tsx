import { Button, Popconfirm, message } from "antd";
import { CrudDataSourceService } from "../../services";
import { RequestMemberModel } from "../../models";
import { QuestionCircleOutlined } from "@ant-design/icons";


export function MemberRequestRemoveButton(props: any) {

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const removeMemberRequest = () => {
        const requestMemberService =
            new CrudDataSourceService(RequestMemberModel);
        requestMemberService.delete(tableRow.key)
            .then(() => {
                successInfo('Заявка удалена');
                props.setLoading(true);
            }).catch((error) => {
            errorInfo(`Ошибка удаления заявки: ${error}`);
        })

    }

    return (
        <>
            {contextHolder}
            <Popconfirm
                placement="topLeft"
                title="Удаление заявки на членство"
                description="Вы точно хотите удалить эту заявку?"
                okText="Удалить"
                cancelText="Отменить"
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                onConfirm={removeMemberRequest}
            >
                <Button
                    danger
                    disabled={tableRow.statusCode !== 'on_consideration'}
                >
                    Удалить заявку
                </Button>
            </Popconfirm>
        </>
    );
}

import { Button, Popconfirm, message } from "antd";
import { CrudDataSourceService } from "src/services";
import { RequestMemberModel } from "src/models";
import { QuestionCircleOutlined } from "@ant-design/icons";
import {
    CommunityMemberCode,
    MemberExcludedCode
} from "src/consts";


export function MemberRequestRemoveButton(props: any) {

    const tableRow = props.tableRow;
    const [messageApi, contextHolder] =
        message.useMessage();
    const statusCodes = [CommunityMemberCode, MemberExcludedCode];

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
        });

    }

    return (
        <>
            {contextHolder}
            <Popconfirm
                placement="topLeft"
                title="Удаление заявки на членство"
                description="Вы точно хотите удалить эту заявку и покинуть сообщество?"
                okText="Удалить"
                cancelText="Отменить"
                icon={<QuestionCircleOutlined style={{ fontSize: 18 }} />}
                onConfirm={removeMemberRequest}
            >
                <Button
                    danger
                    style={{ width: '90%' }}
                >
                    {
                        statusCodes.includes(tableRow.statusCode) ?
                            'Покинуть сообщество' : 'Удалить заявку'
                    }
                </Button>
            </Popconfirm>
        </>
    );
}

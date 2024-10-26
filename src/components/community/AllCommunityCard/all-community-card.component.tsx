import { Button, Card, Form, message, Modal } from "antd";
import Meta from "antd/es/card/Meta";
import { AuthContextProvider } from "../../../interfaces";
import { SolutionOutlined } from "@ant-design/icons";
import { useState } from "react";
import { CrudDataSourceService } from "../../../services";
import {
    CommunityModel,
    RequestMemberModel,
    StatusModel
} from "../../../models";
import TextArea from "antd/lib/input/TextArea";
import { useAuth } from "../../../hooks";
import { OnConsiderationCode } from "../../../consts";


export function AllCommunityCard(props: any) {

    const communityItem = props.item;

    const cardActions: JSX.Element[] = [];
    if (!communityItem.isMyCommunity) {
        const action = (
            <div
                style={{
                    display: "flex",
                    color: "black",
                    alignContent: "center",
                    justifyContent: "center",
                }}
                onClick={() => {
                    setModalOpen(true);
                }}
            >
                <SolutionOutlined
                    style={{
                        fontSize: 18
                    }}
                />
                <span
                    style={{
                        marginLeft: 10
                    }}
                >Отправить заявку на вступление</span>
            </div>
        );
        cardActions.push(action);
    }

    const authData: AuthContextProvider = useAuth();
    const [messageApi, contextHolder] =
        message.useMessage();
    const [disabled, setDisabled] =
        useState(false);
    const [modalOpen, setModalOpen] =
        useState(false);
    const [actions, setActions] =
        useState(cardActions);

    const handleCancel = () => {
        setModalOpen(false);
    };

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

    const onFinish = (formData: { [reason: string]: string } ) => {
        setDisabled(true);
        const statusService =
            new CrudDataSourceService(StatusModel);
        const requestMemberService =
            new CrudDataSourceService(RequestMemberModel);
        const communityService =
            new CrudDataSourceService(CommunityModel);
        const requestMember = new RequestMemberModel();
        if (formData.reason) {
            requestMember.reason = formData.reason;
        }
        statusService.list(
            [
                {
                    field: 'code',
                    op: 'equals',
                    val: OnConsiderationCode,
                }
            ]
        ).then(
            (statuses) => {
                if (statuses.length) {
                    const status = statuses[0];
                    requestMember.member = authData.getUserRelation();
                    const communityRelation =
                        communityService.createRecord();
                    communityRelation.id = communityItem.id;
                    requestMember.community = communityRelation;
                    requestMember.status = status;
                    requestMemberService.save(requestMember).then(() => {
                        successInfo('Заявка успешно отправлена');
                        setActions([]);
                    }).catch((error) => {
                        errorInfo(`Ошибка отправки запроса: ${error}`);
                    }).finally(() => {
                        setDisabled(false);
                        setModalOpen(false);
                    });
                }
            }
        );
    }

    return (
        <div>
            {contextHolder}
            <Modal
                open={modalOpen}
                title="Заявка на вступление"
                onCancel={handleCancel}
                footer={[]}
            >
                <Form
                    name='add-member-request'
                    onFinish={onFinish}
                >
                    <Form.Item
                        name='reason'
                        label='Сопроводительное письмо'
                        labelCol={{ span: 24 }}
                        hasFeedback
                    >
                        <TextArea
                            rows={5}
                            placeholder="Здесь вы можете рассказать о себе и причинах, по котором Вы хотели бы вступить в сообщество"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type='primary'
                            htmlType='submit'
                            disabled={disabled}
                            block
                        >
                            Отправить
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Card
                actions={actions}
            >
                <Meta
                    title={communityItem.title}
                    description={communityItem.description}
                />
                <div className="community-members">
                    Участников: {communityItem.members}
                </div>
            </Card>
        </div>
    )
}

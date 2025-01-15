import './community-card.component.scss';
import {Button, Card, Form, message, Modal} from 'antd';
import {
    AuthContextProvider,
    CommunityCardInterface,
    CommunityCardProps
} from "src/interfaces";
import { useNavigate } from "react-router-dom";
import Meta from "antd/es/card/Meta";
import { SolutionOutlined, StopOutlined } from "@ant-design/icons";
import { useState } from "react";
import { CrudDataSourceService } from "src/services";
import { CommunityModel, RequestMemberModel, StatusModel } from "src/models";
import { OnConsiderationCode } from "src/consts";
import { useAuth} from "src/hooks";
import TextArea from "antd/lib/input/TextArea";

export function CommunityCard(props: CommunityCardProps) {

    const navigate = useNavigate();
    const authData: AuthContextProvider = useAuth();

    const [messageApi, contextHolder] =
        message.useMessage();
    const [modalOpen, setModalOpen] =
        useState(false);
    const [disabled, setDisabled] =
        useState(false);
    const [isSentRequest, setIsSentRequest] =
        useState(false);

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

    const handleCancel = () => {
        setModalOpen(false);
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
                    communityRelation.id = props.item.id;
                    requestMember.community = communityRelation;
                    requestMember.status = status;
                    requestMemberService.save(requestMember).then(() => {
                        successInfo('Заявка успешно отправлена');
                        setIsSentRequest(true);
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

    // FIXME: переделать на функционал оспаривания решения
    const getActions = () => {
        if (props.item.isMyCommunity) {
            if (props.item.isBlocked) {
                return [
                    <div
                        style={{
                            display: "flex",
                            color: "black",
                            alignContent: "center",
                            justifyContent: "center",
                            cursor: "auto",
                        }}
                    >
                        <StopOutlined
                            style={{ fontSize: 24 }}
                            disabled
                        />
                        <span
                            style={{
                                marginLeft: 10
                            }}
                        >Вы заблокированы большинством голосов</span>
                    </div>
                ];
            } else {
                return props.actions;
            }
        } else {
            if (!isSentRequest) {
                return [
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
                            style={{ marginLeft: 10}}
                        >
                            Отправить заявку на вступление
                        </span>
                    </div>
                ];
            } else {
                return props.actions;
            }
        }
    }

    const getOnClick = (item: CommunityCardInterface) => {
        const onClick = () => {
            navigate(`/my-communities/${item.id}`);
        }

        return item.isMyCommunity ? onClick : undefined;
    }

    const getCardStyle = (item: CommunityCardInterface) => {
        if (item.isMyCommunity && !item.isBlocked) {
            return {cursor: "pointer"};
        } else {
            return {};
        }
    }

    return (
        <>
            {contextHolder}
            <Modal
                open={modalOpen}
                title="Заявка на вступление"
                onCancel={handleCancel}
                footer={[]}
            >
                <Form
                    name='join-community'
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
                className="community-card"
                onClick={getOnClick(props.item)}
                style={getCardStyle(props.item)}
                actions={getActions()}
            >
                <Meta
                    title={props.item.title}
                    description={props.item.description}
                />
                <div className="community-footer">
                    <span className="members-count">Участников: {props.item.members}</span>
                </div>
            </Card>
        </>
    );
}
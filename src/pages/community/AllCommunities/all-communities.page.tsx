import { SolutionOutlined } from "@ant-design/icons"
import {
    Button,
    Card,
    Form,
    Layout,
    List,
    message,
    Modal,
    Space,
    Typography
} from "antd";
import { CrudDataSourceService } from "../../../services";
import {CommunityModel, RequestMemberModel, StatusModel} from "../../../models";
import { useEffect, useState } from "react";
import Meta from "antd/es/card/Meta";
import { AuthContextProvider, CommunityCard } from "../../../interfaces";
import { useAuth } from "../../../hooks";
import TextArea from "antd/lib/input/TextArea";


export function AllCommunities() {

    const [messageApi, contextHolder] =
        message.useMessage();
    const authData: AuthContextProvider = useAuth();
    const [loading, setLoading] =
        useState(true);
    const [dataSource, setDataSource] =
        useState([] as CommunityCard[]);
    const [modalOpen, setModalOpen] =
        useState(false);
    const [disabled, setDisabled] =
        useState(false);
    const [communityId, setCommunityId] =
        useState('');

    const communityService =
        new CrudDataSourceService(CommunityModel);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData = () => {
        if (loading) {
            communityService
                .list(undefined, undefined, undefined,
                [
                    'user_settings.user',
                    'main_settings.name',
                    'main_settings.description',
                    'main_settings.adding_members.creator',
                ])
                .then(data => {
                    const items: CommunityCard[] = [];
                    data.forEach(community => {
                        const isMyCommunity =
                            (community.user_settings || [])
                                .filter(
                                    (ucs) =>
                                        ucs.user?.id === authData.user?.id
                                ).length > 0;
                        const isAddRequest =
                            (community.main_settings?.adding_members || [])
                                .filter(
                                    (rm) =>
                                        rm.creator?.id === authData.user?.id
                                ).length > 0;
                        const item = {
                            id: community.id || '',
                            title: community
                                .main_settings?.name?.name || '',
                            description: community
                                .main_settings?.description?.value || '',
                            members: (community.user_settings || []).length,
                            isMyCommunity: isMyCommunity || isAddRequest,
                        };
                        items.push(item);
                    });
                    setDataSource(items);
                }).catch((error) => {
                console.log(error);
            }).finally(() => {
                setLoading(false);
            });
        }
    }

    useEffect(() => {
        loadData();
    }, [loadData]);

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
                    val: 'on_consideration',
                }
            ]
        ).then(
            (statuses) => {
                if (statuses.length) {
                    const status = statuses[0];
                    const userRelation = authData.getUserRelation();
                    requestMember.member = userRelation;
                    requestMember.creator = userRelation;
                    const communityRelation =
                        communityService.createRecord();
                    communityRelation.id = communityId;
                    requestMember.community = communityRelation;
                    requestMember.status = status;
                    requestMemberService.save(requestMember).then(() => {
                        successInfo('Заявка успешно отправлена');
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

    const buildActions = (communityCard: CommunityCard) => {
        const actions: JSX.Element[] = [];
        if (!communityCard.isMyCommunity) {
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
                        setCommunityId(communityCard.id);
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
            actions.push(action);
        }

        return actions;
    }

    return (
        <Layout
            style={{height: '100%', overflowY: "scroll"}}
        >
            {contextHolder}
            <Space
                direction="vertical"
                className="communities"
            >
                <Typography.Title level={3}>Сообщества</Typography.Title>
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
                <List
                    itemLayout="vertical"
                    dataSource={dataSource}
                    loading={loading}
                    locale={{emptyText: "Нет сообществ"}}
                    pagination={{
                        position: 'bottom',
                        align: 'center'
                    }}
                    size="large"
                    renderItem={(item: CommunityCard) => (
                        <List.Item>
                            <Card
                                actions={buildActions(item)}
                            >
                                <Meta
                                    title={item.title}
                                    description={item.description}
                                />
                                <div className="community-members">
                                    Участников: {item.members}
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            </Space>
        </Layout>
    );
}

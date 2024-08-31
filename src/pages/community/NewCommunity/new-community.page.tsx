import { v4 } from "uuid";
import {
    Button,
    Checkbox,
    Form,
    Input,
    InputNumber,
    Layout,
    message,
    Space,
    Typography
} from "antd";
import TextArea from "antd/lib/input/TextArea";
import {
    AuthContextProvider,
    CommunitySettingsInterface
} from "../../../interfaces";
import { CrudDataSourceService } from "../../../services";
import {
    CommunityDescriptionModel,
    CommunityModel,
    CommunityNameModel,
    CommunitySettingsModel,
    RequestMemberModel,
    StatusModel,
    UserCommunitySettingsModel,
} from "../../../models";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks";
import { useState } from "react";

export function NewCommunity() {

    const navigate = useNavigate();
    const authData: AuthContextProvider = useAuth();
    const [messageApi, contextHolder] =
        message.useMessage();
    const [buttonLoading, setButtonLoading] =
        useState(false);
    const [disabled, setDisabled] =
        useState(true);

    const [form] = Form.useForm();

    const communityId = v4();
    const userRelation = authData.getUserRelation();

    const communityService =
        new CrudDataSourceService(CommunityModel);
    const settingsService =
        new CrudDataSourceService(CommunitySettingsModel);
    const userSettingsService =
        new CrudDataSourceService(UserCommunitySettingsModel);
    const nameService =
        new CrudDataSourceService(CommunityNameModel);
    const descriptionService =
        new CrudDataSourceService(CommunityDescriptionModel);

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

    const handleFormChange = () => {
        const formData = form.getFieldsValue();
        const isValid =
            Boolean(formData.name) &&
            Boolean(formData.description) &&
            Boolean(formData.quorum) &&
            Boolean(formData.vote);
        setDisabled(!isValid);
    }

    const onFinish = (formData: CommunitySettingsInterface) => {
        setButtonLoading(true);
        let community =
            communityService.createRecord();
        const mainSettings =
            settingsService.createRecord();
        const userSettings =
            userSettingsService.createRecord();
        settingsService.save(mainSettings)
            .then((settingsInst) => {
                community.id = communityId;
                community.creator = userRelation;
                community.main_settings = settingsInst;
                communityService.save(community, true)
                    .then((communityInst) => {
                        community = communityInst;
                        const name =
                            nameService.createRecord();
                        name.name = formData.name;
                        name.creator_id = authData.user?.id;
                        name.community_id = community.id;
                        nameService.save(name)
                            .then((nameInst) => {
                                userSettings.name = nameInst;
                                const description =
                                    descriptionService.createRecord();
                                description.value = formData.description;
                                description.creator_id = authData.user?.id;
                                description.community_id = community.id;
                                descriptionService.save(description)
                                    .then((descriptionInst) => {
                                        userSettings.description = descriptionInst;
                                        userSettings.vote = formData.vote;
                                        userSettings.quorum = formData.quorum;
                                        userSettings.is_not_delegate = formData.is_not_delegate;
                                        userSettings.is_can_offer = formData.is_can_offer;
                                        userSettings.is_default_add_member = formData.is_default_add_member;
                                        userSettings.is_secret_ballot = formData.is_secret_ballot;
                                        userSettings.is_minority_not_participate = formData.is_minority_not_participate;
                                        userSettings.community_id = community.id;
                                        userSettings.user = userRelation;
                                        userSettingsService.save(userSettings)
                                            .then((userSettingsInst) => {
                                                community.user_settings = [userSettingsInst];
                                                communityService.save(community)
                                                    .then(() => {
                                                        setButtonLoading(false);
                                                        successInfo('Сообщество создано');
                                                        createMemberRequest(community);
                                                    }).catch((error) => {
                                                    setButtonLoading(false);
                                                    errorInfo(`Ошибка сохранения сообщества: ${error}`);
                                                });
                                            }).catch((error) => {
                                            setButtonLoading(false);
                                            errorInfo(`Ошибка создания пользовательских настроек: ${error}`);
                                        });
                                    }).catch((error) => {
                                    setButtonLoading(false);
                                    errorInfo(`Ошибка создания описания сообщества: ${error}`);
                                });
                            }).catch((error) => {
                            setButtonLoading(false);
                            errorInfo(`Ошибка создания наименования сообщества: ${error}`);
                        });
                    }).catch((error) => {
                    setButtonLoading(false);
                    errorInfo(`Ошибка создания сообщества: ${error}`);
                });
        }).catch((error) => {
            setButtonLoading(false);
            errorInfo(`Ошибка создания настроек сообщества: ${error}`);
        });
    }

    const createMemberRequest = (communityModel: CommunityModel) => {
        const statusService =
            new CrudDataSourceService(StatusModel);
        const requestMemberService =
            new CrudDataSourceService(RequestMemberModel);
        statusService.list(
            [
                {
                    field: 'code',
                    op: 'equals',
                    val: 'community_member',
                }
            ]
        ).then((statuses) => {
            const status =
                statuses.length ? statuses[0] : undefined;
            const requestMember =
                requestMemberService.createRecord();
            requestMember.reason = 'Создатель сообщества';
            requestMember.member = userRelation;
            requestMember.community = communityModel;
            requestMember.status = status;
            requestMember.vote = true;
            requestMemberService.save(requestMember).then(() => {
                setTimeout(() => {
                    navigate('/my-communities');
                }, 2000);
            }).catch((error) => {
                errorInfo(`Ошибка создания запроса на добавление нового члена сообщества: ${error}`);
            });
        }).catch((error) => {
            errorInfo(`Ошибка получения статусов: ${error}`);
        });

    }

    return (
        <Layout
            style={{ height: "100%", overflowY: "scroll" }}
        >
            {contextHolder}
            <Space
                direction="vertical"
                className="communities"
            >
                <Typography.Title
                    level={3}
                    style={{ textAlign: "center" }}
                >Новое сообщество</Typography.Title>
                <Form
                    form={form}
                    name='new-community-settings'
                    onFinish={onFinish}
                    style={{ width: 600 }}
                    onFieldsChange={handleFormChange}
                >
                    <Form.Item
                        name='name'
                        label='Наименование'
                        labelCol={{ span: 24 }}
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, укажите наименование сообщества',
                            },
                        ]}
                        hasFeedback
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name='description'
                        label='Описание'
                        labelCol={{ span: 24 }}
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, заполните описание сообщества',
                            },
                        ]}
                        hasFeedback
                    >
                        <TextArea rows={5} />
                    </Form.Item>
                    <Form.Item
                        name='quorum'
                        label='Кворум (%)'
                        labelCol={{ span: 24 }}
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, укажите кворум сообщества, значение от 1 до 100%.',
                            },
                        ]}
                        hasFeedback
                    >
                        <InputNumber
                            type="number"
                            controls={false}
                            max={100}
                            min={1}
                            step={1}
                            style={{
                                width: '20%'
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name='vote'
                        label='Решение (%)'
                        labelCol={{ span: 24 }}
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, укажите процент голосов для принятия решения, значение от 50 до 100%.',
                            },
                        ]}
                        hasFeedback
                    >
                        <InputNumber
                            type="number"
                            controls={false}
                            max={100}
                            min={50}
                            step={1}
                            style={{
                                width: '20%'
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name='is_secret_ballot'
                        label='Тайное голосавание?'
                        labelCol={{ span: 24 }}
                        valuePropName="checked"
                    >
                        <Checkbox />
                    </Form.Item>
                    <Form.Item
                        name='is_can_offer'
                        label='Оказываем услуги другим сообществам?'
                        labelCol={{ span: 24 }}
                        valuePropName="checked"
                    >
                        <Checkbox />
                    </Form.Item>
                    <Form.Item
                        name='is_minority_not_participate'
                        label='Меньшинство обязано подчиниться большинству?'
                        labelCol={{ span: 24 }}
                        valuePropName="checked"
                    >
                        <Checkbox />
                    </Form.Item>
                    <Form.Item
                        name='is_default_add_member'
                        label='Даю предварительное согласие на добавление любого нового члена сообщества'
                        labelCol={{ span: 24 }}
                        valuePropName="checked"
                    >
                        <Checkbox />
                    </Form.Item>
                    <Form.Item
                        name='is_not_delegate'
                        label='Не хочу выступать в качестве делегата'
                        labelCol={{ span: 24 }}
                        valuePropName="checked"
                    >
                        <Checkbox />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type='primary'
                            htmlType='submit'
                            loading={buttonLoading}
                            disabled={disabled}
                        >
                            Сохранить
                        </Button>
                    </Form.Item>
                </Form>
            </Space>
        </Layout>
    );
}


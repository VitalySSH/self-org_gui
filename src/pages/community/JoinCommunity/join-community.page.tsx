import {
    Button,
    Checkbox,
    Form,
    InputNumber,
    Layout,
    message,
    Space, Spin,
    Typography
} from "antd";
import {
    AuthContextProvider,
    CommunitySettingsInterface
} from "../../../interfaces";
import {
    CrudDataSourceService,
    UserSettingsAoService
} from "../../../services";
import {
    CommunityDescriptionModel,
    CommunityModel,
    CommunityNameModel,
    UserCommunitySettingsModel,
} from "../../../models";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../hooks";
import React, { useEffect, useState } from "react";
import { SelectWithAddValue } from "../../../components";

export function JoinCommunity() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [messageApi, contextHolder] =
        message.useMessage();
    const authData: AuthContextProvider = useAuth();
    const [disabled, setDisabled] =
        useState(false);
    const [settingsLoading, setSettingsLoading] =
        useState(true);
    const [nameLoading, setNameLoading] =
        useState(true);
    const [descLoading, setDescLoading] =
        useState(true);
    const [requestMemberId, setRequestMemberId] =
        useState('');
    const [names, setNames] =
        useState([] as CommunityNameModel[]);
    const [descriptions, setDescriptions] =
        useState([] as CommunityDescriptionModel[]);
    const [name, setName] =
        useState({} as CommunityNameModel);
    const [description, setDescription] =
        useState({} as CommunityDescriptionModel);
    const [nameValue, setNameValue] =
        useState('');
    const [descriptionValue, setDescriptionValue] =
        useState('');
    const [newNameValue, setNewNameValue] =
        useState('');
    const [newDescriptionValue, setNewDescriptionValue] =
        useState('');
    const [buttonLoading, setButtonLoading] =
        useState(false);

    const communityService =
        new CrudDataSourceService(CommunityModel);
    const userSettingsService =
        new CrudDataSourceService(UserCommunitySettingsModel);
    const nameService =
        new CrudDataSourceService(CommunityNameModel);
    const descriptionService =
        new CrudDataSourceService(CommunityDescriptionModel);

    const [form] = Form.useForm();

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
    const getCommunitySettings = () => {
        if (settingsLoading && authData.user && id) {
            communityService.get(id,
                ['main_settings.name',
                    'main_settings.description',
                    'main_settings.adding_members.member']
            ).then(communityInst => {
                if (communityInst.main_settings) {
                    const settingsInst =
                        communityInst.main_settings;
                    if (settingsInst.name) setName(settingsInst.name);
                    if (settingsInst.description) {
                        setDescription(settingsInst.description);
                    }
                    const nameValue = settingsInst.name?.name || '';
                    setNameValue(nameValue);
                    const descValue =
                        settingsInst.description?.value || '';
                    setDescriptionValue(descValue);
                    form.setFieldValue('name', nameValue);
                    form.setFieldValue('description', descValue);
                    form.setFieldValue('quorum', settingsInst.quorum);
                    form.setFieldValue('vote', settingsInst.vote);
                    form.setFieldValue('is_secret_ballot',
                        settingsInst.is_secret_ballot || false);
                    form.setFieldValue('is_can_offer',
                        settingsInst.is_can_offer || false);
                    form.setFieldValue('is_minority_not_participate',
                        settingsInst.is_minority_not_participate || false);
                    form.setFieldValue('is_default_add_member',
                        settingsInst.is_default_add_member || false);
                    form.setFieldValue('is_not_delegate',
                        settingsInst.is_not_delegate || false);
                    const filtered =
                        (settingsInst.adding_members || []).filter(
                            (request) =>
                                request.member?.id === authData.user?.id );
                    if (filtered.length) {
                        setRequestMemberId(filtered[0].id || '');
                    }
                } else {
                    errorInfo(`Ошибка получения сообщества с id: ${id}`);
                }
            }).catch(() => {
                navigate('/no-much-page');
            }).finally(() => {
                setSettingsLoading(false);
            });
        } else {
            if (settingsLoading) {
                setSettingsLoading(false);
            }
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCommunityNames = () => {
        if (nameLoading && id) {
            nameService.list(
                [
                    {
                        field: 'community_id',
                        op: 'equals',
                        val: id,
                    }
                ]
            ).then(communityNames => {
                setNames(communityNames);
            }).catch((error) => {
                errorInfo(`Ошибка получения наименований: ${error}`);
            }).finally(() => {
                setNameLoading(false);
            });
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCommunityDescriptions = () => {
        if (descLoading && id) {
            descriptionService.list(
                [
                    {
                        field: 'community_id',
                        op: 'equals',
                        val: id,
                    }
                ]
            ).then(communityDescriptions => {
                setDescriptions(communityDescriptions);
            }).catch((error) => {
                errorInfo(`Ошибка получения описаний: ${error}`);
            }).finally(() => {
                setDescLoading(false);
            });
        }
    }

    useEffect(() => {
        getCommunitySettings();
        getCommunityNames();
        getCommunityDescriptions();
    }, [
        getCommunitySettings,
        getCommunityNames,
        getCommunityDescriptions,
    ]);

    const addName = (
        e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        if (newNameValue) {
            const newName = nameService.createRecord();
            newName.name = newNameValue;
            newName.community_id = id;
            newName.creator_id = authData.user?.id;
            nameService.save(newName).then(nameInst => {
                setNameValue(newNameValue);
                setName(nameInst);
                names.push(nameInst);
                setNames(names);
            }).finally(() => {
                setNewNameValue('');
            });
        }
    };

    const addDescription = (
        e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        if (newDescriptionValue) {
            const newDesc =
                descriptionService.createRecord();
            newDesc.value = newDescriptionValue;
            newDesc.community_id = id;
            newDesc.creator_id = authData.user?.id;
            descriptionService.save(newDesc)
                .then(descInst => {
                    setDescriptionValue(newDescriptionValue);
                    setDescription(descInst);
                    descriptions.push(descInst);
                    setDescriptions(descriptions);
                }).finally(() => {
                setNewDescriptionValue('');
            });
        }
    };

    const handleFormChange = () => {
        const hasErrors = form.getFieldsError().some(({ errors }) => errors.length);
        setDisabled(hasErrors);
    }

    const onFinish = (formData: CommunitySettingsInterface) => {
        setButtonLoading(true);
        const userSettingsAOService =
            new UserSettingsAoService();
        const userSettings =
            userSettingsService.createRecord();
        userSettings.user = authData.getUserRelation();
        userSettings.community_id = id;
        userSettings.name = name;
        userSettings.description = description;
        userSettings.vote = formData.vote;
        userSettings.quorum = formData.quorum;
        userSettings.is_secret_ballot = formData.is_secret_ballot;
        userSettings.is_can_offer = formData.is_can_offer;
        userSettings.is_minority_not_participate =
            formData.is_minority_not_participate;
        userSettings.is_default_add_member = formData.is_default_add_member;
        userSettings.is_not_delegate = formData.is_not_delegate;
        userSettingsService.save(userSettings)
            .then((userSettingsInst) => {
                userSettingsAOService.update_data_after_join(
                    id || '',
                    userSettingsInst.id || '',
                    requestMemberId
                ).then(() => {
                    successInfo('Настройки сохранены');
                    navigate(`/my-communities/${id}`);
                }).catch((error) => {
                    setButtonLoading(false);
                    errorInfo(`Ошибка обновления данных настроек: ${error}`);
                });
        }).catch((error) => {
            setButtonLoading(false);
            errorInfo(`Ошибка сохранения настроек: ${error}`);
        });
    }

    return (
        <Layout
            style={{ height: "100%", overflowY: "scroll" }}
        >
            <Space
                direction="vertical"
                className="communities"
            >
            {contextHolder}
                <Typography.Title
                    level={4}
                    style={{ marginLeft: 20 }}
                >Мои настройки сообщества</Typography.Title>
                <Spin
                    tip="Загрузка данных"
                    size="large"
                    spinning={settingsLoading}
                >
                    <Form
                        name='join-community'
                        form={form}
                        onFinish={onFinish}
                        preserve={true}
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
                                    message: 'Пожалуйста, выберите наименование сообщества',
                                },
                            ]}
                            hasFeedback
                            required
                        >
                            <SelectWithAddValue
                                objs={names}
                                addNewObj={addName}
                                fieldType="input"
                                bindLabel="name"
                                placeholder="Введите своё наименование"
                                setObj={setName}
                                formValue={nameValue}
                                setFormValue={setNameValue}
                                newTextValue={newNameValue}
                                setNewTextValue={setNewNameValue}
                            />
                        </Form.Item>
                        <Form.Item
                            name='description'
                            label='Описание'
                            labelCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, выберите описание сообщества',
                                },
                            ]}
                            hasFeedback
                        >
                            <SelectWithAddValue
                                objs={descriptions}
                                addNewObj={addDescription}
                                fieldType="textarea"
                                bindLabel="value"
                                placeholder="Введите своё описание"
                                setObj={setDescription}
                                formValue={descriptionValue}
                                setFormValue={setDescriptionValue}
                                newTextValue={newDescriptionValue}
                                setNewTextValue={setNewDescriptionValue}
                            />
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
                </Spin>
            </Space>
        </Layout>
    );
}


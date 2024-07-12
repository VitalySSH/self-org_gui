import {
    Button,
    Checkbox,
    Divider,
    Form,
    Input,
    InputRef,
    Layout, message,
    Select,
    Space, Spin,
    Typography
} from "antd";
import { PlusOutlined } from "@ant-design/icons"
import TextArea, { TextAreaRef } from "antd/lib/input/TextArea";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { CrudDataSourceService } from "../../../services";
import {
    CommunityDescriptionModel,
    CommunityNameModel,
    UserCommunitySettingsModel
} from "../../../models";
import { AuthContextProvider, CommunitySettings } from "../../../interfaces";
import { useAuth } from "../../../hooks";

export function MyCommunitySettings(props: any) {

    const [messageApi, contextHolder] =
        message.useMessage();
    const authData: AuthContextProvider = useAuth();
    const [settingsLoading, setSettingsLoading] =
        useState(true);
    const [nameLoading, setNameLoading] =
        useState(true);
    const [descLoading, setDescLoading] =
        useState(true);
    const [settings, setSettings] =
        useState({} as UserCommunitySettingsModel);
    const [names, setNames] =
        useState([] as CommunityNameModel[]);
    const [descriptions, setDescriptions] =
        useState([] as CommunityDescriptionModel[]);
    const [inputValue, setInputValue] =
        useState('');
    const [textAreaValue, setTextAreaValue] =
        useState('');

    const inputRef = useRef<InputRef>(null);
    const textAreaRef = useRef<TextAreaRef>(null);

    const communityId = props?.communityId;
    const settingsService =
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
    const getUserCommunitySettings = () => {
        if (settingsLoading && authData.user && communityId) {
            settingsService.list(
                [
                    {
                        field: 'community_id',
                        op: 'equals',
                        val: communityId,
                    },
                    {
                        field: 'user_id',
                        op: 'equals',
                        val: authData.user.id,
                    }
                ],
                undefined, undefined,
                ['user', 'name', 'description']
            ).then(communitySettings => {
                if (communitySettings.length) {
                    const settingsInst =
                        communitySettings[0];
                    setSettings(settingsInst);
                    form.setFieldValue('name', settingsInst.name?.name);
                    form.setFieldValue(
                        'description',
                        settingsInst.description?.value || '');
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
                }
            }).catch((error) => {
                errorInfo(`Ошибка получения настроек: ${error}`);
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
        if (nameLoading && authData.user && communityId) {
            nameService.list(
                [
                    {
                        field: 'community_id',
                        op: 'equals',
                        val: communityId,
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
        if (descLoading && authData.user && communityId) {
            descriptionService.list(
                [
                    {
                        field: 'community_id',
                        op: 'equals',
                        val: communityId,
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
        getUserCommunitySettings();
        getCommunityNames();
        getCommunityDescriptions();
    }, [
        getUserCommunitySettings,
        getCommunityNames,
        getCommunityDescriptions,
    ]);

    const addName = (
        e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        const newNameText = inputRef.current?.input?.value;
        if (newNameText) {
            const newName = nameService.createRecord();
            newName.name = newNameText;
            newName.community_id = communityId;
            newName.creator_id = authData.user?.id;
            nameService.save(newName).then(nameInst => {
                settings.name = nameInst;
                setSettings(settings);
                names.push(nameInst);
                setNames(names);
            }).finally(() => {
                setInputValue('');
                inputRef.current?.blur;
            });
        }
    };

    const addDescription = (
        e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        const newDescText =
            textAreaRef.current?.resizableTextArea?.textArea.value;
        if (newDescText) {
            const newDesc =
                descriptionService.createRecord();
            newDesc.value = newDescText;
            newDesc.community_id = communityId;
            newDesc.creator_id = authData.user?.id;
            descriptionService.save(newDesc)
                .then(descInst => {
                    settings.description = descInst;
                    setSettings(settings);
                    descriptions.push(descInst);
                    setDescriptions(descriptions);
            }).finally(() => {
                setTextAreaValue('');
                textAreaRef.current?.blur;
            });
        }
    };

    const onFinish = (formData: CommunitySettings) => {
        settings.vote = formData.vote;
        settings.quorum = formData.quorum;
        settings.is_secret_ballot = formData.is_secret_ballot;
        settings.is_can_offer = formData.is_can_offer;
        settings.is_minority_not_participate =
            formData.is_minority_not_participate;
        settings.is_default_add_member = formData.is_default_add_member;
        settings.is_not_delegate = formData.is_not_delegate;
        settingsService.save(settings).then(() => {
            successInfo('Настройки сохранены');
        }).catch((error) => {
            errorInfo(`Ошибка сохранения настроек: ${error}`);
        });
    }

    const onNameChange = (value: string, option: any) => {
        settings.name = option?.obj as CommunityNameModel;
        setSettings(settings);
        form.setFieldValue('name', value);
    }

    const onDescriptionChange = (value: string, option: any) => {
        settings.description = option?.obj as CommunityDescriptionModel;
        setSettings(settings);
        form.setFieldValue('description', value);
    }

    const onInputNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        if (text) {
            setInputValue(text);
            form.setFieldValue('name', text);
        }
    }

    const onInputDescriptionChange = () => {
        const text =
            textAreaRef.current?.resizableTextArea?.textArea.value;
        if (text) {
            setTextAreaValue(text);
            form.setFieldValue('description', text);
        }
    }

    return (
        <Layout>
            {contextHolder}
            <Typography.Title
                level={4}
                style={{ marginLeft: 20 }}
            >Мои настройки сообщества</Typography.Title>
            <Space
                style={{ marginTop: 30 }}
            >
                <Spin
                    tip="Загрузка данных"
                    size="large"
                    spinning={settingsLoading}
                >
                    <Form
                        name='my-community-settings'
                        form={form}
                        onFinish={onFinish}
                        preserve={true}
                        style={{ width: 600 }}
                    >
                        <Form.Item
                            name='name'
                            label='Наименование'
                            labelCol={{ span: 24 }}
                        >
                            <Select
                                onChange={onNameChange}
                                showSearch={true}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Space style={{ padding: '0 8px 4px' }}>
                                            <Input
                                                placeholder="Введите своё наименование"
                                                ref={inputRef}
                                                value={inputValue}
                                                onChange={onInputNameChange}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                style={{ width: 400 }}
                                            />
                                            <Button type="text" icon={<PlusOutlined />} onClick={addName}>
                                                Добавить
                                            </Button>
                                        </Space>
                                    </>
                                )}
                                options={
                                    names.map((item: CommunityNameModel) => (
                                        {
                                            label: item.name,
                                            value: item.name,
                                            obj: item,
                                        }
                                    ))
                                }
                                allowClear={true}
                            />
                        </Form.Item>
                        <Form.Item
                            name='description'
                            label='Описание'
                            labelCol={{ span: 24 }}
                        >
                            <Select
                                onChange={onDescriptionChange}
                                showSearch={true}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Space style={{ padding: '0 8px 4px' }}>
                                            <TextArea
                                                rows={5}
                                                placeholder="Введите своё описание"
                                                ref={textAreaRef}
                                                value={textAreaValue}
                                                onChange={onInputDescriptionChange}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                style={{ width: 400 }}
                                            />
                                            <Button type="text" icon={<PlusOutlined />} onClick={addDescription}>
                                                Добавить
                                            </Button>
                                        </Space>
                                    </>
                                )}
                                options={
                                    descriptions.map((item: CommunityDescriptionModel) => (
                                        {
                                            label: item.value,
                                            value: item.value,
                                            obj: item,
                                        }
                                    ))
                                }
                                allowClear={true}
                            />
                        </Form.Item>
                        <Form.Item
                            name='quorum'
                            label='Кворум'
                            labelCol={{ span: 24 }}
                        >
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item
                            name='vote'
                            label='Принятие решения'
                            labelCol={{ span: 24 }}
                        >
                            <Input type="number" />
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


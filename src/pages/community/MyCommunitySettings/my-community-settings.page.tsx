import {
    Button,
    Form,
    InputNumber,
    Layout,
    message,
    Space,
    Spin, 
    Switch,
    Typography
} from "antd";
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import {CrudDataSourceService, UserSettingsAoService} from "../../../services";
import {
    CommunityDescriptionModel,
    CommunityNameModel, 
    CategoryModel,
    UserCommunitySettingsModel
} from "../../../models";
import {
    AuthContextProvider,
    CommunitySettingsInterface,
} from "../../../interfaces";
import { useAuth } from "../../../hooks";
import { useNavigate } from "react-router-dom";
import { SelectWithAddValue } from "../../../components";

export function MyCommunitySettings(props: any) {

    const navigate = useNavigate();
    const [messageApi, contextHolder] =
        message.useMessage();
    const authData: AuthContextProvider = useAuth();
    const [settings, setSettings] =
        useState({} as UserCommunitySettingsModel);
    const [names, setNames] =
        useState([] as CommunityNameModel[]);
    const [descriptions, setDescriptions] =
        useState([] as CommunityDescriptionModel[]);
    const [categories, setCategories] =
        useState([] as CategoryModel[]);
    const [name, setName] =
        useState([] as CommunityNameModel[]);
    const [description, setDescription] =
        useState([] as CommunityDescriptionModel[]);
    const [category, setCategory] =
        useState([] as CategoryModel[]);
    const [systemCategory, setSystemCategory] =
        useState({} as CategoryModel);
    const [buttonLoading, setButtonLoading] =
        useState(false);

    const communityId = props?.communityId;
    const settingsService =
        new CrudDataSourceService(UserCommunitySettingsModel);
    const nameService =
        new CrudDataSourceService(CommunityNameModel);
    const descriptionService =
        new CrudDataSourceService(CommunityDescriptionModel);
    const categoryService =
        new CrudDataSourceService(CategoryModel);

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


    // eslint-disable-next-line @typescript-eslint/no-unused-vars,react-hooks/exhaustive-deps
    const getUserCommunitySettings = () => {
        if (authData.user && communityId && !settings.id) {
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
                ['user', 'name', 'description', 'categories.status']
            ).then(communitySettings => {
                if (communitySettings.length) {
                    const settingsInst =
                        communitySettings[0];
                    setSettings(settingsInst);
                    const initCategories: CategoryModel[] = [];
                        (settingsInst?.categories || [])
                            .forEach((cat) => {
                                if (cat.status?.code === 'system_category') {
                                    setSystemCategory(cat);
                                } else {
                                    initCategories.push(cat);
                                }
                            });
                    if (settingsInst.name) {
                        setName([settingsInst.name]);
                    }
                    if (settingsInst.description) {
                        setDescription([settingsInst.description]);
                    }
                    if (initCategories) {
                        setCategory(initCategories);
                    }
                    form.setFieldValue('name', settingsInst.name?.name);
                    form.setFieldValue(
                        'description', settingsInst.description?.value);
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
                } else {
                    navigate('/no-much-page');
                }
            }).catch((error) => {
                errorInfo(`Ошибка получения настроек: ${error}`);
            });
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCommunityNames = () => {
        if (communityId && !names.length) {
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
            });
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCommunityDescriptions = () => {
        if (communityId && !descriptions.length) {
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
            });
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getInitiativeCategories = () => {
        if (communityId && !categories.length) {
            categoryService.list(
                [
                    {
                        field: 'community_id',
                        op: 'equals',
                        val: communityId,
                    }
                ], undefined, undefined,
                ['status']
            ).then(initiativeCategories => {
                const filtered = initiativeCategories
                    .filter((cat) =>
                        cat.status?.code !== 'system_category');
                setCategories(filtered);
            }).catch((error) => {
                errorInfo(
                    `Ошибка получения категорий инициатив: ${error}`);
            });
        }
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        getUserCommunitySettings();
        getCommunityNames();
        getCommunityDescriptions();
        getInitiativeCategories();
    }, [
        getUserCommunitySettings,
        getCommunityNames,
        getCommunityDescriptions,
        getInitiativeCategories,
    ]);

    const onFinish = (formData: CommunitySettingsInterface) => {
        setButtonLoading(true);
        const userSettingsAoService =
            new UserSettingsAoService();
        if (systemCategory.id) {
            category.push(systemCategory);
        }
        userSettingsAoService.saveSettings(
            settings,
            formData,
            name,
            description,
            category,
            communityId,
            authData.getUserRelation(),
        ).then(() => {
            successInfo('Настройки сохранены');
            setButtonLoading(false);
        }).catch((error) => {
            errorInfo(`Ошибка сохранения настроек: ${error}`);
            setButtonLoading(false);
        });
    }

    return (
        <Layout>
            {contextHolder}
            <Typography.Title
                level={4}
                style={{ marginLeft: 20 }}
            >Мои настройки сообщества</Typography.Title>
            <Space
                style={{ marginTop: 20 }}
            >
                <Spin
                    tip="Загрузка данных"
                    size="large"
                    spinning={Boolean(!settings.id)}
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
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, выберите наименование сообщества',
                                },
                            ]}
                        >
                            <SelectWithAddValue
                                options={names}
                                setOptions={setNames}
                                form={form}
                                fieldService={nameService}
                                fieldType="input"
                                formField="name"
                                bindLabel="name"
                                placeholder="Введите своё наименование"
                                fieldData={name}
                                setFieldData={setName}
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
                        >
                            <SelectWithAddValue
                                options={descriptions}
                                setOptions={setDescriptions}
                                form={form}
                                fieldService={descriptionService}
                                fieldType="textarea"
                                formField="description"
                                bindLabel="value"
                                placeholder="Введите своё описание"
                                fieldData={description}
                                setFieldData={setDescription}
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
                            <Switch
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                            />
                        </Form.Item>
                        <Form.Item
                            name='is_can_offer'
                            label='Оказываем услуги другим сообществам?'
                            labelCol={{ span: 24 }}
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                            />
                        </Form.Item>
                        <Form.Item
                            name='is_minority_not_participate'
                            label='Меньшинство обязано подчиниться большинству?'
                            labelCol={{ span: 24 }}
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                            />
                        </Form.Item>
                        <Form.Item
                            name='is_default_add_member'
                            label='Даю предварительное согласие на добавление любого нового члена сообщества'
                            labelCol={{ span: 24 }}
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                            />
                        </Form.Item>
                        <Form.Item
                            name='is_not_delegate'
                            label='Не хочу выступать в качестве делегата'
                            labelCol={{ span: 24 }}
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                            />
                        </Form.Item>
                        <Form.Item
                            name='categories'
                            label='Категории инициатив'
                            labelCol={{ span: 24 }}
                        >
                            <SelectWithAddValue
                                options={categories}
                                setOptions={setCategories}
                                form={form}
                                fieldService={categoryService}
                                fieldType="input"
                                formField="categories"
                                bindLabel="name"
                                placeholder="Введите свою категорию"
                                fieldData={category}
                                setFieldData={setCategory}
                                multiple={true}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type='primary'
                                htmlType='submit'
                                loading={buttonLoading}
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
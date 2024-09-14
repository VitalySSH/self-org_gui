import { v4 } from 'uuid';
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
    CommunitySettingsModel,
    CategoryModel,
    UserCommunitySettingsModel,
} from "../../../models";
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../hooks";
import { useEffect, useState } from "react";
import { SelectWithAddValue } from "../../../components";

export function JoinCommunity() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [messageApi, contextHolder] =
        message.useMessage();
    const authData: AuthContextProvider = useAuth();
    const [settings, setSettings] =
        useState({} as CommunitySettingsModel);
    const [requestMemberId, setRequestMemberId] =
        useState('');
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

    const communityService =
        new CrudDataSourceService(CommunityModel);
    const userSettingsService =
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCommunitySettings = () => {
        if (authData.user && id && settings.id) {
            communityService.get(id,
                ['main_settings.name',
                    'main_settings.description',
                    'main_settings.adding_members.member',
                    'init_categories.status']
            ).then(communityInst => {
                if (communityInst.main_settings) {
                    const settingsInst =
                        communityInst.main_settings;
                    setSettings(settingsInst);
                    const initCategories: CategoryModel[] = [];
                    (settingsInst?.init_categories || [])
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
                    const nameValue = settingsInst.name?.name || '';
                    const descValue =
                        settingsInst.description?.value || '';
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
                        setRequestMemberId(filtered[0].id);
                    }
                } else {
                    errorInfo(`Ошибка получения сообщества с id: ${id}`);
                }
            }).catch(() => {
                navigate('/no-much-page');
            });
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCommunityNames = () => {
        if (id && !names.length) {
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
            });
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCommunityDescriptions = () => {
        if (id && !descriptions.length) {
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
            });
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getInitiativeCategories = () => {
        if (id && !categories.length) {
            categoryService.list(
                [
                    {
                        field: 'community_id',
                        op: 'equals',
                        val: id,
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

    useEffect(() => {
        getCommunitySettings();
        getCommunityNames();
        getCommunityDescriptions();
        getInitiativeCategories();
    }, [
        getCommunitySettings,
        getCommunityNames,
        getCommunityDescriptions,
        getInitiativeCategories,
    ]);

    const onFinish = (formData: CommunitySettingsInterface) => {
        setButtonLoading(true);
        const userSettingsAOService =
            new UserSettingsAoService();
        const userSettings =
            userSettingsService.createRecord();
        if (systemCategory.id) {
            category.push(systemCategory);
        }
        const userSettingsId = v4();
        userSettings.id = userSettingsId;

        userSettingsAOService.saveSettings(
            userSettings,
            formData,
            name,
            description,
            category,
            id || '',
            authData.getUserRelation(),
        ).then(() => {
                userSettingsAOService.update_data_after_join(
                    id || '',
                    userSettingsId,
                    requestMemberId,
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
                    spinning={Boolean(!settings.id)}
                >
                    <Form
                        name='join-community'
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
                            required
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
                            name='init_categories'
                            label='Категории инициатив'
                            labelCol={{ span: 24 }}
                        >
                            <SelectWithAddValue
                                options={categories}
                                setOptions={setCategories}
                                form={form}
                                fieldService={categoryService}
                                fieldType="input"
                                formField="init_categories"
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


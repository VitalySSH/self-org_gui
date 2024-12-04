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
import {
    CrudDataSourceService,
    UserSettingsAoService,
} from "src/services";
import {
    CategoryModel,
    CommunityDescriptionModel,
    CommunityNameModel,
    UserCommunitySettingsModel
} from "src/models";
import {
    AuthContextProvider,
    CommunitySettingsInterface,
    SelectDataInterface,
} from "src/interfaces";
import { useAuth } from "src/hooks";
import { useNavigate } from "react-router-dom";
import { SelectWithAddValue } from "src/components";
import {
    IsMinorityNotParticipateLabel,
    IsSecretBallotLabel,
    QuorumLabel,
    SignificantMinorityLabel,
    VoteLabel
} from "src/consts";

export function MyCommunitySettings(props: any) {

    const navigate = useNavigate();
    const [messageApi, contextHolder] =
        message.useMessage();
    const authData: AuthContextProvider = useAuth();
    const [settings, setSettings] =
        useState({} as UserCommunitySettingsModel);
    const [nameSelect] =
        useState({} as SelectDataInterface<CommunityNameModel>);
    const [descriptionSelect] =
        useState({} as SelectDataInterface<CommunityDescriptionModel>);
    const [categoriesSelect] =
        useState({} as SelectDataInterface<CommunityDescriptionModel>);
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
                    const categories: CategoryModel[] = [];
                        (settingsInst?.categories || [])
                            .forEach((cat) => {
                                if (cat.status?.code === 'system_category') {
                                    setSystemCategory(cat);
                                } else {
                                    categories.push(cat);
                                }
                            });
                    nameSelect.currentValues =
                        settingsInst.name ? [settingsInst.name] : [];
                    descriptionSelect.currentValues =
                        settingsInst.description ?
                            [settingsInst.description] : [];
                    categoriesSelect.currentValues = categories;
                    form.setFieldValue('name', settingsInst.name?.name);
                    form.setFieldValue(
                        'description', settingsInst.description?.value);
                    form.setFieldValue('quorum', settingsInst.quorum);
                    form.setFieldValue('vote', settingsInst.vote);
                    form.setFieldValue('significant_minority',
                        settingsInst.significant_minority);
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
        if (communityId && nameSelect.options === undefined) {
            nameService.list(
                [
                    {
                        field: 'community_id',
                        op: 'equals',
                        val: communityId,
                    }
                ]
            ).then(communityNames => {
                nameSelect.options = communityNames;
            }).catch((error) => {
                errorInfo(`Ошибка получения наименований: ${error}`);
            });
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCommunityDescriptions = () => {
        if (communityId && descriptionSelect.options === undefined) {
            descriptionService.list(
                [
                    {
                        field: 'community_id',
                        op: 'equals',
                        val: communityId,
                    }
                ]
            ).then(communityDescriptions => {
                descriptionSelect.options = communityDescriptions;
            }).catch((error) => {
                errorInfo(`Ошибка получения описаний: ${error}`);
            });
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCategories = () => {
        if (communityId && categoriesSelect.options === undefined) {
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
                categoriesSelect.options = initiativeCategories
                    .filter((cat) =>
                        cat.status?.code !== 'system_category');
            }).catch((error) => {
                errorInfo(
                    `Ошибка получения категорий: ${error}`);
            });
        }
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        getUserCommunitySettings();
        getCommunityNames();
        getCommunityDescriptions();
        getCategories();
    }, [
        getUserCommunitySettings,
        getCommunityNames,
        getCommunityDescriptions,
        getCategories,
    ]);

    const onFinish = (formData: CommunitySettingsInterface) => {
        setButtonLoading(true);
        const userSettingsAoService =
            new UserSettingsAoService();
        if (systemCategory.id &&
            Array.isArray(categoriesSelect.currentValues)) {
            categoriesSelect.currentValues.push(systemCategory);
        }
        userSettingsAoService.saveSettings(
            settings,
            formData,
            nameSelect.currentValues || [],
            descriptionSelect.currentValues || [],
            categoriesSelect.currentValues || [],
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
                level={3}
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
                                fieldData={nameSelect}
                                form={form}
                                fieldService={nameService}
                                fieldType="input"
                                formField="name"
                                bindLabel="name"
                                placeholder="Введите своё наименование"
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
                                fieldData={descriptionSelect}
                                form={form}
                                fieldService={descriptionService}
                                fieldType="textarea"
                                formField="description"
                                bindLabel="value"
                                placeholder="Введите своё описание"
                            />
                        </Form.Item>
                        <Form.Item
                            name='quorum'
                            label={ QuorumLabel }
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
                            label={ VoteLabel }
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
                            name='significant_minority'
                            label={ SignificantMinorityLabel }
                            labelCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, укажите процент общественно-значимого меньшинства, значение от 1 до 49%.',
                                },
                            ]}
                        >
                            <InputNumber
                                type="number"
                                controls={false}
                                max={49}
                                min={1}
                                step={1}
                                style={{
                                    width: '20%'
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name='is_secret_ballot'
                            label={ IsSecretBallotLabel }
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
                            label={ IsMinorityNotParticipateLabel }
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
                            label='Категории'
                            labelCol={{ span: 24 }}
                        >
                            <SelectWithAddValue
                                fieldData={categoriesSelect}
                                form={form}
                                fieldService={categoryService}
                                fieldType="input"
                                formField="categories"
                                bindLabel="name"
                                placeholder="Введите свою категорию"
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
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
} from "src/interfaces";
import { useAuth } from "src/hooks";
import { useNavigate } from "react-router-dom";
import { CustomSelect } from "src/components";
import {
    IsMinorityNotParticipateLabel,
    IsSecretBallotLabel,
    QuorumLabel,
    SignificantMinorityLabel,
    SystemCategoryCode,
    VoteLabel
} from "src/consts";

export function MyCommunitySettings(props: any) {

    const navigate = useNavigate();
    const [messageApi, contextHolder] =
        message.useMessage();
    const authData: AuthContextProvider = useAuth();
    const [settings, setSettings] =
        useState({} as UserCommunitySettingsModel);
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


    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    form.setFieldValue(
                        'categories', settingsInst?.categories);
                    form.setFieldValue('name', settingsInst.name);
                    form.setFieldValue(
                        'description', settingsInst.description);
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

    const getCommunityNames = async () => {
        return await nameService.list(
            [
                {
                    field: 'community_id',
                    op: 'equals',
                    val: communityId,
                }
            ]
        )
    }

    const getCommunityDescriptions = async () => {
        return await descriptionService.list(
            [
                {
                    field: 'community_id',
                    op: 'equals',
                    val: communityId,
                }
            ]
        );
    }

    const getCategories = async () => {
        const categories = await categoryService.list(
            [
                {
                    field: 'community_id',
                    op: 'equals',
                    val: communityId,
                }
            ], undefined, undefined, ['status']
        );
        return categories.filter((cat) =>
            cat.status?.code !== SystemCategoryCode);
    }

    useEffect(() => {
        getUserCommunitySettings();
    }, [
        getUserCommunitySettings,
    ]);

    const onCustomSelectChange = (fieldName: string, value: any) => {
        form.setFieldValue(fieldName, value);
    }

    const onFinish = (formData: CommunitySettingsInterface) => {
        setButtonLoading(true);
        const userSettingsAoService =
            new UserSettingsAoService();
        userSettingsAoService.saveSettings(
            settings,
            formData,
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
                            <CustomSelect
                                fieldService={nameService}
                                requestOptions={getCommunityNames}
                                onChange={onCustomSelectChange}
                                value={settings?.name}
                                formField="name"
                                bindLabel="name"
                                addOwnValue={true}
                                ownValuePlaceholder="Введите своё наименование"
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
                            <CustomSelect
                                fieldService={descriptionService}
                                requestOptions={getCommunityDescriptions}
                                onChange={onCustomSelectChange}
                                value={settings?.description}
                                formField="description"
                                bindLabel="value"
                                addOwnValue={true}
                                ownFieldTextarea={true}
                                ownValuePlaceholder="Введите своё описание"
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
                            <CustomSelect
                                fieldService={categoryService}
                                requestOptions={getCategories}
                                onChange={onCustomSelectChange}
                                value={settings?.categories}
                                formField="categories"
                                bindLabel="name"
                                multiple={true}
                                addOwnValue={true}
                                ownValuePlaceholder="Введите свою категорию"
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
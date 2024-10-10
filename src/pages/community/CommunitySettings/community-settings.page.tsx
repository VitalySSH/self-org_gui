import {
    Form,
    Input,
    Layout,
    Select,
    Space,
    Spin, Switch,
} from "antd";
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import TextArea from "antd/lib/input/TextArea";
import { CrudDataSourceService } from "../../../services";
import {
    CommunityModel,
} from "../../../models";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function CommunitySettings(props: any) {

    const navigate = useNavigate();
    const [settingsLoading, setSettingsLoading] =
        useState(true);
    const communityService =
        new CrudDataSourceService(CommunityModel);

    const communityId = props?.communityId;
    const [form] = Form.useForm();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCommunitySettings = () => {
        if (settingsLoading && communityId) {
            communityService.get(communityId,
                [
                    'creator',
                    'main_settings.name',
                    'main_settings.description',
                    'main_settings.init_categories',
                ])
                .then(community => {
                    const firstname =
                        community?.creator?.firstname;
                    const surname =
                        community?.creator?.surname;
                    const creatorFio = `${firstname} ${surname}`;
                    const settingsInst =
                        community.main_settings;
                    const initCategories =
                        (settingsInst?.init_categories || [])
                            .map((it) => it.name);
                    form.setFieldValue('name', settingsInst?.name?.name);
                    form.setFieldValue(
                        'description',
                        settingsInst?.description?.value || '');
                    form.setFieldValue('quorum', settingsInst?.quorum);
                    form.setFieldValue('vote', settingsInst?.vote);
                    form.setFieldValue('is_secret_ballot',
                        settingsInst?.is_secret_ballot || false);
                    form.setFieldValue('is_can_offer',
                        settingsInst?.is_can_offer || false);
                    form.setFieldValue('is_minority_not_participate',
                        settingsInst?.is_minority_not_participate || false);
                    form.setFieldValue('creator', creatorFio);
                    form.setFieldValue('init_categories', initCategories);
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

    useEffect(() => {
        getCommunitySettings();
    }, [getCommunitySettings]);

    return (
        <Layout>
            <Space
                style={{ marginTop: 10, marginBottom: 30 }}
            >
                <Spin
                    tip="Загрузка данных"
                    size="large"
                    spinning={settingsLoading}
                >
                    <Form
                        name='community-settings'
                        form={form}
                        style={{ width: 600 }}
                    >
                        <Form.Item
                            name='name'
                            label='Наименование'
                            labelCol={{ span: 24 }}
                        >
                            <Input readOnly />
                        </Form.Item>
                        <Form.Item
                            name='description'
                            label='Описание'
                            labelCol={{ span: 24 }}
                        >
                            <TextArea readOnly rows={5} />
                        </Form.Item>
                        <Form.Item
                            name='quorum'
                            label='Кворум (%)'
                            labelCol={{ span: 24 }}
                        >
                            <Input
                                type="number"
                                style={{ width: '20%'}}
                                readOnly
                            />
                        </Form.Item>
                        <Form.Item
                            name='vote'
                            label='Решение (%)'
                            labelCol={{ span: 24 }}
                        >
                            <Input
                                type="number"
                                style={{ width: '20%'}}
                                readOnly
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
                                disabled
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
                                disabled
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
                                disabled
                            />
                        </Form.Item>
                        <Form.Item
                            name='init_categories'
                            label='Категории'
                            labelCol={{ span: 24 }}
                        >
                            <Select
                                mode="multiple"
                                suffixIcon={null}
                                open={false}
                                removeIcon={null}
                            >

                            </Select>
                        </Form.Item>
                        <Form.Item
                            name='creator'
                            label='Создатель сообщества'
                            labelCol={{ span: 24 }}
                        >
                            <Input readOnly />
                        </Form.Item>
                    </Form>
                </Spin>
            </Space>
        </Layout>
    );
}


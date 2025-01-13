import {
    Col,
    Form,
    Input, Row,
    Select,
    Spin,
    Switch,
} from "antd";
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import TextArea from "antd/lib/input/TextArea";
import { CrudDataSourceService } from "src/services";
import { CommunityModel } from "src/models";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    IsMinorityNotParticipateLabel,
    IsSecretBallotLabel,
    QuorumLabel,
    SignificantMinorityLabel,
    VoteLabel
} from "src/consts";

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
                    'main_settings.categories',
                ])
                .then(community => {
                    const firstname =
                        community?.creator?.firstname;
                    const surname =
                        community?.creator?.surname;
                    const creatorFio = `${firstname} ${surname}`;
                    const settingsInst =
                        community.main_settings;
                    const categories =
                        (settingsInst?.categories || [])
                            .map((category) => category.name);
                    form.setFieldValue('name', settingsInst?.name?.name);
                    form.setFieldValue(
                        'description',
                        settingsInst?.description?.value || '');
                    form.setFieldValue('quorum', settingsInst?.quorum);
                    form.setFieldValue('vote', settingsInst?.vote);
                    form.setFieldValue('significant_minority',
                        settingsInst?.significant_minority);
                    form.setFieldValue('is_secret_ballot',
                        settingsInst?.is_secret_ballot || false);
                    form.setFieldValue('is_can_offer',
                        settingsInst?.is_can_offer || false);
                    form.setFieldValue('is_minority_not_participate',
                        settingsInst?.is_minority_not_participate || false);
                    form.setFieldValue('creator', creatorFio);
                    form.setFieldValue('categories', categories);
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
            <Spin
                tip="Загрузка данных"
                size="large"
                spinning={settingsLoading}
            >
                <Form
                    name='community-settings'
                    form={form}
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                            <Form.Item
                                name='name'
                                label='Наименование'
                                labelCol={{ span: 24 }}
                            >
                                <Input readOnly />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                            <Form.Item
                                name='description'
                                label='Описание'
                                labelCol={{ span: 24 }}
                            >
                                <TextArea readOnly rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name='quorum'
                                label={ QuorumLabel }
                                labelCol={{ span: 24 }}
                            >
                                <Input
                                    type="number"
                                    style={{ width: '20%'}}
                                    readOnly
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name='vote'
                                label={ VoteLabel }
                                labelCol={{ span: 24 }}
                            >
                                <Input
                                    type="number"
                                    style={{ width: '20%'}}
                                    readOnly
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name='significant_minority'
                                label={ SignificantMinorityLabel }
                                labelCol={{ span: 24 }}
                            >
                                <Input
                                    type="number"
                                    style={{ width: '20%'}}
                                    readOnly
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name='is_secret_ballot'
                                label={ IsSecretBallotLabel }
                                labelCol={{ span: 24 }}
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren={<CheckOutlined />}
                                    unCheckedChildren={<CloseOutlined />}
                                    disabled
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
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
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                            <Form.Item
                                name='is_minority_not_participate'
                                label={ IsMinorityNotParticipateLabel }
                                labelCol={{ span: 24 }}
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren={<CheckOutlined />}
                                    unCheckedChildren={<CloseOutlined />}
                                    disabled
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                            <Form.Item
                                name='categories'
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
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                            <Form.Item
                                name='creator'
                                label='Инициатор создания сообщества'
                                labelCol={{ span: 24 }}
                            >
                                <Input readOnly />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Spin>
    );
}


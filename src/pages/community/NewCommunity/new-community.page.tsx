import {
    Button,
    Form,
    Input,
    InputNumber,
    Layout,
    message,
    Space,
    Switch,
    Typography
} from "antd";
import {
    MinusCircleOutlined,
    PlusOutlined,
    CheckOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";
import {
    CommunitySettingsInterface
} from "../../../interfaces";
import { UserSettingsAoService } from "../../../services";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    IsMinorityNotParticipateLabel,
    IsSecretBallotLabel,
    QuorumLabel,
    SignificantMinorityLabel,
    VoteLabel
} from "../../../consts";

export function NewCommunity() {

    const navigate = useNavigate();
    const [messageApi, contextHolder] =
        message.useMessage();
    const [buttonLoading, setButtonLoading] =
        useState(false);
    const [disabled, setDisabled] =
        useState(true);

    const [form] = Form.useForm();

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
        const userSettingsAOService =
            new UserSettingsAoService();
        userSettingsAOService.createCommunity(formData)
            .then(() => {
                setButtonLoading(false);
                navigate('/my-communities',
                    { preventScrollReset: true });
            }
        ).catch((error) => {
            setButtonLoading(false);
            errorInfo(`Ошибка создания сообщества: ${error}`);
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
                    initialValues={{
                        is_secret_ballot: false,
                        is_can_offer: false,
                        is_minority_not_participate: false,
                        is_default_add_member: false,
                        is_not_delegate: false,
                    }}
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
                        label={ QuorumLabel }
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
                        label={ VoteLabel }
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
                    <Form.List name="categories">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space
                                        key={key}
                                        style={{ display: 'flex', marginBottom: 8, width: '100%' }}
                                        align="baseline"
                                    >
                                        <Form.Item
                                            {...restField}
                                            labelCol={{ span: 24 }}
                                            name={[name, 'name']}
                                            rules={
                                                [
                                                    {
                                                        required: true,
                                                        message: 'Пожалуйста, укажите наименование категории'
                                                    }
                                                ]
                                            }
                                            hasFeedback
                                        >
                                            <Input placeholder="Наименование категории" />
                                        </Form.Item>
                                        <MinusCircleOutlined
                                            onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        Добавить категорию
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
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


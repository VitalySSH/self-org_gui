import {
    Button,
    Form,
    Input,
    Layout,
    message, Row,
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
} from "src/interfaces";
import { UserSettingsAoService } from "src/services";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    IsExtraOptionsLabel,
    IsMultiSelectLabel,
} from "src/consts";

export function NewRule(props: any) {

    const communityId = props.communityId;

    const navigate = useNavigate();
    const [messageApi, contextHolder] =
        message.useMessage();

    const [buttonLoading, setButtonLoading] =
        useState(false);
    const [disabled, setDisabled] =
        useState(true);
    const [isExtraOptions, setIsExtraOptions] =
        useState(false);
    const [isMultiSelect, setIsMultiSelect] =
        useState(false);

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
            style={{ height: "100%", overflowY: "auto" }}
        >
            {contextHolder}
            <Space
                direction="vertical"
            >
                <Typography.Title
                    level={3}
                    style={{ textAlign: "center" }}
                >
                    Новое правило
                </Typography.Title>
                <Row justify="center" align="middle">
                    <Form
                        form={form}
                        name='new-rule'
                        onFinish={onFinish}
                        style={{ width: '40%', justifyContent: "center"}}
                        onFieldsChange={handleFormChange}
                        initialValues={{
                            is_extra_options: false,
                            is_multi_select: false,
                        }}
                    >
                        <Form.Item
                            name='title'
                            label='Заголовок'
                            labelCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, укажите заголовок для правила',
                                },
                                {
                                    max: 140,
                                    message: 'Текст заголовка не должен привышать 140 символов',
                                },
                            ]}
                            hasFeedback
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name='question'
                            label='Вопрос для голосования'
                            labelCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, укажите вопрос, на которой должны ответить при голосовании',
                                },
                                {
                                    max: 140,
                                    message: 'Текст вопроса не должен привышать 140 символов',
                                },
                            ]}
                            hasFeedback
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name='content'
                            label='Описание правила'
                            labelCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, подробно опишите цель и содержание правила',
                                },
                            ]}
                            hasFeedback
                        >
                            <TextArea rows={10} />
                        </Form.Item>
                        <Form.Item
                            name='is_extra_options'
                            label={ IsExtraOptionsLabel }
                            labelCol={{ span: 24 }}
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                            />
                        </Form.Item>
                        <Form.Item
                            name='is_multi_select'
                            label={ IsMultiSelectLabel }
                            labelCol={{ span: 24 }}
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                            />
                        </Form.Item>
                        <Form.List name="extra_options">
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
                                                            message: 'Пожалуйста, укажите дополнительный параметр для голосования'
                                                        }
                                                    ]
                                                }
                                                hasFeedback
                                            >
                                                <Input placeholder="Параметр" />
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
                                            Добавить параметр
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
                                block
                            >
                                Создать правило
                            </Button>
                        </Form.Item>
                    </Form>
                </Row>
            </Space>
        </Layout>
    );
}


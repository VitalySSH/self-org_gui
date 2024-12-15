import {
    Button,
    Form,
    Input,
    Layout,
    message,
    Row,
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
    CreatingRuleInterface,
    RuleFormInterface,
} from "src/interfaces";
import {CrudDataSourceService, RuleAoService} from "src/services";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    CategoryLabel,
    IsExtraOptionsLabel,
    IsMultiSelectLabel,
} from "src/consts";
import { CustomSelect } from "src/components";
import {
    CategoryModel,
    CommunityModel,
} from "src/models";

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

    const communityService =
        new CrudDataSourceService(CommunityModel);
    const categoryService =
        new CrudDataSourceService(CategoryModel);
    const ruleAoService = new RuleAoService();

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

    const onCustomSelectChange = (fieldName: string, value: any) => {
        form.setFieldValue(fieldName, value);
    }

    const handleFormChange = () => {
        const formData = form.getFieldsValue();
        setIsExtraOptions(Boolean(formData.is_extra_options));
        const isValidOptions =
            formData.is_extra_options ?
                (formData.extra_options || []).length > 0 : true;
        const isValid =
            Boolean(formData.title) &&
            Boolean(formData.question) &&
            Boolean(formData.content) &&
            Boolean(formData.category) &&
            isValidOptions;
        setDisabled(!isValid);
    }

    const getCategories = async () => {
        const _community = await communityService.get(
            communityId, ['main_settings.categories']
        );
        return _community.main_settings?.categories || [];
    }

    const extraOptions = (
        <>
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
                                icon={<PlusOutlined />}
                            >
                                Добавить параметр
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
        </>
    );

    const onFinish = (formData: RuleFormInterface) => {
        setButtonLoading(true);
        if (formData.question[formData.question.length - 1] !== '?') {
            formData.question += '?';
        }
        const ruleData: CreatingRuleInterface = {
            title: formData.title,
            question: formData.question,
            content: formData.content,
            is_extra_options: formData.is_extra_options,
            is_multi_select: formData.is_multi_select || false,
            community_id: communityId,
            category_id: formData.category.id,
            extra_options: (formData.extra_options || [])
                .map((it) => it.name),
        };

        ruleAoService.create_rule(ruleData)
            .then(() => {
                successInfo('Правило создано');
                navigate(-1);
            }).catch((error) => {
            errorInfo(`Ошибка создания правила: ${error}`);
        }).finally(() => setButtonLoading(false));
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
                            name='category'
                            label={CategoryLabel}
                            labelCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, выберите категорию',
                                },
                            ]}
                            hasFeedback
                        >
                            <CustomSelect
                                fieldService={categoryService}
                                requestOptions={getCategories}
                                onChange={onCustomSelectChange}
                                formField="category"
                                bindLabel="name"
                            />
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
                        {isExtraOptions && extraOptions}
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


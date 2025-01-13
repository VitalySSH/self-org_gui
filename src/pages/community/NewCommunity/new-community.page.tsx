import {
    Button,
    Form,
    message,
} from "antd";
import {
    NewCommunitySettingsInterface
} from "src/interfaces";
import { UserSettingsAoService } from "src/services";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { NewCommunityForm } from "src/components";

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

    const onFinish = () => {
        setButtonLoading(true);
        const formData: NewCommunitySettingsInterface = form.getFieldsValue();
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
        <>
            <div className="form-container">
                {contextHolder}
                <div className="form-header">
                    Новое сообщество
                </div>
                <NewCommunityForm
                    form={form}
                    setDisabledButton={setDisabled}
                />
            </div>
            <div className="toolbar">
                <Button
                    type='primary'
                    htmlType='submit'
                    loading={buttonLoading}
                    onClick={onFinish}
                    disabled={disabled}
                    className="toolbar-button"
                >
                    Создать сообщество
                </Button>
            </div>
        </>
    );
}


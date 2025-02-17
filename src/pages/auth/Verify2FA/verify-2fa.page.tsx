import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, message, Space } from 'antd';
import { AuthContextProvider } from 'src/interfaces';
import { useAuth } from 'src/hooks';

export const Verify2FA = () => {
  const navigate = useNavigate();
  const authData: AuthContextProvider = useAuth();

  const onFinish = (values: { code: string }) => {
    // const isValid = await verify2FACode(values.code);
    const isValid = Boolean(values.code);
    if (isValid && authData.is2FAVerified) {
      navigate(-1);
    } else {
      message
        .warning('Недействительный код. ' + 'Пожалуйста, попробуйте снова')
        .then();
    }
  };

  return (
    <Space className="auth-space">
      <Card style={{ width: 500 }}>
        <Form name="verify_code" className="verify-code" onFinish={onFinish}>
          <Form.Item
            name="code"
            rules={[
              {
                required: true,
                message: 'Пожалуйста, введите код',
                type: 'string',
              },
            ]}
          >
            <Input placeholder="Код" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="button" block>
              Отправить
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

import { Button, Form, Input, Modal } from 'antd';
import { CommunityFilterModalProps } from 'src/interfaces';

export function CommunityFilterModal({
  visible,
  onCancel,
  onApply,
  onReset,
}: CommunityFilterModalProps) {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Modal
      title="Фильтры"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="reset" onClick={handleReset}>
          Сбросить
        </Button>,
        <Button key="apply" type="primary" onClick={() => form.submit()}>
          Найти
        </Button>,
      ]}
    >
      <Form
        name="communityFilterModalForm"
        form={form}
        onFinish={onApply}
        layout="vertical"
      >
        <Form.Item label="Наименование" name="title">
          <Input placeholder="Поиск по названию" />
        </Form.Item>

        <Form.Item label="Описание" name="content">
          <Input.TextArea placeholder="Поиск по описанию" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

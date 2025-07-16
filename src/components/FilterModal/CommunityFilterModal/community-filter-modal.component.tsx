import { Button, Form, Input, Modal } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
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

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div>
          <FilterOutlined className="filter-modal-icon" />
          Фильтры
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="reset" onClick={handleReset}>
          Сбросить
        </Button>,
        <Button key="apply" type="primary" onClick={() => form.submit()}>
          Применить фильтры
        </Button>,
      ]}
      className="filter-modal"
      width={500}
      centered
      destroyOnClose
      styles={{
        body: {
          maxHeight: 'calc(85vh - 108px)',
          overflowY: 'auto',
          padding: 0
        }
      }}
    >
      <div className="filter-modal-content">
        <Form
          name="communityFilterModalForm"
          form={form}
          onFinish={onApply}
          layout="vertical"
          className="filter-form"
        >
          <Form.Item
            label="Наименование"
            name="title"
            tooltip="Поиск будет выполнен по названию сообщества"
          >
            <Input
              placeholder="Введите название для поиска"
              size="large"
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="Описание"
            name="content"
            tooltip="Поиск будет выполнен по фрагменту описания сообщества"
          >
            <Input.TextArea
              placeholder="Введите текст для поиска в описании"
              rows={3}
              showCount
              maxLength={200}
              size="large"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
import { NewCommunityFormProps } from 'src/interfaces';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
  Tooltip,
} from 'antd';
import {
  CommunityDescriptionLabel,
  CommunityNameLabel,
  IsCanOfferLabel,
  IsDefaultAddMemberLabel,
  IsMinorityNotParticipateLabel,
  IsNotDelegateLabel,
  IsSecretBallotLabel,
  QuorumLabel,
  SignificantMinorityLabel,
  VoteLabel,
} from 'src/consts';
import {
  CheckOutlined,
  CloseOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';

export function NewCommunityForm(props: NewCommunityFormProps) {
  const handleFormChange = () => {
    const formData = props.form.getFieldsValue();
    const isValid =
      Boolean(formData.name) &&
      Boolean(formData.description) &&
      Boolean(formData.quorum) &&
      Boolean(formData.significant_minority) &&
      Boolean(formData.vote);
    props.setDisabledButton(!isValid);
  };

  return (
    <Form
      form={props.form}
      name="new-community-settings"
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
        name="name"
        label={
          <span>
            {CommunityNameLabel}&nbsp;
            <Tooltip title="Введите название вашего сообщества. Максимум 80 символов.">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
        labelCol={{ span: 24 }}
        rules={[
          {
            required: true,
            message: 'Пожалуйста, введите наименование сообщества',
          },
          {
            max: 80,
            message: 'Название должно содержать не более 80 символов.',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label={
          <span>
            {CommunityDescriptionLabel}&nbsp;
            <Tooltip title="Введите описание вашего сообщества. Максимум 200 символов.">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
        labelCol={{ span: 24 }}
        rules={[
          {
            required: true,
            message: 'Пожалуйста, заполните описание сообщества',
          },
          {
            max: 200,
            message: 'Описание должно содержать не более 200 символов.',
          },
        ]}
      >
        <TextArea rows={2} />
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="quorum"
            label={
              <span>
                {QuorumLabel}&nbsp;
                <Tooltip title="Введите минимальный процент от числа участников сообщества, требующийся для правомочности голосования. Значение от 1 до 100%.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message: 'Пожалуйста, укажите кворум сообщества',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={100}
              min={1}
              step={1}
              style={{ width: 50 }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="vote"
            label={
              <span>
                {VoteLabel}&nbsp;
                <Tooltip title="Введите минимальный процент от всех голосов, который должен получить вариант, требующийся для победы в голосовании. Значение от 50 до 100%.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message: 'Пожалуйста, укажите избирательный порог.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={100}
              min={50}
              step={1}
              style={{ width: 50 }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="significant_minority"
            label={
              <span>
                {SignificantMinorityLabel}&nbsp;
                <Tooltip title="Введите минимальный процент от всех голосов, при достижении которого вариант голосования будет считаться общественно-значимым. Значение от 1 до 50%.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message:
                  'Пожалуйста, укажите процент общественно-значимого меньшинства, значение от 1 до 50%.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={50}
              min={1}
              step={1}
              style={{ width: 50 }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="is_secret_ballot"
            label={IsSecretBallotLabel}
            labelCol={{ span: 24 }}
            valuePropName="checked"
          >
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="is_can_offer"
            label={IsCanOfferLabel}
            labelCol={{ span: 24 }}
            valuePropName="checked"
          >
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="is_minority_not_participate"
            label={
              <span>
                {IsMinorityNotParticipateLabel}&nbsp;
                <Tooltip title="В случае утверждения инициативы, меньшинство, которое её не поддержало обязано принимать участие в её исполнении или достаточно того, что оно не должно препятствовать?">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            valuePropName="checked"
          >
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="is_default_add_member"
            label={IsDefaultAddMemberLabel}
            labelCol={{ span: 24 }}
            valuePropName="checked"
          >
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="is_not_delegate"
            label={IsNotDelegateLabel}
            labelCol={{ span: 24 }}
            valuePropName="checked"
          >
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.List name="categories">
        {(fields, { add, remove }) => (
          <div className="form-list-input">
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} align="baseline">
                <Form.Item
                  {...restField}
                  labelCol={{ span: 24 }}
                  name={[name, 'name']}
                  rules={[
                    {
                      required: true,
                      message: 'Пожалуйста, укажите наименование категорий',
                    },
                  ]}
                >
                  <Input placeholder="Наименование категории" maxLength={60} />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="primary"
                onClick={() => add()}
                icon={<PlusOutlined />}
              >
                Добавить категорию
              </Button>
              <Tooltip title="Категории - это темы или направления для голосований. Они помогают структурировать вопросы и выбирать делегатов. Максимум 60 символов.">
                <QuestionCircleOutlined style={{ marginLeft: 6 }} />
              </Tooltip>
            </Form.Item>
          </div>
        )}
      </Form.List>
    </Form>
  );
}

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
  DecisionDelayLabel,
  DisputeTimeLimitLabel,
  IsCanOfferLabel,
  IsDefaultAddMemberLabel,
  IsMinorityNotParticipateLabel,
  IsNotDelegateLabel,
  IsSecretBallotLabel,
  IsWorkGroupLabel,
  QuorumLabel,
  SignificantMinorityLabel,
  VoteLabel,
  WorkGroupLabel,
} from 'src/consts';
import {
  CheckOutlined,
  CloseOutlined,
  MinusCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import { useState } from 'react';

export function NewCommunityForm(props: NewCommunityFormProps) {

  const [isWorkGroup, setIsWorkGroup] = useState(false);

  const handleFormChange = () => {
    const formData = props.form.getFieldsValue();
    setIsWorkGroup(formData.is_workgroup);
    const isValid =
      Boolean(formData.name) &&
      Boolean(formData.description) &&
      Boolean(formData.quorum) &&
      Boolean(formData.significant_minority) &&
      Boolean(formData.vote) &&
      Boolean(formData.decision_delay) &&
      Boolean(formData.dispute_time_limit);
    props.setDisabledButton(!isValid);
  };

  const workgroupItem  = (
    <Form.Item
      name="workgroup"
      label={
        <span>
            {WorkGroupLabel}&nbsp;
          <Tooltip title="Предложите оптимальное, с вашей точки зрения количество участников для формирования рабочих групп. Минимум 3, максимум 15 человек.">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
      }
      labelCol={{ span: 24 }}
      rules={[
        {
          required: true,
          message:
            'Пожалуйста, укажите количетсво участников рабочей группы',
        },
      ]}
    >
      <InputNumber
        type="number"
        controls={false}
        max={15}
        min={3}
        step={1}
        style={{ width: 50 }}
      />
    </Form.Item>
  );

  return (
    <Form
      form={props.form}
      name="new-community-settings"
      onFieldsChange={handleFormChange}
      initialValues={{
        is_workgroup: false,
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
                <Tooltip title="Введите минимальный процент участников для действительности голосования. Значение от 1 до 100%.">
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
                <Tooltip title="Введите минимальную долю голосов, необходимую для принятия решения. Значение от 50 до 100%.">
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
                <Tooltip title="Введите минимальный процент голосов, при достижении которого вариант считается общественно значимым. Значение от 1 до 50%.">
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
            name="decision_delay"
            label={
              <span>
                {DecisionDelayLabel}&nbsp;
                <Tooltip title="Укажите количество дней между достижением кворума и моментом вступления решения в силу. Данный период предоставляет участникам возможность для изучения мнений друг друга, анализа последствий и корректировки своей позиции перед принятием решения. Максимальное значение 30 дней.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message:
                  'Пожалуйста, укажите количество дней отсрочки вступления решения в силу, значение от 1 до 30 дней.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={30}
              min={1}
              step={1}
              style={{
                width: 50,
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="is_workgroup"
            label={
              <span>
                {IsWorkGroupLabel}&nbsp;
                <Tooltip title="Рабочая группа может быть сформрована после утверждения инициативы, для выработки одного или нескольких проектов реализации данной инициативы. При отсутсвиии рабочей группы предполагается, что в выработке проектов реализаций участвуют все желающие участники сообщества.">
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
          {isWorkGroup && workgroupItem}
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="dispute_time_limit"
            label={
              <span>
                {DisputeTimeLimitLabel}&nbsp;
                <Tooltip title="Укажите максимальное количество дней, которое потребуется для урегилирования спорных ситуаций. Максимальное значение 30 дней.">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelCol={{ span: 24 }}
            rules={[
              {
                required: true,
                message:
                  'Пожалуйста, укажите количество дней для рассмотрения споров, значение от 1 до 30 дней.',
              },
            ]}
          >
            <InputNumber
              type="number"
              controls={false}
              max={30}
              min={1}
              step={1}
              style={{
                width: 50,
              }}
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
                  <Input placeholder="Наименование категории" maxLength={80} />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="primary"
                onClick={() => add()}
              >
                Добавить категорию
              </Button>
              <Tooltip title="Категории - это темы или направления для голосований. Они помогают структурировать вопросы и выбирать советников. Максимум 60 символов.">
                <QuestionCircleOutlined style={{ marginLeft: 6 }} />
              </Tooltip>
            </Form.Item>
          </div>
        )}
      </Form.List>
    </Form>
  );
}

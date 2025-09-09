import { useCallback, useEffect, useState } from 'react';
import { Button, Checkbox, Form, message, Modal, Space } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { MemberRequestCardItem, SimpleVoting } from 'src/interfaces';
import { CrudDataSourceService } from 'src/services';
import { RequestMemberModel, StatusModel } from 'src/models';
import { AbstainedCode, VotedCode } from 'src/consts';

interface MemberRequestVoteButtonProps {
  item: MemberRequestCardItem;
  setLoading?: (loading: boolean) => void;
}

export function MemberRequestVoteButton({
  item,
  setLoading,
}: MemberRequestVoteButtonProps) {
  const modalTitle = item ? `Голосование: ${item.member}` : '';
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [loadFormData, setLoadFormData] = useState(false);
  const [vote, setVote] = useState(item?.vote as boolean | null);
  const [disabled, setDisabled] = useState(true);
  const [voteForm] = Form.useForm();

  const successInfo = (content: string) => {
    messageApi
      .open({
        type: 'success',
        content: content,
      })
      .then();
  };

  const errorInfo = (content: string) => {
    messageApi
      .open({
        type: 'error',
        content: content,
      })
      .then();
  };

  const updateForm = useCallback(() => {
    if (modalOpen && !loadFormData) {
      if (vote === null) {
        voteForm.setFieldsValue({ yes: false, no: false });
      } else if (vote) {
        voteForm.setFieldsValue({ yes: true, no: false });
      } else {
        voteForm.setFieldsValue({ yes: false, no: true });
      }
      setLoadFormData(true);
    }
  }, [loadFormData, modalOpen, vote, voteForm]);

  useEffect(() => {
    updateForm();
  }, [updateForm]);

  const handleCancel = () => {
    setModalOpen(false);
    setDisabled(true);
  };

  const toVote = () => {
    setModalOpen(true);
  };

  const onFinish = async (formData: SimpleVoting) => {
    try {
      const statusService = new CrudDataSourceService(StatusModel);
      const requestMemberService = new CrudDataSourceService(
        RequestMemberModel
      );

      const resp = await statusService.list([
        {
          field: 'code',
          op: 'in',
          val: [VotedCode, AbstainedCode],
        },
      ]);

      let votedStatus: StatusModel | undefined = undefined;
      let abstainedStatus: StatusModel | undefined = undefined;

      resp.data.forEach((s) => {
        if (s.code === VotedCode) votedStatus = s;
        if (s.code === AbstainedCode) abstainedStatus = s;
      });

      const requestMember = new RequestMemberModel();
      requestMember.id = item?.key;

      if (formData.yes) {
        requestMember.vote = true;
        if (votedStatus) requestMember.status = votedStatus;
      } else if (formData.no) {
        requestMember.vote = false;
        if (votedStatus) requestMember.status = votedStatus;
      } else {
        requestMember.vote = null;
        if (abstainedStatus) requestMember.status = abstainedStatus;
      }

      await requestMemberService.save(requestMember, false);

      setVote(formData.yes || false);
      successInfo('Голос отдан');
      setModalOpen(false);
      setDisabled(true);
      if (setLoading) setLoading(true);
    } catch (error) {
      errorInfo(`Ошибка сохранения запроса: ${error}`);
    }
  };

  const onValuesChange = (formData: SimpleVoting) => {
    if (formData.yes !== undefined) {
      if (formData.yes && voteForm.getFieldValue('no')) {
        voteForm.setFieldValue('no', false);
      }
    } else if (formData.no !== undefined) {
      if (formData.no && voteForm.getFieldValue('yes')) {
        voteForm.setFieldValue('yes', false);
      }
    }
    if (disabled) {
      setDisabled(false);
    }
  };

  const getVoteStatus = () => {
    if (vote === true) return { text: 'За', color: '#52c41a' };
    if (vote === false) return { text: 'Против', color: '#ff4d4f' };
    return null;
  };

  const voteStatus = getVoteStatus();

  return (
    <>
      {contextHolder}
      <Modal
        centered
        open={modalOpen}
        title={modalTitle}
        onCancel={handleCancel}
        footer={null}
        width={400}
        styles={{
          header: {
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '12px',
            marginBottom: '20px',
          },
        }}
      >
        <Form
          name={`vote-member-request_${item?.key}`}
          form={voteForm}
          onFinish={onFinish}
          onValuesChange={onValuesChange}
          layout="vertical"
        >
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              Выберите ваше решение по заявке участника:
            </p>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Form.Item
                name="yes"
                valuePropName="checked"
                style={{ margin: 0 }}
              >
                <Checkbox style={{ fontSize: '14px' }}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <span>За принятие в сообщество</span>
                  </Space>
                </Checkbox>
              </Form.Item>

              <Form.Item
                name="no"
                valuePropName="checked"
                style={{ margin: 0 }}
              >
                <Checkbox style={{ fontSize: '14px' }}>
                  <Space>
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    <span>Против принятия в сообщество</span>
                  </Space>
                </Checkbox>
              </Form.Item>
            </Space>
          </div>

          <Form.Item style={{ margin: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={disabled}
              block
              style={{
                height: '40px',
                borderRadius: '6px',
                fontWeight: 500,
              }}
            >
              Отдать голос
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Button
        disabled={item?.isMyRequest || false}
        onClick={toVote}
        icon={<IdcardOutlined />}
        className="vote-button"
        style={{
          borderRadius: '6px',
          fontWeight: 500,
          fontSize: '12px',
          height: '32px',
          minWidth: '100px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          ...(voteStatus && {
            borderColor: voteStatus.color,
            color: voteStatus.color,
          }),
        }}
      >
        {voteStatus ? voteStatus.text : 'Голосовать'}
      </Button>
    </>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, List, message, Modal, Progress, Space } from 'antd';
import { BarChartOutlined, UserOutlined } from '@ant-design/icons';
import { SettingsStatisticsInterface } from 'src/interfaces';
import { RequestMemberAoService } from 'src/services';

interface MemberRequestVotesButtonProps {
  item: {
    key: string;
    member: string;
  };
}

export function MemberRequestVotesButton({ item }: MemberRequestVotesButtonProps) {
  const modalTitle = item ? `Статистика голосов: ${item.member}` : '';
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [votes, setVotes] = useState<SettingsStatisticsInterface[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const errorInfo = useCallback(
    (content: string) => {
      messageApi.open({
        type: 'error',
        content: content,
      });
    },
    [messageApi]
  );

  const getVotes = useCallback(async () => {
    if (!votes && item?.key) {
      try {
        setLoading(true);
        const requestMemberAoService = new RequestMemberAoService();
        const response = await requestMemberAoService.votesInPercent(item.key);
        setVotes(response.data);
      } catch (error) {
        errorInfo(`${error}`);
      } finally {
        setLoading(false);
      }
    }
  }, [errorInfo, item.key, votes]);

  useEffect(() => {
    if (modalOpen) {
      getVotes();
    }
  }, [modalOpen, getVotes]);

  const handleCancel = () => {
    setModalOpen(false);
  };

  const displayVotes = () => {
    setModalOpen(true);
  };

  const getProgressColor = (name: string) => {
    if (name.toLowerCase().includes('за') || name.toLowerCase().includes('да')) {
      return '#52c41a';
    }
    if (name.toLowerCase().includes('против') || name.toLowerCase().includes('нет')) {
      return '#ff4d4f';
    }
    return '#1890ff';
  };

  return (
    <>
      {contextHolder}
      <Modal
        centered
        open={modalOpen}
        title={modalTitle}
        onCancel={handleCancel}
        footer={null}
        width={500}
        styles={{
          header: {
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '12px',
            marginBottom: '20px'
          }
        }}
      >
        <List
          loading={loading}
          itemLayout="vertical"
          dataSource={votes}
          locale={{ emptyText: 'Нет данных о голосовании' }}
          renderItem={(item: SettingsStatisticsInterface) => (
            <List.Item style={{ padding: '12px 0' }}>
              <Card
                size="small"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Space>
                      <UserOutlined style={{ color: getProgressColor(item.name) }} />
                      <span style={{ fontWeight: 500, fontSize: '14px' }}>
                        {item.name}
                      </span>
                    </Space>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '16px',
                      color: getProgressColor(item.name)
                    }}>
                      {item.percent}%
                    </span>
                  </div>

                  <Progress
                    percent={item.percent}
                    showInfo={false}
                    strokeColor={getProgressColor(item.name)}
                    trailColor="#f0f0f0"
                    size="small"
                    style={{ margin: 0 }}
                  />
                </Space>
              </Card>
            </List.Item>
          )}
        />

        {votes && votes.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px 0',
            color: '#999'
          }}>
            <UserOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <p>Пока нет голосов по этой заявке</p>
          </div>
        )}
      </Modal>

      <Button
        onClick={displayVotes}
        icon={<BarChartOutlined />}
        className="votes-button"
        style={{
          borderRadius: '6px',
          fontWeight: 500,
          fontSize: '12px',
          height: '32px',
          minWidth: '100px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        Статистика
      </Button>
    </>
  );
}
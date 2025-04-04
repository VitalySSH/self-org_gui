import { Button, Card, List, message, Modal } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { SettingsStatisticsInterface } from 'src/interfaces';
import { RequestMemberAoService } from 'src/services';
import Meta from 'antd/es/card/Meta';
import { AreaChartOutlined } from '@ant-design/icons';

export function MemberRequestVotesButton(props: any) {
  const item = props.item;
  const modalTitle = item ? `${item?.member} (статистика голосов)` : '';
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [votes, setVotes] = useState(
    undefined as SettingsStatisticsInterface[] | undefined
  );

  const errorInfo = useCallback(
    (content: string) => {
      messageApi
        .open({
          type: 'error',
          content: content,
        })
        .then();
    },
    [messageApi]
  );

  const getVotes = useCallback(() => {
    if (votes === undefined && item?.key) {
      const requestMemberAoService = new RequestMemberAoService();
      requestMemberAoService
        .votesInPercent(item.key)
        .then((r) => {
          setVotes(r.data);
        })
        .catch((error) => errorInfo(error));
    }
  }, [errorInfo, item.key, votes]);

  useEffect(() => {
    getVotes();
  }, [getVotes]);

  const handleCancel = () => {
    setModalOpen(false);
  };

  const displayVotes = () => {
    setModalOpen(true);
  };

  return (
    <>
      {contextHolder}
      <Modal
        forceRender
        centered
        open={modalOpen}
        title={modalTitle}
        onCancel={handleCancel}
        footer={[]}
      >
        <List
          itemLayout="vertical"
          dataSource={votes}
          locale={{ emptyText: 'Нет данных' }}
          size="large"
          renderItem={(it: SettingsStatisticsInterface) => (
            <List.Item>
              <Card>
                <Meta title={it.name} />
                <div>{`${it.percent}%`}</div>
              </Card>
            </List.Item>
          )}
        />
      </Modal>
      <Button
        onClick={displayVotes}
        icon={<AreaChartOutlined />}
        style={{ maxWidth: 120 }}
      >
        Статистика
      </Button>
    </>
  );
}

import { Button, Card, List, message, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { SettingsStatisticsInterface } from 'src/interfaces';
import { RequestMemberAoService } from 'src/services';
import Meta from 'antd/es/card/Meta';

export function MemberRequestVotesButton(props: any) {
  const tableRow = props.tableRow;
  const modalTitle = tableRow ? `${tableRow?.member} (статистика голосов)` : '';
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [votes, setVotes] = useState(
    undefined as SettingsStatisticsInterface[] | undefined
  );

  const requestMemberAoService = new RequestMemberAoService();

  const errorInfo = (content: string) => {
    messageApi
      .open({
        type: 'error',
        content: content,
      })
      .then();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getVotes = () => {
    if (votes === undefined && tableRow?.key) {
      requestMemberAoService
        .votesInPercent(tableRow.key)
        .then((r) => {
          setVotes(r.data);
        })
        .catch((error) => errorInfo(error));
    }
  };

  useEffect(() => {
    getVotes();
  }, [getVotes, setVotes, votes]);

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
          renderItem={(item: SettingsStatisticsInterface) => (
            <List.Item>
              <Card>
                <Meta title={item.name} />
                <div>{`${item.percent}%`}</div>
              </Card>
            </List.Item>
          )}
        />
      </Modal>
      <Button onClick={displayVotes}>Статистика</Button>
    </>
  );
}

import { useAuth } from 'src/hooks';
import { AuthContextProvider, FilterItem, OpinionsProps } from 'src/interfaces';
import { Button, ConfigProvider, Input, List, message, Pagination } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { SetStateAction, useEffect, useState } from 'react';
import { CrudDataSourceService } from 'src/services';
import { OpinionModel, VotingOptionModel } from 'src/models';
import ruRU from 'antd/lib/locale/ru_RU';

export function Opinions(props: OpinionsProps) {
  const authData: AuthContextProvider = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [newOpinion, setNewOpinion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([] as OpinionModel[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(props.maxPageSize);
  const [total, setTotal] = useState(0);
  const [isMyOpinion, setIsMyOpinion] = useState<boolean | null>(null);

  const opinionService = new CrudDataSourceService(OpinionModel);

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

  const getFilter = (): FilterItem => {
    switch (props.resource) {
      case 'initiative':
        return {
          field: 'initiative_id',
          op: 'equals',
          val: props.initiativeId,
        };
      case 'rule':
        return {
          field: 'rule_id',
          op: 'equals',
          val: props.ruleId,
        };
    }
  };

  const fetchOpinions = () => {
    if (loading && props) {
      opinionService
        .list(
          [getFilter()],
          undefined,
          { skip: currentPage, limit: pageSize },
          ['creator']
        )
        .then((resp) => {
          setTotal(resp.total);
          setDataSource(resp.data);
        })
        .catch((error) => {
          errorInfo(`При получении мнений возникла ошибка: ${error}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const fetchMyOpinion = () => {
    const userId = authData.user?.id;
    if (userId && isMyOpinion === null) {
      opinionService
        .list([
          getFilter(),
          {
            field: 'creator_id',
            op: 'equals',
            val: userId,
          },
        ])
        .then((resp) => {
          setIsMyOpinion(resp.total > 0);
        });
    }
  };

  useEffect(() => {
    fetchOpinions();
    fetchMyOpinion();
  }, [fetchOpinions, fetchMyOpinion]);

  const handleAddComment = () => {
    if (newOpinion.trim()) {
      const opinion = opinionService.createRecord();
      opinion.text = newOpinion;
      opinion.creator = authData.getUserRelation();
      switch (props.resource) {
        case 'rule':
          opinion.rule_id = props.ruleId;
          break;
        case 'initiative':
          opinion.initiative_id = props.initiativeId;
          break;
      }
      opinionService
        .save(opinion)
        .then((resp) => {
          setIsMyOpinion(true);
          dataSource.unshift(resp);
          setDataSource(dataSource);
        })
        .catch((error) => {
          errorInfo(`При сохранении мнений возникла ошибка: ${error}`);
        })
        .finally(() => {
          setNewOpinion('');
        });
      setNewOpinion('');
    }
  };

  const handlePageChange = (
    page: SetStateAction<number>,
    size: SetStateAction<number>
  ) => {
    setCurrentPage(page);
    setPageSize(size);
    setLoading(true);
  };

  const updateOpinion = (opinion: VotingOptionModel, content: string) => {
    opinion.content = content;
    opinionService.save(opinion).then(() => {
      successInfo('Мнение отредактировано');
    });
  };

  return (
    <div className="comments-section">
      {contextHolder}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <h3>Мнения</h3>
        <div style={{ marginLeft: 6 }}>{total}</div>
      </div>
      {!isMyOpinion && (
        <>
          <TextArea
            rows={4}
            value={newOpinion}
            onChange={(e) => setNewOpinion(e.target.value)}
            placeholder="Поделитесь своим мнением"
          />
          <Button
            type="primary"
            onClick={handleAddComment}
            style={{ marginTop: 10 }}
          >
            Отправить
          </Button>
        </>
      )}

      <List
        dataSource={dataSource}
        loading={loading}
        locale={{ emptyText: 'Нет мнений' }}
        size="large"
        renderItem={(opinion) => (
          <List.Item
            className={
              opinion.creator?.id === authData.user?.id ? 'user-comment' : ''
            }
          >
            <List.Item.Meta
              title={opinion.creator?.fullname}
              description={
                opinion.creator?.id === authData.user?.id ? (
                  <Input.TextArea
                    defaultValue={opinion.text}
                    onBlur={(e) => updateOpinion(opinion, e.target.value)}
                  />
                ) : (
                  opinion.text
                )
              }
            />
          </List.Item>
        )}
      />
      {total > pageSize && (
        <ConfigProvider locale={ruRU}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={['10', '20', '50', '100']}
            defaultPageSize={props.maxPageSize}
            showTotal={(total, range) => `${range[0]}-${range[1]} из ${total}`}
            style={{ marginTop: 16, textAlign: 'center' }}
          />
        </ConfigProvider>
      )}
    </div>
  );
}

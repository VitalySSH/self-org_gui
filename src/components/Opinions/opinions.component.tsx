import { useAuth } from 'src/hooks';
import { AuthContextProvider, FilterItem, OpinionsProps } from 'src/interfaces';
import { Badge, Button, Input, List, message, Pagination } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CrudDataSourceService } from 'src/services';
import { OpinionModel } from 'src/models';
import { EditOutlined } from '@ant-design/icons';
import {
  AISummaryOpinions
} from 'src/components/AI/AISummaryOpinions/ai-summary-opinions.component.tsx';

export function Opinions(props: OpinionsProps) {
  const authData: AuthContextProvider = useAuth();
  const maxPageSize = 20;
  const [messageApi, contextHolder] = message.useMessage();
  const [newOpinion, setNewOpinion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([] as OpinionModel[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(props.maxPageSize || maxPageSize);
  const [total, setTotal] = useState(0);
  const [isMyOpinion, setIsMyOpinion] = useState<boolean | null>(null);
  const [editingOpinionId, setEditingOpinionId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [isSummaryModalVisible, setSummaryModalVisible] = useState(false);

  const opinionService = useMemo(
    () => new CrudDataSourceService(OpinionModel),
    []
  );

  const successInfo = (content: string) => {
    messageApi
      .open({
        type: 'success',
        content: content,
      })
      .then();
  };

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

  const getFilter = useCallback((): FilterItem => {
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
  }, [props.initiativeId, props.resource, props.ruleId]);

  const fetchOpinions = useCallback(() => {
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
  }, [
    currentPage,
    errorInfo,
    getFilter,
    loading,
    opinionService,
    pageSize,
    props,
  ]);

  const fetchMyOpinion = useCallback(() => {
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
  }, [authData.user?.id, getFilter, isMyOpinion, opinionService]);

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
      setTotal(total + 1);
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

  const handleEditOpinion = (opinion: OpinionModel) => {
    setEditingOpinionId(opinion.id);
    setEditedText(opinion.text || '');
  };

  const handleSaveOpinion = (opinion: OpinionModel) => {
    opinion.text = editedText;
    opinionService
      .save(opinion)
      .then(() => {
        successInfo('Мнение сохранено');
        setEditingOpinionId(null);
      })
      .catch((error) => {
        errorInfo(`При сохранении мнения возникла ошибка: ${error}`);
      });
  };

  const handleCancelEdit = () => {
    setEditingOpinionId(null);
    setEditedText('');
  };

  const handleSummarizeOpinions = () => {
    setSummaryModalVisible(true);
  };

  return (
    <div className="comments-section">
      {contextHolder}
      <div
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h3>Мнения</h3>
            <Badge count={total} style={{ marginLeft: 8 }} />
          </div>
          <Button
            type="primary"
            onClick={handleSummarizeOpinions}
          >
            AI суммирование мнений
          </Button>
        </div>
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
                  <>
                    {editingOpinionId === opinion.id ? (
                      <>
                        <Input.TextArea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                        />
                        <div style={{ marginTop: 10 }}>
                          <Button
                            type="primary"
                            onClick={() => handleSaveOpinion(opinion)}
                            style={{ marginRight: 10 }}
                          >
                            Сохранить
                          </Button>
                          <Button onClick={handleCancelEdit}>Отменить</Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {opinion.text}
                        <EditOutlined
                          onClick={() => handleEditOpinion(opinion)}
                          style={{ marginLeft: 10, fontSize: 20 }}
                        />
                      </>
                    )}
                  </>
                ) : (
                  opinion.text
                )
              }
            />
          </List.Item>
        )}
      />
      {total > pageSize && (
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          pageSizeOptions={['10', '20', '50', '100']}
          defaultPageSize={props.maxPageSize || maxPageSize}
          showTotal={(total, range) => `${range[0]}-${range[1]} из ${total}`}
          style={{ marginTop: 16, textAlign: 'center' }}
        />
      )}

      <AISummaryOpinions
        visible={isSummaryModalVisible}
        onClose={() => setSummaryModalVisible(false)}
        resource={props.resource}
        ruleId={props.ruleId}
        initiativeId={props.initiativeId}
      />
    </div>
  );
}

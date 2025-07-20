import { useAuth } from 'src/hooks';
import { AuthContextProvider, FilterItem, OpinionsProps } from 'src/interfaces';
import { Badge, Button, Checkbox, List, message, Pagination, Spin } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CrudDataSourceService } from 'src/services';
import { OpinionModel } from 'src/models';
import {
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { AIOpinionAssistant, AISummaryOpinions } from 'src/components';
import './opinions.component.scss';

export function Opinions(props: OpinionsProps) {
  const authData: AuthContextProvider = useAuth();
  const maxPageSize = 20;
  const [messageApi, contextHolder] = message.useMessage();
  const [newOpinion, setNewOpinion] = useState('');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<OpinionModel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(props.maxPageSize || maxPageSize);
  const [total, setTotal] = useState(0);
  const [isMyOpinion, setIsMyOpinion] = useState<boolean | null>(null);
  const [myOpinion, setMyOpinion] = useState<OpinionModel | null>(null);
  const [editingOpinionId, setEditingOpinionId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [isSummaryModalVisible, setSummaryModalVisible] = useState(false);
  const [searchMyOpinion, setSearchMyOpinion] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);

  const opinionService = useMemo(
    () => new CrudDataSourceService(OpinionModel),
    []
  );

  const successInfo = (content: string) => {
    messageApi.open({ type: 'success', content }).then();
  };

  const errorInfo = useCallback(
    (content: string) => messageApi.open({ type: 'error', content }).then(),
    [messageApi]
  );

  const getFilter = useCallback((): FilterItem => {
    return {
      field: props.resource === 'initiative' ? 'initiative_id' : 'rule_id',
      op: 'equals',
      val: props.resource === 'initiative' ? props.initiativeId : props.ruleId,
    };
  }, [props.resource, props.initiativeId, props.ruleId]);

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
        .catch((error) => errorInfo(`Ошибка получения мнений: ${error}`))
        .finally(() => setLoading(false));
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

  const fetchMyOpinion = useCallback(async () => {
    const userId = authData.user?.id;
    if (!userId) return;

    try {
      const resp = await opinionService.list([
        getFilter(),
        { field: 'creator_id', op: 'equals', val: userId },
      ]);
      setIsMyOpinion(resp.total > 0);
      setMyOpinion(resp.data[0] || null);
    } catch (error) {
      errorInfo('Ошибка поиска вашего мнения');
    }
  }, [authData.user?.id, getFilter, opinionService, errorInfo]);

  useEffect(() => {
    fetchOpinions();
    fetchMyOpinion();
  }, [fetchOpinions, fetchMyOpinion]);

  const handleSearchMyOpinion = async () => {
    if (searchMyOpinion) {
      setSearchMyOpinion(false);
      return;
    }

    setSearchLoading(true);
    try {
      if (!myOpinion) {
        await fetchMyOpinion();
      }
      setSearchMyOpinion(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const filteredDataSource = useMemo(() => {
    if (!searchMyOpinion || !myOpinion) return dataSource;

    const isInCurrentPage = dataSource.some((item) => item.id === myOpinion.id);
    return isInCurrentPage
      ? dataSource.filter((item) => item.id === myOpinion.id)
      : [myOpinion];
  }, [dataSource, searchMyOpinion, myOpinion]);

  const handleAddComment = async () => {
    if (!newOpinion.trim()) return;

    const opinion = opinionService.createRecord();
    opinion.text = newOpinion;
    opinion.creator = authData.getUserRelation();

    if (props.resource === 'rule') {
      opinion.rule_id = props.ruleId;
    } else {
      opinion.initiative_id = props.initiativeId;
    }

    try {
      const resp = await opinionService.save(opinion);
      setIsMyOpinion(true);
      setMyOpinion(resp);
      setDataSource([resp, ...dataSource]);
      setTotal(total + 1);
      setNewOpinion('');
      successInfo('Мнение добавлено');
    } catch (error) {
      errorInfo('Ошибка сохранения мнения');
    }
  };

  const handleDeleteOpinion = async (opinionId: string) => {
    try {
      await opinionService.delete(opinionId);
      setDataSource(dataSource.filter((item) => item.id !== opinionId));
      setTotal(total - 1);
      setIsMyOpinion(false);
      setMyOpinion(null);
      successInfo('Мнение удалено');
    } catch (error) {
      errorInfo('Ошибка удаления мнения');
    }
  };

  const handleSaveOpinion = async (opinion: OpinionModel) => {
    try {
      opinion.text = editedText;
      await opinionService.save(opinion);
      setEditingOpinionId(null);
      setEditedText('');
      successInfo('Мнение обновлено');
      fetchOpinions();
    } catch (error) {
      errorInfo('Ошибка обновления мнения');
    }
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    setLoading(true);
  };

  const handleToggleAIMode = () => {
    setIsAIMode(true);
  };

  const handleAIComplete = (generatedOpinion: string) => {
    setNewOpinion(generatedOpinion);
    setIsAIMode(false);
  };

  const handleAICancel = () => {
    setIsAIMode(false);
  };

  return (
    <div className="comments-section">
      {contextHolder}

      <div className="header-section">
        <div className="header-top">
          <h3>
            Мнения <Badge count={total} />
          </h3>
          <Button
            type="primary"
            icon={<RobotOutlined style={{ color: 'white' }} />}
            onClick={() => setSummaryModalVisible(true)}
            className="ai-button-primary"
          >
            ИИ суммирование мнений
          </Button>
        </div>

        {isMyOpinion && (
          <div className="filter-section">
            <Checkbox
              checked={searchMyOpinion}
              onChange={handleSearchMyOpinion}
              disabled={searchLoading}
            >
              Показать только моё мнение
            </Checkbox>
            {searchLoading && <Spin size="small" />}
          </div>
        )}
      </div>

      {!isMyOpinion && (
        <div className={`add-comment-section ${isAIMode ? 'ai-mode' : ''}`}>
          {isAIMode ? (
            <AIOpinionAssistant
              onComplete={handleAIComplete}
              onCancel={handleAICancel}
            />
          ) : (
            <>
              <div className="input-mode-toggle">
                <div className="mode-info">
                  Поделитесь своим мнением
                </div>
                <Button
                  type="default"
                  icon={<BulbOutlined />}
                  onClick={handleToggleAIMode}
                  className="ai-mode-button"
                >
                  ИИ-режим
                </Button>
              </div>
              <TextArea
                rows={4}
                value={newOpinion}
                onChange={(e) => setNewOpinion(e.target.value)}
                placeholder="Обязательно оставьте своё аргументированное мнение, это поможет сообществу принять наилучшее решение из возможных..."
              />
              <Button type="primary" onClick={handleAddComment}>
                Отправить
              </Button>
            </>
          )}
        </div>
      )}

      {searchMyOpinion && !myOpinion && !searchLoading && (
        <div className="notice">Вы ещё не оставляли мнение</div>
      )}

      <List
        dataSource={filteredDataSource}
        loading={loading}
        locale={{ emptyText: 'Нет мнений' }}
        renderItem={(opinion) => (
          <List.Item
            className={
              opinion.creator?.id === authData.user?.id ? 'user-comment' : ''
            }
            actions={
              opinion.creator?.id === authData.user?.id &&
              editingOpinionId !== opinion.id
                ? [
                  <EditOutlined
                    key="edit"
                    onClick={() => {
                      setEditingOpinionId(opinion.id);
                      setEditedText(opinion.text || '');
                    }}
                  />,
                  <DeleteOutlined
                    key="delete"
                    onClick={() => handleDeleteOpinion(opinion.id)}
                    className="delete-icon"
                  />,
                ]
                : []
            }
          >
            {editingOpinionId === opinion.id ? (
              <div className="edit-section">
                <TextArea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                />
                <div className="edit-actions">
                  <Button
                    type="primary"
                    onClick={() => handleSaveOpinion(opinion)}
                  >
                    Сохранить
                  </Button>
                  <Button onClick={() => setEditingOpinionId(null)}>
                    Отменить
                  </Button>
                </div>
              </div>
            ) : (
              <List.Item.Meta
                title={opinion.creator?.fullname}
                description={opinion.text}
              />
            )}
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
          showTotal={(total, range) => `${range[0]}-${range[1]} из ${total}`}
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
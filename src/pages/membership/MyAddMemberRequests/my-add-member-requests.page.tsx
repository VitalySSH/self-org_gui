import {
  Button,
  Input,
  InputRef,
  Space,
  Table,
  TableColumnsType,
  TableColumnType,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { TableMyMemberRequest } from 'src/interfaces';
import { RequestMemberAoService } from 'src/services';
import { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import {
  MemberRequestDisputeButton,
  MemberRequestJoinButton,
  MemberRequestRemoveButton,
} from 'src/components';
import {
  CommunityMemberCode,
  OnConsiderationCode,
  MemberExcludedCode,
  RequestSuccessfulCode,
  RequestDeniedCode,
} from 'src/consts';

type DataIndex = keyof TableMyMemberRequest;

export function MyAddMemberRequests() {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([] as TableMyMemberRequest[]);
  const [searchedColumn, setSearchedColumn] = useState('');
  const [searchText, setSearchText] = useState('');

  const requestMemberAoService = new RequestMemberAoService();

  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<TableMyMemberRequest> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Найти
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Сбросить
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Отфильтровать
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Закрыть
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const renderAction = (row: TableMyMemberRequest) => {
    switch (row.statusCode) {
      case OnConsiderationCode:
        return (
          <MemberRequestRemoveButton tableRow={row} setLoading={setLoading} />
        );
      case RequestDeniedCode:
        return (
          <MemberRequestRemoveButton tableRow={row} setLoading={setLoading} />
        );
      case RequestSuccessfulCode:
        return (
          <>
            <MemberRequestJoinButton tableRow={row} setLoading={setLoading} />
            <div
              style={{
                marginTop: 10,
              }}
            >
              <MemberRequestRemoveButton
                tableRow={row}
                setLoading={setLoading}
              />
            </div>
          </>
        );
      case CommunityMemberCode:
        return (
          <MemberRequestRemoveButton tableRow={row} setLoading={setLoading} />
        );
      case MemberExcludedCode:
        return (
          <>
            <MemberRequestDisputeButton
              tableRow={row}
              setLoading={setLoading}
            />
            <div
              style={{
                marginTop: 10,
              }}
            >
              <MemberRequestRemoveButton
                tableRow={row}
                setLoading={setLoading}
              />
            </div>
          </>
        );
    }
  };

  const columns: TableColumnsType<TableMyMemberRequest> = [
    {
      title: 'Наименование сообщества',
      dataIndex: 'communityName',
      key: 'communityName',
      ...getColumnSearchProps('communityName'),
    },
    // {
    //   title: 'Описание сообщества',
    //   dataIndex: 'communityDescription',
    //   key: 'communityDescription',
    //   ...getColumnSearchProps('communityDescription'),
    // },
    {
      title: 'Сопроводительное письмо',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      ...getColumnSearchProps('status'),
    },
    // {
    //   title: 'Решение',
    //   dataIndex: 'solution',
    //   key: 'solution',
    //   ...getColumnSearchProps('solution'),
    // },
    {
      title: 'Дата создания',
      dataIndex: 'created',
      key: 'created',
      ...getColumnSearchProps('created'),
    },
    {
      title: 'Действие',
      dataIndex: '',
      key: 'action',
      render: (item: TableMyMemberRequest) => {
        return renderAction(item);
      },
    },
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadData = () => {
    if (loading) {
      requestMemberAoService
        .myList()
        .then((resp) => {
          setDataSource(resp.data);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData, loading]);

  return (
    <div className="table-container">
      <div className="table-header">Мои заявки на вступление в сообщества</div>
      <Table
        columns={columns}
        loading={loading}
        dataSource={dataSource}
        pagination={false}
        expandable={{
          rowExpandable: (record) =>
            record.children && record.children.length > 0,
          expandIcon: ({ expanded, onExpand, record }) => {
            if (!record.children || record.children.length === 0) {
              return null;
            }
            return (
              <span onClick={(e) => onExpand(record, e)}>
                {expanded ? (
                  <MinusOutlined style={{ marginRight: 6 }} />
                ) : (
                  <PlusOutlined style={{ marginRight: 6 }} />
                )}
              </span>
            );
          },
        }}
        locale={{ emptyText: 'Заявки не найдены' }}
        style={{
          marginRight: 20,
          marginLeft: 20,
          marginBottom: 20,
        }}
      />
    </div>
  );
}

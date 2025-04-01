import {
  Button,
  Input,
  InputRef,
  Layout,
  Space,
  Table,
  TableColumnsType,
  TableColumnType,
} from 'antd';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthContextProvider, TableMemberRequest } from 'src/interfaces';
import { CrudDataSourceService } from 'src/services';
import { RequestMemberModel } from 'src/models';
import { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { useAuth } from 'src/hooks';
import { useNavigate } from 'react-router-dom';
import { MemberRequestVotesButton } from 'src/components';

type DataIndex = keyof TableMemberRequest;

export function CommonAddMemberRequests(props: any) {
  const navigate = useNavigate();
  const authData: AuthContextProvider = useAuth();
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([] as TableMemberRequest[]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const communityId = props?.communityId;

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
  ): TableColumnType<TableMemberRequest> => ({
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

  const columns: TableColumnsType<TableMemberRequest> = [
    {
      title: 'Кандидат на членство',
      dataIndex: 'member',
      key: 'member',
      ...getColumnSearchProps('member'),
    },
    {
      title: 'Сопроводительное письмо',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Решение',
      dataIndex: 'decision',
      key: 'status',
      ...getColumnSearchProps('decision'),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      ...getColumnSearchProps('status'),
    },
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
      render: (item: TableMemberRequest) => {
        return <MemberRequestVotesButton key={item.key} tableRow={item} />;
      },
    },
  ];

  const loadData = useCallback(() => {
    if (loading && communityId) {
      const memberRequestService = new CrudDataSourceService(
        RequestMemberModel
      );
      memberRequestService
        .list(
          [
            {
              field: 'community_id',
              op: 'equals',
              val: communityId,
            },
            {
              field: 'parent_id',
              op: 'null',
              val: true,
            },
          ],
          undefined,
          undefined,
          ['status', 'member']
        )
        .then((resp) => {
          const items: TableMemberRequest[] = [];
          resp.data.forEach((requestMember) => {
            const isMyRequest = requestMember.member?.id === authData.user?.id;
            const item = {
              key: requestMember.id || '',
              member: requestMember.member?.fullname || '',
              reason: requestMember.reason || '',
              status: requestMember.status?.name || '',
              created: moment(requestMember.created).format('DD.MM.yyyy HH:mm'),
              isMyRequest: isMyRequest,
              vote: requestMember.vote,
              decision:
                requestMember.vote === true
                  ? 'Одобрена'
                  : requestMember.vote === false
                    ? 'Отклонена'
                    : 'Нет',
            };
            items.push(item);
          });
          setDataSource(items);
        })
        .catch(() => {
          navigate('/no-much-page');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [authData.user?.id, communityId, loading, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Layout style={{ height: '100%', overflowY: 'auto' }}>
      <Table
        columns={columns}
        loading={loading}
        dataSource={dataSource}
        locale={{ emptyText: 'Заявки не найдены' }}
      />
    </Layout>
  );
}

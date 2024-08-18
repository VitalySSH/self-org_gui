import {
    Button,
    Input, InputRef,
    Layout,
    Space,
    Table,
    TableColumnsType,
    TableColumnType
} from "antd";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { AuthContextProvider, TableMemberRequest } from "../../../interfaces";
import { CrudDataSourceService } from "../../../services";
import { CommunityModel } from "../../../models";
import { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { useAuth } from "../../../hooks";

type DataIndex = keyof TableMemberRequest;

export function CommonAddMemberRequests(props: any) {

    const authData: AuthContextProvider = useAuth();
    const [loading, setLoading] =
        useState(true);
    const [dataSource, setDataSource] =
        useState([] as TableMemberRequest[]);
    const [searchText, setSearchText] =
        useState('');
    const [searchedColumn, setSearchedColumn] =
        useState('');

    const communityId = props?.communityId;
    const communityService =
        new CrudDataSourceService(CommunityModel);

    const searchInput = useRef<InputRef>(null);

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps['confirm'],
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps =
        (dataIndex: DataIndex): TableColumnType<TableMemberRequest> => ({
        filterDropdown: (
            { setSelectedKeys, selectedKeys,
              confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
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
            title: 'Кандидат на члентсво',
            dataIndex: 'member',
            key: 'member',
            width: '30%',
            ...getColumnSearchProps('member'),
        },
        {
            title: 'Сопроводительное письмо',
            dataIndex: 'reason',
            key: 'reason',
            width: '20%',
            ...getColumnSearchProps('reason'),
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            ...getColumnSearchProps('status'),
            width: '20%',
        },
        {
            title: 'Дата создания',
            dataIndex: 'created',
            key: 'created',
            ...getColumnSearchProps('created'),
            width: '20%',
        },
    ];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData = () => {
        if (loading && communityId) {
            communityService
                .get(communityId,
                    [
                        'main_settings.adding_members.member',
                        'main_settings.adding_members.status',
                    ])
                .then(community => {
                    const items: TableMemberRequest[] = [];
                    (community.main_settings?.adding_members || [])
                        .forEach(requestMember => {
                            const isMyRequest =
                                requestMember.member?.id === authData.user?.id;
                            const memberName =
                                `${requestMember.member?.firstname} ${requestMember.member?.surname}`;
                            const item = {
                                key: requestMember.id || '',
                                member: memberName,
                                reason: requestMember.reason || '',
                                status: requestMember.status?.name || '',
                                created: moment(requestMember.created)
                                    .format('DD.MM.yyyy HH:mm:ss'),
                                isMyRequest: isMyRequest,
                            };
                            items.push(item);
                        });
                    setDataSource(items);
                }).catch((error) => {
                console.log(error);
            }).finally(() => {
                setLoading(false);
            });
        }
    }

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <Layout
            style={{height: '100%', overflowY: "scroll"}}
        >
            <Table
                columns={columns}
                loading={loading}
                dataSource={dataSource}
                locale={{emptyText: "Заявки не найдены"}}
            />
        </Layout>
    );
}

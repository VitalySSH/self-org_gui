import {
    Button,
    Input,
    InputRef,
    Space,
    Table,
    TableColumnsType,
    TableColumnType,
} from "antd";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { AuthContextProvider, TableMemberRequest } from "src/interfaces";
import { CrudDataSourceService } from "src/services";
import { UserCommunitySettingsModel } from "src/models";
import { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from 'react-highlight-words';
import {
    SearchOutlined,
} from '@ant-design/icons';
import { useAuth } from "src/hooks";
import { MemberRequestVoteButton } from "src/components";
import { useNavigate } from "react-router-dom";

type DataIndex = keyof TableMemberRequest;

export function AddMemberRequestsForMe(props: any) {

    const navigate = useNavigate();
    const authData: AuthContextProvider = useAuth();
    const currentUserId = authData.user?.id;
    const [loading, setLoading] =
        useState(true);
    const [dataSource, setDataSource] =
        useState([] as TableMemberRequest[]);
    const [searchText, setSearchText] =
        useState('');
    const [searchedColumn, setSearchedColumn] =
        useState('');

    const communityId = props?.communityId;
    const userCommunitySettingsService =
        new CrudDataSourceService(UserCommunitySettingsModel);

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
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
            title: 'Участник сообщества',
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
        {
            title: 'Действие',
            dataIndex: '',
            key: 'action',
            render: (item: TableMemberRequest) => {
                return (
                    <MemberRequestVoteButton key={item.key} tableRow={item} />
                );
            },
        },
    ];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData = () => {
        if (loading && communityId) {
            userCommunitySettingsService.list(
                [
                    {
                        field: 'community_id',
                        op: 'equals',
                        val: communityId,
                    },
                    {
                        field: 'user_id',
                        op: 'equals',
                        val: currentUserId,
                    },
                ],
                undefined, undefined,
                [
                    'adding_members.status',
                    'adding_members.member',
                ]
            ).then(settingsList => {
                const settings =
                    settingsList.length ? settingsList[0] : undefined;
                const items: TableMemberRequest[] = [];
                if (!settings) navigate('/no-much-page');
                (settings?.adding_members || [])
                    .forEach(requestMember => {
                        const isMyRequest =
                            requestMember.member?.id === currentUserId;
                        const memberName =
                            `${requestMember.member?.firstname} 
                            ${requestMember.member?.surname}`;
                        const item = {
                            key: requestMember.id || '',
                            member: memberName,
                            reason: requestMember.reason || '',
                            status: requestMember.status?.name || '',
                            created: moment(requestMember.created)
                                .format('DD.MM.yyyy HH:mm:ss'),
                            isMyRequest: isMyRequest,
                            vote: requestMember.vote,
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
    }, [loadData, loading]);

    return (
        <Table
            columns={columns}
            loading={loading}
            dataSource={dataSource}
            locale={{emptyText: "Заявки не найдены"}}
        />
    );
}

import {
    Button,
    Input,
    InputRef,
    Layout,
    Space,
    Table,
    TableColumnsType,
    TableColumnType,
    Typography,
} from "antd";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import {
    AuthContextProvider,
    TableMyMemberRequest
} from "../../../interfaces";
import { CrudDataSourceService } from "../../../services";
import { RequestMemberModel } from "../../../models";
import { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from 'react-highlight-words';
import {
    SearchOutlined,
} from '@ant-design/icons';
import { useAuth } from "../../../hooks";
import {
    MemberRequestDisputeButton,
    MemberRequestJoinButton,
    MemberRequestRemoveButton,
} from "../../../components";
import {
    CommunityMemberCode,
    OnConsiderationCode,
    MemberExcludedCode,
    RequestSuccessfulCode,
    RequestDeniedCode
} from "../../../consts";

type DataIndex = keyof TableMyMemberRequest;

export function MyAddMemberRequests() {

    const authData: AuthContextProvider = useAuth();
    const currentUserId = authData.user?.id;
    const [loading, setLoading] =
        useState(true);
    const [dataSource, setDataSource] =
        useState([] as TableMyMemberRequest[]);
    const [searchText, setSearchText] =
        useState('');
    const [searchedColumn, setSearchedColumn] =
        useState('');

    const requestMemberService =
        new CrudDataSourceService(RequestMemberModel);

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
        (dataIndex: DataIndex): TableColumnType<TableMyMemberRequest> => ({
        filterDropdown: (
            { setSelectedKeys, selectedKeys,
              confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
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

    const renderAction = (row: TableMyMemberRequest) => {
        switch (row.statusCode) {
            case OnConsiderationCode:
                return (
                    <MemberRequestRemoveButton
                        tableRow={row}
                        setLoading={setLoading}
                    />
                );
            case RequestDeniedCode:
                return (
                    <MemberRequestRemoveButton
                        tableRow={row}
                        setLoading={setLoading}
                    />
                );
            case RequestSuccessfulCode:
                return (
                    <>
                        <MemberRequestJoinButton
                            tableRow={row}
                            setLoading={setLoading}
                        />
                        <div
                            style={{
                                marginTop: 10
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
                    <MemberRequestRemoveButton
                        tableRow={row}
                        setLoading={setLoading}
                    />
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
                                marginTop: 10
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

    }

    const columns: TableColumnsType<TableMyMemberRequest> = [
        {
            title: 'Наименование сообщества',
            dataIndex: 'communityName',
            key: 'communityName',
            width: '20%',
            ...getColumnSearchProps('communityName'),
        },
        {
            title: 'Описание сообщества',
            dataIndex: 'communityDescription',
            key: 'communityDescription',
            width: '20%',
            ...getColumnSearchProps('communityDescription'),
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
            title: 'Решение',
            dataIndex: 'solution',
            key: 'solution',
            ...getColumnSearchProps('solution'),
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
            render: (item: TableMyMemberRequest) => {
                return renderAction(item);
            },
        },
    ];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData = () => {
        if (loading) {
            requestMemberService.list(
                [
                    {
                        field: 'parent_id',
                        op: 'null',
                        val: true,
                    },
                    {
                        field: 'member_id',
                        op: 'equals',
                        val: currentUserId,
                    },
                ],
                undefined, undefined,
                [
                    'status',
                    'community.main_settings.name',
                    'community.main_settings.description',
                ]
            ).then(memberRequests => {
                const items: TableMyMemberRequest[] = [];
                memberRequests.forEach(requestMember => {
                    const communityName =
                        requestMember.community?.main_settings?.name?.name;
                    const communityDescription =
                        requestMember.community?.main_settings?.description?.value;
                    const solution = requestMember.vote ? 'Да' : 'Нет';
                    const item: TableMyMemberRequest = {
                        key: requestMember.id || '',
                        communityName: communityName || '',
                        communityDescription: communityDescription || '',
                        communityId: requestMember.community?.id || '',
                        reason: requestMember.reason || '',
                        status: requestMember.status?.name || '',
                        statusCode: requestMember.status?.code || '',
                        created: moment(requestMember.created)
                            .format('DD.MM.yyyy HH:mm:ss'),
                        solution: solution,
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
        <Layout
            style={{height: '100%', overflowY: "scroll" }}
        >
            <Space
                direction="vertical"
                className="communities"
            >
                <Typography.Title
                    level={3}
                >
                    Мои заявки на вступление в сообщества
                </Typography.Title>
            </Space>
            <Table
                columns={columns}
                loading={loading}
                dataSource={dataSource}
                locale={{emptyText: "Заявки не найдены"}}
                style={{
                    marginRight: 20,
                    marginLeft: 20,
                    marginBottom: 20
                }}
            />
        </Layout>
    );
}

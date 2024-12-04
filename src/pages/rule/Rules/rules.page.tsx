import { Button, Card, Flex, Layout, List, Space, Typography } from "antd";
import { RuleCardInterface } from "src/interfaces";
import Meta from "antd/es/card/Meta";
import { useEffect, useState } from "react";
import { CrudDataSourceService } from "src/services";
import { RuleModel } from "src/models";
import { FilterOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export function Rules(props: any) {

    const navigate = useNavigate();

    const [loading, setLoading] =
        useState(true);
    const [dataSource, setDataSource] =
        useState([] as RuleCardInterface[]);


    const ruleService =
        new CrudDataSourceService(RuleModel);

    const addNewRule = () => {
        navigate('new');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData = () => {
        if (loading) {
            ruleService
                .list([
                        {
                            field: 'community_id',
                            op: 'equals',
                            val: props.communityId,
                        }
                    ], undefined, undefined,
                    ['creator', 'status', 'category'])
                .then(resp => {
                    const rules: RuleCardInterface[] = [];
                    resp.forEach(rule => {
                        const ruleItem = {
                            id: rule.id,
                            title: rule.title,
                            creator: `${rule.creator?.firstname} ` +
                                rule.creator?.surname,
                            status: rule.status?.name,
                            category: rule.category?.name,
                        };
                        rules.push(ruleItem);
                    });
                    setDataSource(rules);
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
            style={{ height: '100%', overflowY: "auto" }}
        >
            <Space
                style={{
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    alignContent: "center",
                    marginLeft: '30%',
                    marginRight: '30%',
                }}
            >
                <Typography.Title
                    level={3}
                    style={{ minWidth: 120 }}
                >
                    Правила сообщества
                </Typography.Title>
                <Flex>
                    <Button
                        type="text"
                        onClick={addNewRule}
                    >
                        <PlusCircleOutlined style={{ fontSize: 20 }}/>
                        Новое правило
                    </Button>
                    <Button
                        type="text"
                        style={{ marginLeft: 10 }}
                    >
                        <FilterOutlined style={{ fontSize: 20 }} />
                        Фильтры
                    </Button>
                </Flex>
            </Space>

            <List
                itemLayout="vertical"
                dataSource={dataSource}
                loading={loading}
                locale={{emptyText: "Ещё нет ни одного правила"}}
                pagination={ dataSource.length >= 20 ? {
                    position: 'bottom',
                    align: 'end'
                } : false }
                size="large"
                renderItem={(item: RuleCardInterface) => (
                    <List.Item>
                        <Card>
                            <Meta
                                title={item.title}
                            />
                            <div style={{marginTop: 10}}>
                                Автор: {item.creator}
                            </div>
                            <div style={{marginTop: 10}}>
                                Категория: {item.category}
                            </div>
                            <div style={{marginTop: 10}}>
                                Статус: {item.status}
                            </div>
                        </Card>
                    </List.Item>
                )}
            />

        </Layout>
    );
}


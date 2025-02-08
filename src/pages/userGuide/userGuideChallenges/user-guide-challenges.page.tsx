import { Collapse, Typography, Tag, Steps, Row, Col } from 'antd';
import {
    BulbOutlined,
    MergeCellsOutlined,
    ClusterOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;
const {
    Title,
    Text,
    Paragraph
} = Typography;
const { Step } = Steps;

export function UserGuideChallenges() {
    return (
        <div className="content-container">
            <Title level={3} style={{ textAlign: 'center', marginBottom: 40 }}>
                Вызовы через коллективный интеллект
            </Title>

            <Collapse accordion ghost expandIconPosition="end">
                <Panel
                    header={
                        <Title level={4}>
                            <ClusterOutlined /> Динамическая кластеризация идей
                        </Title>
                    }
                    key="1"
                >
                    <Paragraph>
                        <Tag color="geekblue">NLP-анализ</Tag>
                        <Tag color="purple">Автоматическая группировка</Tag>
                    </Paragraph>

                    <Text strong>Как работает:</Text>
                    <ul>
                        <li>Идеи автоматически группируются по 20+ смысловым категориям</li>
                        <li>Сохранение редких идей в отдельных кластерах</li>
                        <li>Реалтайм-обновление категорий при новых данных</li>
                    </ul>

                    <Text type="secondary">Пример: 10M идей → 15 ключевых тем</Text>
                </Panel>

                <Panel
                    header={
                        <Title level={4}>
                            <MergeCellsOutlined /> Peer-Driven валидация
                        </Title>
                    }
                    key="2"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Title level={5}>Механизмы оценки:</Title>
                            <Tag color="green">Кросс-рейтинг</Tag>
                            <Tag color="cyan">Совместный фильтр</Tag>
                            <ul>
                                <li>Оценка идей из других кластеров</li>
                                <li>Метки: "новаторски", "рискованно", "реалистично"</li>
                            </ul>
                        </Col>
                        <Col span={12}>
                            <Title level={5}>Статистика:</Title>
                            <div style={{ background: '#f6ffed', padding: 16, borderRadius: 8 }}>
                                <Text>87% участников оценили ≥5 чужих идей</Text>
                                <br />
                                <Text>Средний рейтинг новизны: ★★★★☆</Text>
                            </div>
                        </Col>
                    </Row>
                </Panel>

                <Panel
                    header={
                        <Title level={4}>
                            <BulbOutlined /> Эволюция идей
                        </Title>
                    }
                    key="3"
                >
                    <Steps direction="vertical" current={2}>
                        <Step
                            title="Идея-основа"
                            description="CRISPR-терапия для редактирования генов"
                        />
                        <Step
                            title="Гибридная версия"
                            description="Нанороботы с CRISPR-капсулами (+120 комбинаций)"
                        />
                        <Step
                            title="Финализированное решение"
                            description="ИИ-платформа для персонализированной генной терапии"
                            status="process"
                        />
                    </Steps>
                </Panel>
            </Collapse>

            <div style={{ marginTop: 40, padding: 24, background: '#f0f5ff' }}>
                <Title level={4}>Система ролей сообщества</Title>
                <Row gutter={16}>
                    <Col span={8}>
                        <Tag color="gold">Синтезатор</Tag>
                        <Text>Объединил 10+ идей</Text>
                    </Col>
                    <Col span={8}>
                        <Tag color="lime">Мост</Tag>
                        <Text>Оценил 50+ чужих предложений</Text>
                    </Col>
                    <Col span={8}>
                        <Tag color="magenta">Пионер</Tag>
                        <Text>Создал 3+ гибридных решения</Text>
                    </Col>
                </Row>
            </div>

            <div style={{ marginTop: 40 }}>
                <Title level={4}>Пример: задача "Победить старение"</Title>
                <Steps direction="vertical" current={3}>
                    <Step title="Сбор" description="5M идей от участников" />
                    <Step title="Кластеризация" description="15 ключевых тем" />
                    <Step title="Валидация" description="200+ кросс-оценок" />
                    <Step title="Синтез" description="3 гибридных решения" />
                </Steps>
            </div>
        </div>
    );
}
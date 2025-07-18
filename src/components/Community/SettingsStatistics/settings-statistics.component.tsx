import { Card, List, Progress, Space, Empty } from 'antd';
import { BarChartOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { SettingsStatisticsInterface } from 'src/interfaces';

interface SettingsStatisticsProps {
  data?: SettingsStatisticsInterface[];
  loading?: boolean;
}

export function SettingsStatistics({ data, loading = false }: SettingsStatisticsProps) {
  // Функция для определения цвета прогресс-бара
  const getProgressColor = (percent: number, index: number) => {
    const colors = ['#52c41a', '#1890ff', '#722ed1', '#eb2f96', '#fa8c16'];
    if (percent > 50) return '#52c41a'; // Зеленый для большинства
    if (percent >= 25) return '#1890ff'; // Синий для значительной части
    if (percent >= 10) return '#fa8c16'; // Оранжевый для меньшинства
    return colors[index % colors.length]; // Циклично для остальных
  };

  // Функция для определения иконки
  const getIcon = (percent: number) => {
    if (percent >= 50) return <TrophyOutlined style={{ color: '#52c41a' }} />;
    if (percent >= 25) return <BarChartOutlined style={{ color: '#1890ff' }} />;
    return <UserOutlined style={{ color: '#666' }} />;
  };

  // Сортируем данные по проценту (по убыванию)
  const sortedData = data?.slice().sort((a, b) => b.percent - a.percent) || [];

  if (!data || data.length === 0) {
    return (
      <div className="settings-statistics-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Нет данных для отображения"
          style={{ padding: '20px 0' }}
        />
      </div>
    );
  }

  return (
    <div className="settings-statistics">
      <List
        loading={loading}
        itemLayout="vertical"
        dataSource={sortedData}
        size="small"
        split={false}
        renderItem={(item: SettingsStatisticsInterface, index: number) => {
          const progressColor = getProgressColor(item.percent, index);
          const icon = getIcon(item.percent);

          return (
            <List.Item style={{ padding: '8px 0', border: 'none' }}>
              <Card
                size="small"
                className="statistics-card"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: '4px'
                }}
                styles={{ body: { padding: '12px 16px' } }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {/* Заголовок с иконкой и процентом */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <Space size="small">
                      {icon}
                      <span style={{
                        fontWeight: 500,
                        fontSize: '13px',
                        color: '#333',
                        lineHeight: 1.4
                      }}>
                        {item.name}
                      </span>
                    </Space>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: progressColor,
                      minWidth: '40px',
                      textAlign: 'right'
                    }}>
                      {item.percent}%
                    </span>
                  </div>

                  {/* Прогресс-бар */}
                  <Progress
                    percent={item.percent}
                    showInfo={false}
                    strokeColor={progressColor}
                    trailColor="#f5f5f5"
                    size="small"
                    strokeWidth={6}
                    style={{ margin: 0 }}
                  />

                  {/* Дополнительная информация */}
                  <div style={{
                    fontSize: '11px',
                    color: '#666',
                    marginTop: '4px'
                  }}>
                    Голосов: {item.percent}%
                  </div>
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />

      {/* Итоговая статистика */}
      {sortedData.length > 1 && (
        <div className="statistics-summary" style={{
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(24, 144, 255, 0.05)',
          borderRadius: '6px',
          border: '1px solid rgba(24, 144, 255, 0.1)'
        }}>
          <Space size="middle">
            <span style={{ fontSize: '12px', color: '#666' }}>
              Всего вариантов: <strong style={{ color: '#333' }}>{sortedData.length}</strong>
            </span>
            <span style={{ fontSize: '12px', color: '#666' }}>
              Лидер: <strong style={{ color: '#52c41a' }}>{sortedData[0]?.name}</strong>
            </span>
          </Space>
        </div>
      )}
    </div>
  );
}
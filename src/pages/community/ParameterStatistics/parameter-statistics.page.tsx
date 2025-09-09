import { useCallback, useEffect, useState } from 'react';
import { Collapse, CollapseProps, Card, Spin, Typography, Space } from 'antd';
import {
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  TagsOutlined,
  UserOutlined,
  GroupOutlined,
  EyeInvisibleOutlined,
  UserSwitchOutlined,
  BulbOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { CommunityAOService } from 'src/services';
import { SettingsInPercentInterface } from 'src/interfaces';
import { SettingsStatistics } from 'src/components';
import {
  CategoriesLabel,
  IsCanOfferLabel,
  IsMinorityNotParticipateLabel,
  IsSecretBallotLabel,
  IsWorkGroupLabel,
  ResponsibilitiesLabel,
  SubCommunitiesLabel,
} from 'src/consts';

const { Title } = Typography;

interface ParameterStatisticsProps {
  communityId: string;
}

export function ParameterStatistics({ communityId }: ParameterStatisticsProps) {
  const [loading, setLoading] = useState(true);
  const [parameters, setParameters] = useState<SettingsInPercentInterface>(
    {} as SettingsInPercentInterface
  );

  const loadData = useCallback(async () => {
    if (!loading) return;

    try {
      const communityService = new CommunityAOService();
      const resp = await communityService.settingsInPercent(communityId);
      setParameters(resp);
    } catch (error) {
      console.error('Error loading parameter statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [communityId, loading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Функция для получения иконки секции
  const getSectionIcon = (key: string) => {
    const iconStyle = { fontSize: '16px', marginRight: '8px' };

    switch (key) {
      case '1':
        return <FileTextOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
      case '2':
        return <FileTextOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
      case '3':
        return <TeamOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
      case '4':
        return <TagsOutlined style={{ ...iconStyle, color: '#eb2f96' }} />;
      case '5':
        return <UserOutlined style={{ ...iconStyle, color: '#fa8c16' }} />;
      case '6':
        return <GroupOutlined style={{ ...iconStyle, color: '#13c2c2' }} />;
      case '7':
        return (
          <EyeInvisibleOutlined style={{ ...iconStyle, color: '#f5222d' }} />
        );
      case '8':
        return (
          <UserSwitchOutlined style={{ ...iconStyle, color: '#a0d911' }} />
        );
      case '9':
        return <BulbOutlined style={{ ...iconStyle, color: '#fadb14' }} />;
      default:
        return <SettingOutlined style={{ ...iconStyle, color: '#666' }} />;
    }
  };

  // Функция для получения количества элементов в секции
  const getSectionCount = (data: any[]) => {
    return data?.length || 0;
  };

  // Функция для создания заголовка секции с дополнительной информацией
  const createSectionLabel = (key: string, label: string, data: any[]) => {
    const count = getSectionCount(data);
    const hasData = count > 0;

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Space size="small">
          {getSectionIcon(key)}
          <span
            style={{
              fontWeight: 500,
              fontSize: '14px',
              color: hasData ? '#333' : '#999',
            }}
          >
            {label}
          </span>
        </Space>
        <span
          style={{
            fontSize: '12px',
            color: '#666',
            background: hasData
              ? 'rgba(24, 144, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)',
            padding: '2px 8px',
            borderRadius: '10px',
            minWidth: '24px',
            textAlign: 'center',
          }}
        >
          {count}
        </span>
      </div>
    );
  };

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: createSectionLabel(
        '1',
        'Наименования сообщества',
        parameters.names
      ),
      children: (
        <SettingsStatistics data={parameters.names} loading={loading} />
      ),
    },
    {
      key: '2',
      label: createSectionLabel(
        '2',
        'Описания сообщества',
        parameters.descriptions
      ),
      children: (
        <SettingsStatistics data={parameters.descriptions} loading={loading} />
      ),
    },
    {
      key: '3',
      label: createSectionLabel(
        '3',
        SubCommunitiesLabel,
        parameters.sub_communities
      ),
      children: (
        <SettingsStatistics
          data={parameters.sub_communities}
          loading={loading}
        />
      ),
    },
    {
      key: '4',
      label: createSectionLabel('4', CategoriesLabel, parameters.categories),
      children: (
        <SettingsStatistics data={parameters.categories} loading={loading} />
      ),
    },
    {
      key: '5',
      label: createSectionLabel(
        '5',
        ResponsibilitiesLabel,
        parameters.responsibilities
      ),
      children: (
        <SettingsStatistics
          data={parameters.responsibilities}
          loading={loading}
        />
      ),
    },
    {
      key: '6',
      label: createSectionLabel('6', IsWorkGroupLabel, parameters.workgroup),
      children: (
        <SettingsStatistics data={parameters.workgroup} loading={loading} />
      ),
    },
    {
      key: '7',
      label: createSectionLabel(
        '7',
        IsSecretBallotLabel,
        parameters.secret_ballot
      ),
      children: (
        <SettingsStatistics data={parameters.secret_ballot} loading={loading} />
      ),
    },
    {
      key: '8',
      label: createSectionLabel(
        '8',
        IsMinorityNotParticipateLabel,
        parameters.minority_not_participate
      ),
      children: (
        <SettingsStatistics
          data={parameters.minority_not_participate}
          loading={loading}
        />
      ),
    },
    {
      key: '9',
      label: createSectionLabel('9', IsCanOfferLabel, parameters.can_offer),
      children: (
        <SettingsStatistics data={parameters.can_offer} loading={loading} />
      ),
    },
  ];

  if (loading) {
    return (
      <Card
        className="parameter-statistics-loading"
        style={{
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            gap: '16px',
          }}
        >
          <Spin size="large" />
          <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
            Загрузка статистики параметров...
          </Typography.Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="parameter-statistics">
      {/* Заголовок */}
      <Card
        className="statistics-header"
        style={{
          marginBottom: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(24, 144, 255, 0.2)',
          background:
            'linear-gradient(135deg, rgba(24, 144, 255, 0.02) 0%, rgba(24, 144, 255, 0.01) 100%)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Space size="middle">
          <BarChartOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <div>
            <Title level={5} style={{ margin: 0, color: '#333' }}>
              Статистика параметров сообщества
            </Title>
            <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
              Распределение голосов по различным настройкам
            </Typography.Text>
          </div>
        </Space>
      </Card>

      {/* Основная статистика */}
      <Card
        className="statistics-content"
        style={{
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        styles={{ body: { padding: '20px' } }}
      >
        <Collapse
          accordion
          items={items}
          className="statistics-collapse"
          size="small"
          expandIconPosition="end"
          style={{
            background: 'transparent',
            border: 'none',
          }}
        />
      </Card>
    </div>
  );
}

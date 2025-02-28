import { useCallback, useEffect, useState } from 'react';
import { CommunityAOService } from 'src/services';
import { SettingsInPercentInterface } from 'src/interfaces';
import { Collapse, CollapseProps } from 'antd';
import { SettingsStatistics } from 'src/components';
import { IsMinorityNotParticipateLabel } from 'src/consts';

export function ParameterStatistics(props: any) {
  const [loading, setLoading] = useState(true);
  const [parameters, setParameters] = useState(
    {} as SettingsInPercentInterface
  );

  const communityId = props?.communityId;

  const loadData = useCallback(() => {
    if (loading) {
      const communityService = new CommunityAOService();
      communityService
        .settingsInPercent(communityId)
        .then((resp) => {
          setParameters(resp);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [communityId, loading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: 'Названия',
      children: <SettingsStatistics data={parameters.names} />,
    },
    {
      key: '2',
      label: 'Описания',
      children: <SettingsStatistics data={parameters.descriptions} />,
    },
    {
      key: '3',
      label: 'Внутренние сообщества',
      children: <SettingsStatistics data={parameters.sub_communities} />,
    },
    {
      key: '4',
      label: 'Категории',
      children: <SettingsStatistics data={parameters.categories} />,
    },
    {
      key: '5',
      label: 'Тайное голосование?',
      children: <SettingsStatistics data={parameters.secret_ballot} />,
    },
    {
      key: '6',
      label: IsMinorityNotParticipateLabel,
      children: (
        <SettingsStatistics data={parameters.minority_not_participate} />
      ),
    },
    {
      key: '7',
      label: 'Оказываем услуги другим сообществам?',
      children: <SettingsStatistics data={parameters.can_offer} />,
    },
  ];

  return <Collapse accordion items={items} />;
}

import { useCallback, useEffect, useState } from 'react';
import { CommunityAOService } from 'src/services';
import { SettingsInPercentInterface } from 'src/interfaces';
import { Collapse, CollapseProps } from 'antd';
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
      label: 'Наименования сообщества',
      children: <SettingsStatistics data={parameters.names} />,
    },
    {
      key: '2',
      label: 'Описания сообщества',
      children: <SettingsStatistics data={parameters.descriptions} />,
    },
    {
      key: '3',
      label: SubCommunitiesLabel,
      children: <SettingsStatistics data={parameters.sub_communities} />,
    },
    {
      key: '4',
      label: CategoriesLabel,
      children: <SettingsStatistics data={parameters.categories} />,
    },
    {
      key: '5',
      label: ResponsibilitiesLabel,
      children: <SettingsStatistics data={parameters.responsibilities} />,
    },
    {
      key: '6',
      label: IsWorkGroupLabel,
      children: <SettingsStatistics data={parameters.workgroup} />,
    },
    {
      key: '7',
      label: IsSecretBallotLabel,
      children: <SettingsStatistics data={parameters.secret_ballot} />,
    },
    {
      key: '8',
      label: IsMinorityNotParticipateLabel,
      children: (
        <SettingsStatistics data={parameters.minority_not_participate} />
      ),
    },
    {
      key: '9',
      label: IsCanOfferLabel,
      children: <SettingsStatistics data={parameters.can_offer} />,
    },
  ];

  return <Collapse accordion items={items} />;
}

import { useEffect, useState } from "react";
import { CommunityAOService } from "../../../services";
import { SettingsInPercenInterface } from "../../../interfaces";
import { Collapse, CollapseProps } from "antd";
import { SettingsStatistics } from "../../../components";
import {IsMinorityNotParticipateLabel} from "../../../consts";


export function ParameterStatistics(props: any) {

    const [loading, setLoading] =
        useState(true);
    const [parameters, setParameters] =
        useState({} as SettingsInPercenInterface);

    const communityId = props?.communityId;
    const communityService = new CommunityAOService();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData = () => {
        if (loading) {
            communityService.settingsInPercen(communityId)
                .then(resp => {
                    setParameters(resp.data);
                }).finally(() => {
                setLoading(false);
            });
        }
    }

    useEffect(() => {
        loadData();
    }, [loadData, loading, communityId]);

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
            label: 'Категории',
            children: <SettingsStatistics data={parameters.categories} />,
        },
        {
            key: '4',
            label: 'Тайное голосование?',
            children: <SettingsStatistics data={parameters.secret_ballot} />,
        },
        {
            key: '5',
            label: IsMinorityNotParticipateLabel,
            children: <SettingsStatistics data={
                parameters.minority_not_participate} />,
        },
        {
            key: '6',
            label: 'Оказываем услуги другим сообществам?',
            children: <SettingsStatistics data={parameters.can_offer} />,
        },
    ];

    return (
        <Collapse accordion items={items} />
    );
}
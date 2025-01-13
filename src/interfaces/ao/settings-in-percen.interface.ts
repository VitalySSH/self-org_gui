import {
    SettingsStatisticsInterface
} from "src/interfaces";

export interface SettingsInPercentInterface {
    names: SettingsStatisticsInterface[];
    descriptions: SettingsStatisticsInterface[];
    secret_ballot: SettingsStatisticsInterface[];
    minority_not_participate: SettingsStatisticsInterface[];
    can_offer: SettingsStatisticsInterface[];
    categories: SettingsStatisticsInterface[];
    sub_communities: SettingsStatisticsInterface[];
}
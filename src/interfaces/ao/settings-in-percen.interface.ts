import {
    SettingsStatisticsInterface
} from "./settings-statistics.interface.ts";

export interface SettingsInPercenInterface {
    names: SettingsStatisticsInterface[];
    descriptions: SettingsStatisticsInterface[];
    secret_ballot: SettingsStatisticsInterface[];
    minority_not_participate: SettingsStatisticsInterface[];
    can_offer: SettingsStatisticsInterface[];
    categories: SettingsStatisticsInterface[];
}
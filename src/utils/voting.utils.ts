import { VotingOptionData } from "src/interfaces";

export function convertVotingOptions(
  data: { [key: string]: VotingOptionData }
): string[] {
    /** Преобразовать варианты для голосования для отображения на форме. */
    // const optionsData: { [key: string]: VotingOptionData } = JSON.parse(data);
    const sortedData: VotingOptionData[] =
      Object.values(data).sort(
        (a, b) => a.number - b.number
      );
    return sortedData.map(
      (it) => `${it.value} (${it.percent}%)`
    );
}
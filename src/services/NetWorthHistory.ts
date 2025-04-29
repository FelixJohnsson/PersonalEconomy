import { Asset, Liability } from "../types";

export interface NetWorthHistoryPoint {
  date: string;
  netWorth: number;
  assets: number;
  liabilities: number;
}

/**
 * Service for calculating historical net worth data from asset history
 */
export class NetWorthHistoryService {
  /**
   * Calculate net worth history from assets and liabilities
   */
  static getNetWorthHistory(
    assets: Asset[],
    liabilities: Liability[]
  ): NetWorthHistoryPoint[] {
    // Step 1: Collect all unique dates from asset historical values
    const datesSet = new Set<string>();

    assets.forEach((asset) => {
      asset.historicalValues?.forEach((historyPoint) => {
        datesSet.add(historyPoint.date);
      });
    });

    const uniqueDates = Array.from(datesSet).sort();

    // Step 2: Calculate total assets value for each date
    const netWorthHistory: NetWorthHistoryPoint[] = [];

    uniqueDates.forEach((date) => {
      let totalAssetsValueOnDate = 0;

      // Sum asset values for this date
      assets.forEach((asset) => {
        // Find the most recent value for this asset on or before the current date
        const assetValuesBeforeDate = asset.historicalValues
          ?.filter((historyPoint) => historyPoint.date <= date)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        if (assetValuesBeforeDate && assetValuesBeforeDate.length > 0) {
          totalAssetsValueOnDate += assetValuesBeforeDate[0].value;
        }
      });

      // For liabilities, we don't have historical data, so use current values
      const totalLiabilities = liabilities.reduce(
        (sum, liability) => sum + liability.amount,
        0
      );

      netWorthHistory.push({
        date,
        assets: totalAssetsValueOnDate,
        liabilities: totalLiabilities,
        netWorth: totalAssetsValueOnDate - totalLiabilities,
      });
    });

    // Step 3: Sort by date
    return netWorthHistory.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * Get the historical asset value on a specific date
   */
  private static getAssetValueOnDate(asset: Asset, targetDate: string): number {
    // Sort historical values by date in descending order
    const sortedValues = [...(asset.historicalValues ?? [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Find the first value on or before the target date
    const valueOnDate = sortedValues.find(
      (historyPoint) => historyPoint.date <= targetDate
    );

    return valueOnDate ? valueOnDate.value : 0;
  }

  /**
   * Calculate the current net worth
   */
  static getCurrentNetWorth(assets: Asset[], liabilities: Liability[]): number {
    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = liabilities.reduce(
      (sum, liability) => sum + liability.amount,
      0
    );

    return totalAssets - totalLiabilities;
  }
}

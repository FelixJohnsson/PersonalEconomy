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

  /**
   * Get net worth history or generate approximation if needed
   */
  static getOrGenerateHistory(
    assets: Asset[],
    liabilities: Liability[]
  ): NetWorthHistoryPoint[] {
    // Get actual history from asset historical values
    let history = this.getNetWorthHistory(assets, liabilities);

    // If we have enough history points, return them
    if (history.length > 1) return history;

    // Otherwise, generate some synthetic data
    const currentNetWorth = this.getCurrentNetWorth(assets, liabilities);
    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = liabilities.reduce(
      (sum, liability) => sum + liability.amount,
      0
    );

    // Generate monthly data for the past 6 months with slight variations
    const generatedHistory: NetWorthHistoryPoint[] = [];
    const today = new Date();

    // Use a seed based on asset and liability values for consistent pseudo-random generation
    const randomSeed =
      currentNetWorth * 0.001 + assets.length + liabilities.length;

    for (let i = 5; i >= 0; i--) {
      const pastDate = new Date(today);
      pastDate.setMonth(today.getMonth() - i);

      // Create a pseudo-random multiplier that increases over time for realistic growth
      const progressFactor = (6 - i) / 6; // 0.16 to 1.0
      const randomVariation = Math.sin(i * randomSeed) * 0.03; // Small variations

      // Calculate asset and liability approximations
      const pastAssetMultiplier = 0.9 + progressFactor * 0.2 + randomVariation;
      const pastLiabilitiesMultiplier =
        1.0 + (1 - progressFactor) * 0.1 + randomVariation * 0.5;

      const pastAssets = totalAssets * pastAssetMultiplier;
      const pastLiabilities = totalLiabilities * pastLiabilitiesMultiplier;

      generatedHistory.push({
        date: pastDate.toISOString().split("T")[0],
        netWorth: pastAssets - pastLiabilities,
        assets: pastAssets,
        liabilities: pastLiabilities,
      });
    }

    // Add current data
    if (generatedHistory.length > 0) {
      generatedHistory.push({
        date: today.toISOString().split("T")[0],
        netWorth: currentNetWorth,
        assets: totalAssets,
        liabilities: totalLiabilities,
      });
    }

    return generatedHistory.length > 0 ? generatedHistory : history;
  }
}

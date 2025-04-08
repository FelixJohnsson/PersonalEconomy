import { useState, useMemo, useCallback, useEffect } from "react";
import { apiRequest } from "../services/api";
import { Asset, AssetFormData } from "../types";
import { useAuth } from "../context/AuthContext";

// Define sort options
export type SortField = "name" | "value" | "type";
export type SortDirection = "asc" | "desc";

export const useAssets = () => {
  const { isAuthenticated } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assetToUpdate, setAssetToUpdate] = useState<string | null>(null);
  const [assetToDeposit, setAssetToDeposit] = useState<string | null>(null);
  const [assetToUpdateGoal, setAssetToUpdateGoal] = useState<string | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Fetch assets from API
  useEffect(() => {
    const fetchAssets = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await apiRequest("/api/user-data/assets", "GET");
        setAssets(data || []);
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError("Failed to load assets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [isAuthenticated]);

  // CRUD operations for assets
  const addAsset = async (asset: AssetFormData) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const newAsset = await apiRequest("/api/user-data/assets", "POST", asset);
      setAssets([...assets, newAsset]);
      return newAsset;
    } catch (err) {
      console.error("Error adding asset:", err);
      setError("Failed to add asset");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAsset = async (asset: Asset) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const updatedAsset = await apiRequest(
        `/api/user-data/assets/${asset._id}`,
        "PUT",
        asset
      );

      setAssets(assets.map((a) => (a._id === asset._id ? updatedAsset : a)));

      return updatedAsset;
    } catch (err) {
      console.error("Error updating asset:", err);
      setError("Failed to update asset");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAssetFromApi = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await apiRequest(`/api/user-data/assets/${id}`, "DELETE");
      setAssets(assets.filter((asset) => asset._id !== id));
    } catch (err) {
      console.error("Error deleting asset:", err);
      setError("Failed to delete asset");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update asset value
  const updateAssetValue = async (assetId: string, newValue: number) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const date = new Date().toISOString().split("T")[0];
      await apiRequest(`/api/user-data/assets/${assetId}/value`, "PUT", {
        value: newValue,
        date,
      });

      setAssets(
        assets.map((asset) => {
          if (asset._id === assetId) {
            const historicalValues = asset.historicalValues || [];
            const newHistoricalValues = [
              ...historicalValues,
              { date, value: newValue, isDeposit: false },
            ];

            return {
              ...asset,
              value: newValue,
              historicalValues: newHistoricalValues,
            };
          }
          return asset;
        })
      );
    } catch (err) {
      console.error("Error updating asset value:", err);
      setError("Failed to update asset value");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add deposit to asset
  const addAssetDeposit = async (assetId: string, depositAmount: number) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const date = new Date().toISOString().split("T")[0];
      await apiRequest(`/api/user-data/assets/${assetId}/deposit`, "POST", {
        amount: depositAmount,
        date,
      });

      setAssets(
        assets.map((asset) => {
          if (asset._id === assetId) {
            const deposits = asset.deposits || [];
            const newDeposits = [...deposits, { date, amount: depositAmount }];
            const newValue = asset.value + depositAmount;
            const historicalValues = asset.historicalValues || [];
            const newHistoricalValues = [
              ...historicalValues,
              {
                date,
                value: newValue,
                isDeposit: true,
              },
            ];

            return {
              ...asset,
              value: newValue,
              deposits: newDeposits,
              totalDeposits: (asset.totalDeposits || 0) + depositAmount,
              historicalValues: newHistoricalValues,
            };
          }
          return asset;
        })
      );
    } catch (err) {
      console.error("Error adding asset deposit:", err);
      setError("Failed to add deposit");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all unique asset types
  const getAllTypes = useCallback(() => {
    const typesSet = new Set<string>();

    assets.forEach((asset) => {
      if (asset.type) {
        typesSet.add(asset.type);
      }
    });

    return Array.from(typesSet);
  }, [assets]);

  // Get selected asset
  const selectedAsset = useMemo(() => {
    return assets.find((asset) => asset._id === selectedId);
  }, [assets, selectedId]);

  // Get asset for updating value
  const assetForValueUpdate = useMemo(() => {
    return assets.find((asset) => asset._id === assetToUpdate);
  }, [assets, assetToUpdate]);

  // Get asset for deposit
  const assetForDeposit = useMemo(() => {
    return assets.find((asset) => asset._id === assetToDeposit);
  }, [assets, assetToDeposit]);

  // Get asset for updating goal
  const assetForGoalUpdate = useMemo(() => {
    return assets.find((asset) => asset._id === assetToUpdateGoal);
  }, [assets, assetToUpdateGoal]);

  // Get all unique types
  const types = useMemo(() => {
    return getAllTypes();
  }, [getAllTypes]);

  // Filter assets by selected type
  const filteredAssets = useMemo(() => {
    if (selectedType === "all") {
      return assets;
    }
    return assets.filter((asset) => asset.type === selectedType);
  }, [assets, selectedType]);

  // Sort assets
  const sortedAssets = useMemo(() => {
    const assetsCopy = [...filteredAssets];

    // Define sorting functions
    const compareStrings = (a: string, b: string) => a.localeCompare(b);
    const compareNumbers = (a: number, b: number) => a - b;

    // Sort based on selected field
    assetsCopy.sort((a, b) => {
      let result = 0;

      switch (sortField) {
        case "name":
          result = compareStrings(a.name, b.name);
          break;
        case "value":
          result = compareNumbers(a.value, b.value);
          break;
        case "type":
          result = compareStrings(a.type, b.type);
          break;
        default:
          // First sort by type, then by name as a fallback
          result = compareStrings(a.type, b.type);
          if (result === 0) {
            result = compareStrings(a.name, b.name);
          }
      }

      // Apply sort direction
      return sortDirection === "asc" ? result : -result;
    });

    return assetsCopy;
  }, [filteredAssets, sortField, sortDirection]);

  // Handle asset deletion with confirmation
  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm("Are you sure you want to delete this asset?")) {
        deleteAssetFromApi(id);
        if (selectedId === id) {
          setSelectedId(null);
        }
        if (assetToUpdate === id) {
          setAssetToUpdate(null);
        }
        if (assetToDeposit === id) {
          setAssetToDeposit(null);
        }
        if (assetToUpdateGoal === id) {
          setAssetToUpdateGoal(null);
        }
      }
    },
    [selectedId, assetToUpdate, assetToDeposit, assetToUpdateGoal]
  );

  // Handle sort change
  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        // Toggle direction if clicking the same field
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        // Set new field and default to ascending
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  // Calculate value change percentage (excluding deposits)
  const getValueChange = useCallback((asset: Asset) => {
    if (!asset.historicalValues || asset.historicalValues.length < 2)
      return null;

    const lastValue =
      asset.historicalValues[asset.historicalValues.length - 1].value;
    const previousValue =
      asset.historicalValues[asset.historicalValues.length - 2].value;
    const lastEntry = asset.historicalValues[asset.historicalValues.length - 1];

    // If the last change was a deposit, don't show it as a value change
    if (lastEntry.isDeposit) {
      return null;
    }

    return ((lastValue - previousValue) / previousValue) * 100;
  }, []);

  // Get a color based on asset type
  const getTypeColor = useCallback((type: string): string => {
    // Simple color hash function
    let hash = 0;
    for (let i = 0; i < type.length; i++) {
      hash = type.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex color
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();

    return "#" + "00000".substring(0, 6 - c.length) + c;
  }, []);

  return {
    // Data
    assets,
    filteredAssets,
    sortedAssets,
    types,
    selectedAsset,
    assetForValueUpdate,
    assetForDeposit,
    assetForGoalUpdate,
    isLoading,
    error,

    // State setters
    setSelectedId,
    setSelectedType,
    setSortField,
    setSortDirection,
    setAssetToUpdate,
    setAssetToDeposit,
    setAssetToUpdateGoal,

    // Current state
    selectedId,
    selectedType,
    sortField,
    sortDirection,
    assetToUpdate,
    assetToDeposit,
    assetToUpdateGoal,

    // Actions
    addAsset,
    updateAsset,
    deleteAsset: handleDelete,
    handleSort,
    getAllTypes,
    updateAssetValue,
    addAssetDeposit,

    // Utility functions
    getTypeColor,
    getValueChange,
  };
};

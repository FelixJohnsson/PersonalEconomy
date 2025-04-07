import React, { useState, useRef } from "react";
import { useAppContext } from "../../context/AppContext";

const DataImportExport: React.FC = () => {
  const { exportData, importData } = useAppContext();
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    // Generate the data
    const jsonData = exportData();

    // Create a blob with the data
    const blob = new Blob([jsonData], { type: "application/json" });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a download link
    const a = document.createElement("a");
    a.href = url;

    // Set the filename with current date
    const date = new Date().toISOString().split("T")[0];
    a.download = `economy-tracker-backup-${date}.json`;

    // Trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImportStatus({
        success: false,
        message: "No file selected",
      });
      return;
    }

    // Check if it's a JSON file
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setImportStatus({
        success: false,
        message: "Please select a JSON file",
      });
      return;
    }

    // Read the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = importData(jsonData);

        if (success) {
          setImportStatus({
            success: true,
            message: "Data imported successfully!",
          });
        } else {
          setImportStatus({
            success: false,
            message: "Failed to import data. Invalid format.",
          });
        }
      } catch (error) {
        setImportStatus({
          success: false,
          message: `Error reading file: ${error}`,
        });
      }
    };

    reader.onerror = () => {
      setImportStatus({
        success: false,
        message: "Error reading file",
      });
    };

    reader.readAsText(file);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Data Import & Export</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Export Data</h3>
          <p className="text-gray-600 mb-3">
            Save all your financial data to a file for backup or transfer to
            another device.
          </p>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Export Data
          </button>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-2">Import Data</h3>
          <p className="text-gray-600 mb-3">
            Load financial data from a previously exported file. This will
            replace your current data.
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleImportClick}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Import Data
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />

            {importStatus && (
              <div
                className={`mt-3 p-3 rounded-md ${
                  importStatus.success
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {importStatus.message}
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-gray-500">
            <strong>Note:</strong> Importing data will replace all your current
            data. Make sure to export a backup first if you want to keep your
            current data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataImportExport;

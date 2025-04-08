import React, { useState } from "react";
import {
  importLocalStorageToMongoDB,
  testMongoDBConnection,
} from "../utils/dbImport";
import { useAuth } from "../context/AuthContext";

const DatabaseTools: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testMongoDBConnection();
      setTestResult(result);
    } catch (error) {
      console.error("Error testing connection:", error);
      setTestResult({ success: false, message: "Connection test failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    if (!isAuthenticated) {
      setImportResult({
        success: false,
        message: "You must be logged in to import data",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await importLocalStorageToMongoDB();
      setImportResult(result);
    } catch (error) {
      console.error("Error importing data:", error);
      setImportResult({ success: false, message: "Import failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Database Tools</h2>

      {!isAuthenticated && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
          You need to be logged in to import data to MongoDB.
        </div>
      )}

      <div className="space-y-4">
        {/* Test Connection */}
        <div>
          <button
            onClick={handleTestConnection}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test MongoDB Connection"}
          </button>

          {testResult && (
            <div
              className={`mt-2 p-3 rounded ${
                testResult.success ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Import Data */}
        <div>
          <button
            onClick={handleImportData}
            disabled={isLoading || !isAuthenticated}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading
              ? "Importing..."
              : "Import Data from localStorage to MongoDB"}
          </button>

          {importResult && (
            <div
              className={`mt-2 p-3 rounded ${
                importResult.success ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(importResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseTools;

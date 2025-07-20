import { useState } from 'react';
import { migrationScript } from '../../utils/migrationScript.js';
import Button from '../ui/Button.jsx';

export const DataMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationStatus(null);

    try {
      const result = await migrationScript.executeMigration();
      setMigrationStatus(result);
    } catch (error) {
      setMigrationStatus({
        success: false,
        error: error.message
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleLogData = () => {
    migrationScript.logMigrationData();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Data Migration</h2>
      <p className="text-gray-600 mb-6">
        Migrate your existing JSON data to Supabase database.
      </p>

      <div className="space-y-4">
        <Button
          onClick={handleLogData}
          variant="outline"
          className="mr-4"
        >
          Log Migration Data
        </Button>

        <Button
          onClick={handleMigration}
          disabled={isMigrating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isMigrating ? 'Migrating...' : 'Start Migration'}
        </Button>
      </div>

      {migrationStatus && (
        <div className={`mt-6 p-4 rounded-lg ${
          migrationStatus.success 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <h3 className="font-semibold mb-2">
            {migrationStatus.success ? 'Migration Successful' : 'Migration Failed'}
          </h3>
          <p>{migrationStatus.message || migrationStatus.error}</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Migration Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Categories are migrated first</li>
          <li>Products are migrated with category references</li>
          <li>Product colors and images are migrated</li>
          <li>Stock levels are migrated</li>
        </ol>
      </div>
    </div>
  );
}; 
import React, { useState } from 'react';

// Define types
interface SchemaInfo {
  keyspaces: Record<string, any>;
  tables: Record<string, any>;
  types: Record<string, any>;
  indices: any[];
}

interface NoSqlBenchConfig {
  cycles: number;
  threads: number;
  consistency: string;
}

const defaultConfig: NoSqlBenchConfig = {
  cycles: 1000000,
  threads: 0, // 0 means auto
  consistency: 'ONE',
};

const App: React.FC = () => {
  // State variables
  const [schemaFile, setSchemaFile] = useState<File | null>(null);
  const [parsedSchema, setParsedSchema] = useState<SchemaInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeKeyspace, setActiveKeyspace] = useState<string>('');
  const [selectedTables, setSelectedTables] = useState<Record<string, boolean>>({});
  const [nbConfig, setNbConfig] = useState<NoSqlBenchConfig>(defaultConfig);
  const [error, setError] = useState<string | null>(null);

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSchemaFile(event.target.files[0]);
      setParsedSchema(null);
      setSelectedTables({});
    }
  };

  // Parse schema handler
  const handleParseSchema = async () => {
    if (!schemaFile) {
      setError('Please select a schema file first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('schema_file', schemaFile);

    try {
      const response = await fetch('http://localhost:8000/api/parse-schema', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data: SchemaInfo = await response.json();
      setParsedSchema(data);
      
      // Set initial active keyspace if available
      if (data.keyspaces && Object.keys(data.keyspaces).length > 0) {
        setActiveKeyspace(Object.keys(data.keyspaces)[0]);
      }
    } catch (err) {
      setError(`Failed to parse schema: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle keyspace selection
  const handleKeyspaceChange = (keyspace: string) => {
    setActiveKeyspace(keyspace);
  };

  // Handle table selection
  const handleTableSelection = (tableName: string, selected: boolean) => {
    setSelectedTables(prev => ({
      ...prev,
      [tableName]: selected,
    }));
  };

  // Handle select all tables
  const handleSelectAllTables = (selected: boolean) => {
    if (!parsedSchema) return;

    const newSelection: Record<string, boolean> = {};
    Object.keys(parsedSchema.tables).forEach(tableName => {
      if (!activeKeyspace || tableName.startsWith(`${activeKeyspace}.`)) {
        newSelection[tableName] = selected;
      }
    });

    setSelectedTables(newSelection);
  };

  // Handle config changes
  const handleConfigChange = (config: Partial<NoSqlBenchConfig>) => {
    setNbConfig(prev => ({
      ...prev,
      ...config,
    }));
  };

  // Generate YAML files
  const handleGenerateYaml = async () => {
    if (!parsedSchema) {
      setError('No schema parsed yet');
      return;
    }

    const selectedTablesList = Object.entries(selectedTables)
      .filter(([_, selected]) => selected)
      .map(([tableName]) => tableName);

    if (selectedTablesList.length === 0) {
      setError('Please select at least one table');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('schema_json', JSON.stringify(parsedSchema));
    formData.append('table_selection', JSON.stringify(selectedTablesList));
    formData.append('nb_config', JSON.stringify(nbConfig));

    try {
      const response = await fetch('http://localhost:8000/api/generate-yaml', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Create a download link for the zip file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nosqlbench_yamls.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(`Failed to generate YAML files: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate the number of selected tables
  const selectedTablesCount = Object.values(selectedTables).filter(Boolean).length;

  // Placeholder component for KeyspaceList
  const KeyspaceList = ({ keyspaces, activeKeyspace, onKeyspaceChange }) => (
    <div className="border border-gray-300 rounded">
      <div 
        className={`p-2 cursor-pointer ${activeKeyspace === '' ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'}`}
        onClick={() => onKeyspaceChange('')}
      >
        All Keyspaces
      </div>
      
      {Object.keys(keyspaces || {}).map((keyspaceName) => (
        <div 
          key={keyspaceName}
          className={`p-2 cursor-pointer ${activeKeyspace === keyspaceName ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'}`}
          onClick={() => onKeyspaceChange(keyspaceName)}
        >
          <span className="text-blue-600 mr-1">◆</span> {keyspaceName}
        </div>
      ))}
    </div>
  );

  // Placeholder component for SchemaTable
  const SchemaTable = ({ tables, activeKeyspace, selectedTables, onTableSelectionChange }) => {
    // Filter tables by active keyspace if one is selected
    const filteredTables = Object.entries(tables || {}).filter(
      ([tableName, table]) => !activeKeyspace || (table as any).keyspace === activeKeyspace
    );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyspace</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Columns</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Key</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTables.map(([tableName, tableInfo]) => {
              const info = tableInfo as any;
              const primaryKeyStr = info.primary_key 
                ? info.primary_key.map((part: string[]) => part.join(', ')).join(', ')
                : 'N/A';
              
              return (
                <tr 
                  key={tableName}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onTableSelectionChange(tableName, !selectedTables[tableName])}
                >
                  <td className="px-3 py-2">
                    <input 
                      type="checkbox" 
                      checked={!!selectedTables[tableName]}
                      onChange={(e) => onTableSelectionChange(tableName, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-3 py-2">{info.name}</td>
                  <td className="px-3 py-2">{info.keyspace || 'N/A'}</td>
                  <td className="px-3 py-2">{Object.keys(info.columns || {}).length}</td>
                  <td className="px-3 py-2">{primaryKeyStr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Placeholder component for NoSqlBenchOptions
  const NoSqlBenchOptions = ({ config, onConfigChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Cycles</label>
        <input
          type="number"
          value={config.cycles}
          onChange={(e) => onConfigChange({ cycles: parseInt(e.target.value) || 0 })}
          className="border border-gray-300 rounded p-2 w-full"
          min="1"
        />
        <span className="text-xs text-gray-500">Number of operations to run</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Threads</label>
        <input
          type="number"
          value={config.threads}
          onChange={(e) => onConfigChange({ threads: parseInt(e.target.value) || 0 })}
          className="border border-gray-300 rounded p-2 w-full"
          min="0"
        />
        <span className="text-xs text-gray-500">0 means auto (use available cores)</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Consistency Level</label>
        <select
          value={config.consistency}
          onChange={(e) => onConfigChange({ consistency: e.target.value })}
          className="border border-gray-300 rounded p-2 w-full"
        >
          <option value="ONE">ONE</option>
          <option value="LOCAL_ONE">LOCAL_ONE</option>
          <option value="QUORUM">QUORUM</option>
          <option value="LOCAL_QUORUM">LOCAL_QUORUM</option>
          <option value="EACH_QUORUM">EACH_QUORUM</option>
          <option value="ALL">ALL</option>
        </select>
        <span className="text-xs text-gray-500">Cassandra consistency level for writes</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl text-center mb-6 font-bold">
          NoSQLBench Schema Generator
        </h1>

        <div className="grid grid-cols-1 gap-6">
          {/* File Upload Section */}
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Cassandra Schema
              </h2>
              
              <div className="flex items-center mb-4">
                <label className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded cursor-pointer mr-3">
                  Select Schema File
                  <input
                    type="file"
                    accept=".cql,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </label>
                <span className="text-gray-700">
                  {schemaFile ? schemaFile.name : 'No file selected'}
                </span>
              </div>
              
              <button
                className={`py-2 px-4 rounded flex items-center ${!schemaFile || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                onClick={handleParseSchema}
                disabled={!schemaFile || loading}
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Parsing...' : 'Parse Schema'}
              </button>
            </div>
          </div>

          {/* Schema Information Section */}
          {parsedSchema && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <div className="bg-white border border-gray-200 rounded shadow p-4">
                    <h2 className="text-lg font-medium mb-3">Keyspaces</h2>
                    <KeyspaceList
                      keyspaces={parsedSchema.keyspaces}
                      activeKeyspace={activeKeyspace}
                      onKeyspaceChange={handleKeyspaceChange}
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <div className="bg-white border border-gray-200 rounded shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Tables {activeKeyspace ? `(${activeKeyspace})` : ''}
                      </h2>
                      <div className="flex items-center">
                        <label className="flex items-center mr-4">
                          <input 
                            type="checkbox"
                            className="mr-2" 
                            onChange={(e) => handleSelectAllTables(e.target.checked)}
                          />
                          Select All
                        </label>
                        <span className="text-sm text-gray-500">
                          {selectedTablesCount} tables selected
                        </span>
                      </div>
                    </div>
                    <SchemaTable
                      tables={parsedSchema.tables}
                      activeKeyspace={activeKeyspace}
                      selectedTables={selectedTables}
                      onTableSelectionChange={handleTableSelection}
                    />
                  </div>
                </div>
              </div>

              {/* NoSQLBench Options */}
              <div className="bg-white border border-gray-200 rounded shadow p-4">
                <h2 className="text-lg font-medium mb-3">NoSQLBench Configuration</h2>
                <NoSqlBenchOptions config={nbConfig} onConfigChange={handleConfigChange} />
              </div>

              {/* Generate Button */}
              <div className="flex justify-center mt-2">
                <button
                  className={`py-3 px-6 rounded-lg flex items-center text-lg ${selectedTablesCount === 0 || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                  onClick={handleGenerateYaml}
                  disabled={selectedTablesCount === 0 || loading}
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {!loading && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                  {loading ? 'Generating...' : 'Generate NoSQLBench YAML Files'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Documentation Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Upload your Cassandra CQL schema file (.cql or .txt format)</li>
          <li>Click "Parse Schema" to analyze the schema structure</li>
          <li>Select the keyspace and tables you want to generate NoSQLBench files for</li>
          <li>Configure NoSQLBench options if needed</li>
          <li>Click "Generate NoSQLBench YAML Files" to download the YAML files</li>
          <li>Use the generated files with NoSQLBench for data ingestion and testing</li>
        </ol>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md flex justify-between">
          <span>{error}</span>
          <button className="ml-4" onClick={() => setError(null)}>✕</button>
        </div>
      )}
    </div>
  );
};

export default App;
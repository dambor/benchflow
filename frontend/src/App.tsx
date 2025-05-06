import React, { useState } from 'react';
import { Box, Button, Container, CssBaseline, Grid, Paper, ThemeProvider, Typography, createTheme, CircularProgress, Checkbox, FormControlLabel, Snackbar, Alert } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import DownloadIcon from '@mui/icons-material/Download';
import { SchemaTable } from './components/SchemaTable';
import { KeyspaceList } from './components/KeyspaceList';
import { NoSqlBenchOptions } from './components/NoSqlBenchOptions';

// Define theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            NoSQLBench Schema Generator
          </Typography>

          <Grid container spacing={3}>
            {/* File Upload Section */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 1 }}>
                <Box display="flex" alignItems="center" flexDirection="column">
                  <Typography variant="h6" gutterBottom>
                    <UploadFileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Upload Cassandra Schema
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Button
                      variant="contained"
                      component="label"
                      sx={{ mr: 2 }}
                      disabled={loading}
                    >
                      Select Schema File
                      <input
                        type="file"
                        accept=".cql,.txt"
                        hidden
                        onChange={handleFileUpload}
                      />
                    </Button>
                    <Typography variant="body1">
                      {schemaFile ? schemaFile.name : 'No file selected'}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleParseSchema}
                    disabled={!schemaFile || loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CodeIcon />}
                  >
                    {loading ? 'Parsing...' : 'Parse Schema'}
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Schema Information Section */}
            {parsedSchema && (
              <>
                <Grid item xs={12} md={3}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 1, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Keyspaces
                    </Typography>
                    <KeyspaceList
                      keyspaces={parsedSchema.keyspaces}
                      activeKeyspace={activeKeyspace}
                      onKeyspaceChange={handleKeyspaceChange}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={9}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        <TableChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Tables {activeKeyspace ? `(${activeKeyspace})` : ''}
                      </Typography>
                      <Box>
                        <FormControlLabel
                          control={
                            <Checkbox
                              onChange={(e) => handleSelectAllTables(e.target.checked)}
                            />
                          }
                          label="Select All"
                        />
                        <Typography variant="body2" color="textSecondary">
                          {selectedTablesCount} tables selected
                        </Typography>
                      </Box>
                    </Box>
                    <SchemaTable
                      tables={parsedSchema.tables}
                      activeKeyspace={activeKeyspace}
                      selectedTables={selectedTables}
                      onTableSelectionChange={handleTableSelection}
                    />
                  </Paper>
                </Grid>

                {/* NoSQLBench Options */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      NoSQLBench Configuration
                    </Typography>
                    <NoSqlBenchOptions config={nbConfig} onConfigChange={handleConfigChange} />
                  </Paper>
                </Grid>

                {/* Generate Button */}
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="center">
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                      onClick={handleGenerateYaml}
                      disabled={selectedTablesCount === 0 || loading}
                      sx={{ px: 4, py: 1.5 }}
                    >
                      {loading ? 'Generating...' : 'Generate NoSQLBench YAML Files'}
                    </Button>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>

        {/* Documentation Section */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            How to Use
          </Typography>
          <Typography variant="body1" paragraph>
            1. Upload your Cassandra CQL schema file (.cql or .txt format)
          </Typography>
          <Typography variant="body1" paragraph>
            2. Click "Parse Schema" to analyze the schema structure
          </Typography>
          <Typography variant="body1" paragraph>
            3. Select the keyspace and tables you want to generate NoSQLBench files for
          </Typography>
          <Typography variant="body1" paragraph>
            4. Configure NoSQLBench options if needed
          </Typography>
          <Typography variant="body1" paragraph>
            5. Click "Generate NoSQLBench YAML Files" to download the YAML files
          </Typography>
          <Typography variant="body1" paragraph>
            6. Use the generated files with NoSQLBench for data ingestion and testing
          </Typography>
        </Paper>

        {/* Error Snackbar */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default App;
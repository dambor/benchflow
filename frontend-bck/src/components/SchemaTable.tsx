// components/SchemaTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
} from '@mui/material';

interface SchemaTableProps {
  tables: Record<string, any>;
  activeKeyspace: string;
  selectedTables: Record<string, boolean>;
  onTableSelectionChange: (tableName: string, selected: boolean) => void;
}

export const SchemaTable: React.FC<SchemaTableProps> = ({
  tables,
  activeKeyspace,
  selectedTables,
  onTableSelectionChange,
}) => {
  if (!tables || Object.keys(tables).length === 0) {
    return <Typography variant="body2">No tables found</Typography>;
  }

  // Filter tables by active keyspace if one is selected
  const filteredTables = Object.entries(tables).filter(
    ([tableName, table]) => !activeKeyspace || (table as any).keyspace === activeKeyspace
  );

  if (filteredTables.length === 0) {
    return <Typography variant="body2">No tables found in this keyspace</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
      <Table stickyHeader aria-label="schema tables">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox"></TableCell>
            <TableCell>Table Name</TableCell>
            <TableCell>Keyspace</TableCell>
            <TableCell>Columns</TableCell>
            <TableCell>Primary Key</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredTables.map(([tableName, tableInfo]) => {
            const info = tableInfo as any;
            const fullyQualifiedName = info.keyspace ? `${info.keyspace}.${info.name}` : info.name;
            const primaryKeyStr = info.primary_key 
              ? info.primary_key.map((part: string[]) => part.join(', ')).join(', ')
              : 'N/A';
            
            return (
              <TableRow 
                key={fullyQualifiedName}
                hover
                onClick={() => onTableSelectionChange(fullyQualifiedName, !selectedTables[fullyQualifiedName])}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={!!selectedTables[fullyQualifiedName]}
                    onChange={(e) => onTableSelectionChange(fullyQualifiedName, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>{info.name}</TableCell>
                <TableCell>{info.keyspace || 'N/A'}</TableCell>
                <TableCell>{Object.keys(info.columns || {}).length}</TableCell>
                <TableCell>{primaryKeyStr}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
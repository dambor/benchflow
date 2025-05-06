// components/KeyspaceList.tsx
import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import DataObjectIcon from '@mui/icons-material/DataObject';

interface KeyspaceListProps {
  keyspaces: Record<string, any>;
  activeKeyspace: string;
  onKeyspaceChange: (keyspace: string) => void;
}

export const KeyspaceList: React.FC<KeyspaceListProps> = ({
  keyspaces,
  activeKeyspace,
  onKeyspaceChange,
}) => {
  if (!keyspaces || Object.keys(keyspaces).length === 0) {
    return <Typography variant="body2">No keyspaces found</Typography>;
  }

  return (
    <List>
      <ListItem disablePadding>
        <ListItemButton
          selected={activeKeyspace === ''}
          onClick={() => onKeyspaceChange('')}
        >
          <ListItemText primary="All Keyspaces" />
        </ListItemButton>
      </ListItem>
      {Object.keys(keyspaces).map((keyspaceName) => (
        <ListItem disablePadding key={keyspaceName}>
          <ListItemButton
            selected={activeKeyspace === keyspaceName}
            onClick={() => onKeyspaceChange(keyspaceName)}
          >
            <DataObjectIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            <ListItemText primary={keyspaceName} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};
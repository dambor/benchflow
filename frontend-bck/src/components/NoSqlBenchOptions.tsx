// components/NoSqlBenchOptions.tsx
import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';

interface NoSqlBenchOptionsProps {
  config: {
    cycles: number;
    threads: number;
    consistency: string;
  };
  onConfigChange: (config: Partial<{
    cycles: number;
    threads: number;
    consistency: string;
  }>) => void;
}

export const NoSqlBenchOptions: React.FC<NoSqlBenchOptionsProps> = ({
  config,
  onConfigChange,
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <TextField
          label="Number of Cycles"
          type="number"
          fullWidth
          value={config.cycles}
          onChange={(e) => onConfigChange({ cycles: parseInt(e.target.value) || 0 })}
          helperText="Number of operations to run"
          InputProps={{ inputProps: { min: 1 } }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          label="Number of Threads"
          type="number"
          fullWidth
          value={config.threads}
          onChange={(e) => onConfigChange({ threads: parseInt(e.target.value) || 0 })}
          helperText="0 means auto (use available cores)"
          InputProps={{ inputProps: { min: 0 } }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Consistency Level</InputLabel>
          <Select
            value={config.consistency}
            label="Consistency Level"
            onChange={(e) => onConfigChange({ consistency: e.target.value })}
          >
            <MenuItem value="ONE">ONE</MenuItem>
            <MenuItem value="LOCAL_ONE">LOCAL_ONE</MenuItem>
            <MenuItem value="QUORUM">QUORUM</MenuItem>
            <MenuItem value="LOCAL_QUORUM">LOCAL_QUORUM</MenuItem>
            <MenuItem value="EACH_QUORUM">EACH_QUORUM</MenuItem>
            <MenuItem value="ALL">ALL</MenuItem>
          </Select>
          <FormHelperText>Cassandra consistency level for writes</FormHelperText>
        </FormControl>
      </Grid>
    </Grid>
  );
};
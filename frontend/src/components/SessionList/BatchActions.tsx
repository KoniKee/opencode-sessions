import { Box, Button, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

interface BatchActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClear: () => void;
  onDelete: () => void;
}

export function BatchActions({ selectedCount, totalCount, onSelectAll, onClear, onDelete }: BatchActionsProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        bgcolor: 'primary.main',
        color: 'white',
      }}
    >
      <IconButton size="small" onClick={onClear} sx={{ color: 'white' }}>
        <CloseIcon fontSize="small" />
      </IconButton>
      
      <Typography variant="body2" sx={{ flex: 1 }}>
        已选择 {selectedCount} 个会话
      </Typography>
      
      {selectedCount < totalCount && (
        <Button
          size="small"
          variant="text"
          onClick={onSelectAll}
          sx={{ color: 'white', minWidth: 'auto' }}
        >
          全选 ({totalCount})
        </Button>
      )}
      
      <Tooltip title="删除选中">
        <IconButton
          size="small"
          onClick={onDelete}
          sx={{ 
            color: 'white',
            bgcolor: 'error.main',
            '&:hover': { bgcolor: 'error.dark' }
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

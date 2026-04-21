import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert } from '@mui/material';

interface DeleteConfirmDialogProps {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({ open, count, onClose, onConfirm, isLoading }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>确认删除</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          此操作不可撤销
        </Alert>
        <Typography>
          确定要删除选中的 <strong>{count}</strong> 个会话吗？
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            删除的会话将无法恢复，相关的消息和差异文件也会被删除。
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>取消</Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          disabled={isLoading}
        >
          {isLoading ? '删除中...' : `删除 ${count} 个会话`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

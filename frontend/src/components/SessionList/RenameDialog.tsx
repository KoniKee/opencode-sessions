import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useState, useEffect } from 'react';

interface RenameDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (newTitle: string) => void;
  isLoading?: boolean;
}

export function RenameDialog({ open, title, onClose, onConfirm, isLoading }: RenameDialogProps) {
  const [newTitle, setNewTitle] = useState(title);

  useEffect(() => {
    setNewTitle(title);
  }, [title]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>重命名会话</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="输入新标题"
          size="small"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>取消</Button>
        <Button 
          onClick={() => onConfirm(newTitle)} 
          variant="contained" 
          disabled={isLoading || !newTitle.trim() || newTitle === title}
        >
          {isLoading ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

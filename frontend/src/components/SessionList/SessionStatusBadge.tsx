import { Chip, keyframes } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArchiveIcon from '@mui/icons-material/Archive';
import { SessionStatus } from '../../types';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

interface StatusConfig {
  icon: React.ReactNode;
  label: string;
  color: 'success' | 'warning' | 'default';
  sx?: object;
}

const statusConfigs: Record<string, StatusConfig> = {
  [SessionStatus.RUNNING]: {
    icon: <BoltIcon sx={{ fontSize: 16 }} />,
    label: '运行中',
    color: 'success',
    sx: {
      animation: `${pulse} 2s ease-in-out infinite`,
    },
  },
  [SessionStatus.IDLE]: {
    icon: <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />,
    label: '空闲',
    color: 'warning',
  },
  [SessionStatus.COMPLETED]: {
    icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
    label: '已完成',
    color: 'default',
  },
  [SessionStatus.ARCHIVED]: {
    icon: <ArchiveIcon sx={{ fontSize: 16 }} />,
    label: '已归档',
    color: 'default',
  },
};

interface SessionStatusBadgeProps {
  status: SessionStatus;
}

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  const config = statusConfigs[status] || statusConfigs[SessionStatus.COMPLETED];

  return (
    <Chip
      icon={config.icon as React.ReactElement}
      label={config.label}
      color={config.color}
      size="small"
      sx={{
        fontWeight: 500,
        ...config.sx,
      }}
    />
  );
}

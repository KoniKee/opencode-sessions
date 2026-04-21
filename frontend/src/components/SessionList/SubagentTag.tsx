import { Chip, Tooltip } from '@mui/material';

const subagentConfig: Record<string, { color: string; label: string; icon?: string }> = {
  backend: { color: '#3b82f6', label: 'Backend', icon: '🔧' },
  'backend-architect': { color: '#3b82f6', label: 'Backend', icon: '🔧' },
  frontend: { color: '#ec4899', label: 'Frontend', icon: '🎨' },
  'frontend-developer': { color: '#ec4899', label: 'Frontend', icon: '🎨' },
  explore: { color: '#a855f7', label: 'Explore', icon: '🔍' },
  general: { color: '#06b6d4', label: 'General', icon: '⚡' },
  code: { color: '#f59e0b', label: 'Code', icon: '💻' },
  'code-reviewer': { color: '#f59e0b', label: 'Code Review', icon: '👀' },
  python: { color: '#3776ab', label: 'Python', icon: '🐍' },
  'python-pro': { color: '#3776ab', label: 'Python', icon: '🐍' },
  typescript: { color: '#3178c6', label: 'TypeScript', icon: '📘' },
  'typescript-pro': { color: '#3178c6', label: 'TypeScript', icon: '📘' },
  golang: { color: '#00add8', label: 'Golang', icon: '🐹' },
  'golang-pro': { color: '#00add8', label: 'Golang', icon: '🐹' },
  java: { color: '#ed8b00', label: 'Java', icon: '☕' },
  'java-pro': { color: '#ed8b00', label: 'Java', icon: '☕' },
  javascript: { color: '#f7df1e', label: 'JavaScript', icon: '🟨' },
  'javascript-pro': { color: '#f7df1e', label: 'JavaScript', icon: '🟨' },
  sql: { color: '#cc2927', label: 'SQL', icon: '🗃️' },
  'sql-pro': { color: '#cc2927', label: 'SQL', icon: '🗃️' },
  debugger: { color: '#ef4444', label: 'Debugger', icon: '🐛' },
  'error-detective': { color: '#ef4444', label: 'Error Detective', icon: '🔎' },
  architect: { color: '#8b5cf6', label: 'Architect', icon: '🏗️' },
  'docs-architect': { color: '#8b5cf6', label: 'Docs', icon: '📚' },
  test: { color: '#10b981', label: 'Test', icon: '🧪' },
  'test-automator': { color: '#10b981', label: 'Test', icon: '🧪' },
  mobile: { color: '#14b8a6', label: 'Mobile', icon: '📱' },
  'mobile-developer': { color: '#14b8a6', label: 'Mobile', icon: '📱' },
  vue: { color: '#42b883', label: 'Vue', icon: '💚' },
  react: { color: '#61dafb', label: 'React', icon: '⚛️' },
  nextjs: { color: '#000000', label: 'Next.js', icon: '▲' },
  nodejs: { color: '#339933', label: 'Node.js', icon: '💚' },
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getSubagentConfig(type: string) {
  const lowerType = type.toLowerCase();
  if (subagentConfig[lowerType]) {
    return subagentConfig[lowerType];
  }
  
  for (const [key, config] of Object.entries(subagentConfig)) {
    if (lowerType.includes(key) || key.includes(lowerType)) {
      return config;
    }
  }
  
  return {
    color: '#6b7280',
    label: type.charAt(0).toUpperCase() + type.slice(1),
    icon: '🤖',
  };
}

interface SubagentTagProps {
  type?: string;
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

export function SubagentTag({ type, size = 'small', showIcon = true }: SubagentTagProps) {
  if (!type) return null;

  const config = getSubagentConfig(type);
  const displayLabel = showIcon && config.icon 
    ? `${config.icon} ${config.label}` 
    : config.label;

  const bgColor = hexToRgba(config.color, 0.15);
  const borderColor = hexToRgba(config.color, 0.3);

  return (
    <Tooltip title={`Subagent: @${type}`} arrow>
      <Chip
        label={displayLabel}
        size={size}
        sx={{
          bgcolor: bgColor,
          color: config.color,
          border: `1px solid ${borderColor}`,
          fontWeight: 600,
          fontSize: size === 'small' ? '0.7rem' : '0.8rem',
          height: size === 'small' ? 20 : 24,
          borderRadius: '4px',
          '& .MuiChip-label': {
            padding: size === 'small' ? '0 6px' : '0 8px',
          },
        }}
      />
    </Tooltip>
  );
}

export const SUBAGENT_TYPES = Object.keys(subagentConfig);

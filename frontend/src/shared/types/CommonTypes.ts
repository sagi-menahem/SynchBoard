import type { TOOL_LIST } from 'features/board/constants/BoardConstants';

export type Tool = (typeof TOOL_LIST)[number];

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'navigation' | 'icon';

export type EditingField = 'name';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
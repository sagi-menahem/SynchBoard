import type { TOOL_LIST } from 'constants/BoardConstants';

export type Tool = (typeof TOOL_LIST)[number];

export type ButtonVariant = 'primary' | 'secondary';

export type EditingField = 'name' | 'description';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
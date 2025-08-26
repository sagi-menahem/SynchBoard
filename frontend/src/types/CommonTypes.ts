import type { TOOL_LIST } from 'constants';

export type Tool = (typeof TOOL_LIST)[number];

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'icon';

export type EditingField = 'name' | 'description';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
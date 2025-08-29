import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';
import type { ButtonVariant } from 'shared/types/CommonTypes';

export type ToolbarItemType = 
  | 'title' 
  | 'button' 
  | 'search' 
  | 'viewToggle' 
  | 'memberActivity'
  | 'custom';


export type ViewMode = 'grid' | 'list';

export interface BaseToolbarItem {
  type: ToolbarItemType;
  key?: string;
  visible?: boolean;
  className?: string;
}

export interface TitleToolbarItem extends BaseToolbarItem {
  type: 'title';
  content: string;
  clickable?: boolean;
  onClick?: () => void;
}

export interface ButtonToolbarItem extends BaseToolbarItem {
  type: 'button';
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  primary?: boolean;
}

export interface SearchToolbarItem extends BaseToolbarItem {
  type: 'search';
  placeholder: string;
  value: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
}

export interface ViewToggleToolbarItem extends BaseToolbarItem {
  type: 'viewToggle';
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export interface MemberActivityToolbarItem extends BaseToolbarItem {
  type: 'memberActivity';
  memberCount: number;
  onlineCount: number;
  onClick?: () => void;
}

export interface CustomToolbarItem extends BaseToolbarItem {
  type: 'custom';
  content: ReactNode;
}

export type ToolbarItem = 
  | TitleToolbarItem
  | ButtonToolbarItem
  | SearchToolbarItem
  | ViewToggleToolbarItem
  | MemberActivityToolbarItem
  | CustomToolbarItem;

export type PageType = 'boards' | 'board-details' | 'settings' | 'canvas' | 'auth';

export interface ToolbarConfig {
  pageType: PageType;
  leftSection?: ToolbarItem[];
  centerSection?: ToolbarItem[];
  rightSection?: ToolbarItem[];
  className?: string;
}

export interface UniversalToolbarProps {
  config: ToolbarConfig;
  className?: string;
}
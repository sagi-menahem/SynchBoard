import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import type { ButtonVariant } from 'shared/types/CommonTypes';

/**
 * Enumeration of available toolbar item types.
 * Defines the different components that can be rendered in the toolbar.
 */
export type ToolbarItemType =
  | 'title'
  | 'button'
  | 'search'
  | 'viewToggle'
  | 'memberActivity'
  | 'custom';

/**
 * Display mode options for content presentation.
 * Controls how lists or collections are visually arranged.
 */
export type ViewMode = 'grid' | 'list';

/**
 * Base interface for all toolbar items.
 * Contains common properties shared across different toolbar item types.
 */
export interface BaseToolbarItem {
  // Type of toolbar item to render
  type: ToolbarItemType;
  // Optional unique key for React rendering
  key?: string;
  // Controls visibility of the item
  visible?: boolean;
  // Optional CSS class for custom styling
  className?: string;
}

/**
 * Toolbar item for displaying titles or headings.
 * Can optionally be clickable for editing or navigation.
 */
export interface TitleToolbarItem extends BaseToolbarItem {
  // Discriminator for title type
  type: 'title';
  // Text content to display
  content: string;
  // Whether the title is clickable
  clickable?: boolean;
  // Click handler for interactive titles
  onClick?: () => void;
}

/**
 * Toolbar item for interactive buttons.
 * Supports various styles, icons, and states for user actions.
 */
export interface ButtonToolbarItem extends BaseToolbarItem {
  // Discriminator for button type
  type: 'button';
  // Optional icon component from lucide-react
  icon?: LucideIcon;
  // Button label text
  label: string;
  // Click event handler
  onClick: () => void;
  // Visual style variant for the button
  variant?: ButtonVariant;
  // Whether the button is disabled
  disabled?: boolean;
  // Whether this is the primary action
  primary?: boolean;
}

/**
 * Toolbar item for search functionality.
 * Provides input field with search and clear capabilities.
 */
export interface SearchToolbarItem extends BaseToolbarItem {
  // Discriminator for search type
  type: 'search';
  // Placeholder text for empty search field
  placeholder: string;
  // Current search query value
  value: string;
  // Handler for search query changes
  onSearch: (query: string) => void;
  // Optional handler for clearing search
  onClear?: () => void;
}

/**
 * Toolbar item for toggling between view modes.
 * Allows switching between grid and list display layouts.
 */
export interface ViewToggleToolbarItem extends BaseToolbarItem {
  // Discriminator for view toggle type
  type: 'viewToggle';
  // Current view mode selection
  value: ViewMode;
  // Handler for view mode changes
  onChange: (mode: ViewMode) => void;
}

/**
 * Toolbar item for displaying member activity status.
 * Shows total members and online presence for collaboration awareness.
 */
export interface MemberActivityToolbarItem extends BaseToolbarItem {
  // Discriminator for member activity type
  type: 'memberActivity';
  // Total number of board members
  memberCount: number;
  // Number of currently online members
  onlineCount: number;
  // Optional click handler for detailed view
  onClick?: () => void;
}

/**
 * Toolbar item for custom React components.
 * Allows embedding arbitrary content in the toolbar.
 */
export interface CustomToolbarItem extends BaseToolbarItem {
  // Discriminator for custom type
  type: 'custom';
  // Custom React component or JSX to render
  content: ReactNode;
}

/**
 * Union type of all possible toolbar item configurations.
 * Enables type-safe toolbar composition with various item types.
 */
export type ToolbarItem =
  | TitleToolbarItem
  | ButtonToolbarItem
  | SearchToolbarItem
  | ViewToggleToolbarItem
  | MemberActivityToolbarItem
  | CustomToolbarItem;

/**
 * Page type identifiers for toolbar configuration.
 * Determines toolbar layout and available features based on context.
 */
export type PageType = 'boards' | 'board-details' | 'settings' | 'canvas' | 'auth';

/**
 * Configuration object for building toolbar layouts.
 * Defines the structure and content of toolbars across different pages.
 */
export interface ToolbarConfig {
  // Page context for toolbar rendering
  pageType: PageType;
  // Items to display in the left section
  leftSection?: ToolbarItem[];
  // Items to display in the center section
  centerSection?: ToolbarItem[];
  // Items to display in the right section
  rightSection?: ToolbarItem[];
  // Optional CSS class for toolbar styling
  className?: string;
}

/**
 * Props for the UniversalToolbar component.
 * Provides configuration and styling options for toolbar rendering.
 */
export interface UniversalToolbarProps {
  // Complete toolbar configuration object
  config: ToolbarConfig;
  // Optional CSS class for additional styling
  className?: string;
}

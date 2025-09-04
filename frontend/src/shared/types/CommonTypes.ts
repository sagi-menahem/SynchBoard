/**
 * Common type definitions shared across the SynchBoard application.
 * Contains reusable types for UI components, drawing tools, logging, and form states.
 */

import type { TOOL_LIST } from 'features/board/constants/BoardConstants';

/**
 * Available drawing tools in the board canvas.
 * Derived from the TOOL_LIST constant to ensure type safety.
 */
export type Tool = (typeof TOOL_LIST)[number];

/**
 * Visual style variants for button components throughout the application.
 * Each variant corresponds to specific use cases and visual hierarchy.
 */
export type ButtonVariant =
  | 'primary'      // Main action buttons
  | 'secondary'    // Secondary action buttons
  | 'destructive'  // Delete/remove actions
  | 'navigation'   // Navigation elements
  | 'icon'         // Icon-only buttons
  | 'cta'          // Call-to-action buttons
  | 'warning'      // Warning/caution buttons
  | 'link';        // Text link style buttons

/**
 * Fields that can be edited inline within the application.
 * Currently supports name editing for various entities.
 */
export type EditingField = 'name';

/**
 * Logging severity levels for the application's logging system.
 * Ordered from least to most severe.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

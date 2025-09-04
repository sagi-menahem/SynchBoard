/**
 * Configuration settings for the canvas drawing area.
 * Defines the visual and dimensional properties of the collaborative canvas.
 */
export interface CanvasConfig {
  // Background color of the canvas in hex or CSS format
  backgroundColor: string;
  // Width of the canvas in pixels
  width: number;
  // Height of the canvas in pixels
  height: number;
}

/**
 * Represents a collaborative whiteboard with its metadata and settings.
 * Contains all essential information for board display and management.
 */
export interface Board {
  // Unique identifier for the board
  id: number;
  // Display name of the board
  name: string;
  // Optional description text for the board
  description: string | null;
  // URL to the board's thumbnail/preview image
  pictureUrl: string | null;
  // ISO timestamp of the last modification
  lastModifiedDate: string;
  // Whether the current user has admin privileges for this board
  isAdmin: boolean;
  // Canvas background color setting
  canvasBackgroundColor: string;
  // Canvas width in pixels
  canvasWidth: number;
  // Canvas height in pixels
  canvasHeight: number;
}

/**
 * Request payload for creating a new board.
 * Contains required and optional fields for board initialization.
 */
export interface CreateBoardRequest {
  // Required name for the new board
  name: string;
  // Optional description text
  description?: string;
  // Optional custom canvas background color
  canvasBackgroundColor?: string;
  // Optional custom canvas width
  canvasWidth?: number;
  // Optional custom canvas height
  canvasHeight?: number;
}

/**
 * Represents a board member with their profile and permissions.
 * Contains user information and role within the specific board context.
 */
export interface Member {
  // Email address serving as the member's unique identifier
  email: string;
  // Member's first name for display
  firstName: string;
  // Member's last name for display
  lastName: string;
  // URL to the member's profile picture
  profilePictureUrl: string | null;
  // Whether this member has admin privileges for the board
  isAdmin: boolean;
}

/**
 * Request payload for inviting a new member to a board.
 * Contains the email address of the user to be invited.
 */
export interface InviteMemberRequest {
  // Email address of the user to invite
  email: string;
}

/**
 * Comprehensive board information including members and full configuration.
 * Extended version of Board interface with complete member list for detailed views.
 */
export interface BoardDetails {
  // Unique identifier for the board
  id: number;
  // Display name of the board
  name: string;
  // Optional description text for the board
  description: string | null;
  // URL to the board's thumbnail/preview image
  pictureUrl: string | null;
  // List of all board members with their roles
  members: Member[];
  // Canvas background color setting
  canvasBackgroundColor: string;
  // Canvas width in pixels
  canvasWidth: number;
  // Canvas height in pixels
  canvasHeight: number;
}

/**
 * Request payload for updating canvas settings of an existing board.
 * All fields are optional to allow partial updates.
 */
export interface UpdateCanvasSettingsRequest {
  // Optional new background color for the canvas
  canvasBackgroundColor?: string;
  // Optional new width for the canvas
  canvasWidth?: number;
  // Optional new height for the canvas
  canvasHeight?: number;
}

/**
 * User preferences for canvas display and interaction.
 * Stores user-specific settings for the canvas workspace experience.
 */
export interface CanvasPreferences {
  // Ratio for split view between canvas and chat panel (0-1)
  canvasChatSplitRatio: number;
}

// File: frontend/src/types/board.types.ts

/**
 * Defines the data structure for a single board object
 * as received from the backend API.
 */
export interface Board {
  id: number;
  name: string;
  description: string | null;
  pictureUrl: string | null;
  lastModifiedDate: string; // ISO 8601 date string
  isAdmin: boolean;
}

/**
 * Defines the data structure for the request to create a new board.
 */
export interface CreateBoardRequest {
  name: string;
  description?: string; // The '?' makes the description optional
}
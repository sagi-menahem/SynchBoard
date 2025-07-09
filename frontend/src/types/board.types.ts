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
  lastModifiedDate: string;
  isAdmin: boolean;
}
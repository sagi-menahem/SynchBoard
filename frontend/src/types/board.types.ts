// File: frontend/src/types/board.types.ts
export interface Board {
  id: number;
  name: string;
  description: string | null;
  pictureUrl: string | null;
  lastModifiedDate: string;
  isAdmin: boolean;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
}
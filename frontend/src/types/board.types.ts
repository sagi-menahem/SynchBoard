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

export interface Member {
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  isAdmin: boolean;
}

export interface InviteMemberRequest {
  email: string;
}

export interface BoardDetails {
  id: number;
  name: string;
  description: string | null;
  pictureUrl: string | null;
  members: Member[];
}
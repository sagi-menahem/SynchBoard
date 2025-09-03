export interface CanvasConfig {
    backgroundColor: string;
    width: number;
    height: number;
}

export interface Board {
    id: number;
    name: string;
    description: string | null;
    pictureUrl: string | null;
    lastModifiedDate: string;
    isAdmin: boolean;
    canvasBackgroundColor: string;
    canvasWidth: number;
    canvasHeight: number;
}

export interface CreateBoardRequest {
    name: string;
    description?: string;
    canvasBackgroundColor?: string;
    canvasWidth?: number;
    canvasHeight?: number;
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
    canvasBackgroundColor: string;
    canvasWidth: number;
    canvasHeight: number;
}

export interface UpdateCanvasSettingsRequest {
    canvasBackgroundColor?: string;
    canvasWidth?: number;
    canvasHeight?: number;
}

export interface CanvasPreferences {
    canvasChatSplitRatio: number;
}

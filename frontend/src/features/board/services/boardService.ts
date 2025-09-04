import type { BoardActionResponse } from 'features/board/types/BoardObjectTypes';
import type {
  Board,
  BoardDetails,
  CreateBoardRequest,
  Member,
  UpdateCanvasSettingsRequest,
} from 'features/board/types/BoardTypes';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import { API_ENDPOINTS } from 'shared/constants';
import apiClient from 'shared/lib/apiClient';

/**
 * Fetches all boards accessible to the current user.
 * This function retrieves the complete list of boards where the user is either
 * an owner or a member, providing the foundation for board list displays and navigation.
 * 
 * @returns Promise resolving to an array of board objects with basic metadata
 * @throws {Error} When the API request fails due to network issues or authentication problems
 */
export const getBoards = async (): Promise<Board[]> => {
  const response = await apiClient.get<Board[]>(API_ENDPOINTS.BOARDS);
  return response.data;
};

/**
 * Creates a new board with the provided configuration and optional attachments.
 * This function handles both JSON and multipart form data submissions, supporting
 * board creation with metadata, member invitations, canvas settings, and optional
 * picture uploads in a single operation.
 * 
 * @param boardData - Board creation data as either a structured request object or FormData with file attachments
 * @returns Promise resolving to the newly created board object with generated ID and metadata
 * @throws {Error} When board creation fails due to validation errors, duplicate names, or server issues
 */
export const createBoard = async (boardData: CreateBoardRequest | FormData): Promise<Board> => {
  const headers = boardData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await apiClient.post<Board>(API_ENDPOINTS.BOARDS, boardData, { headers });
  return response.data;
};

/**
 * Retrieves all drawing objects and actions for a specific board.
 * This function fetches the complete history of canvas objects to reconstruct
 * the current board state, enabling proper rendering and synchronization of
 * collaborative drawings when users join or refresh the board workspace.
 * 
 * @param boardId - ID of the board whose objects to retrieve
 * @returns Promise resolving to an array of board action responses containing drawing objects
 * @throws {Error} When the board doesn't exist or the user lacks access permissions
 */
export const getBoardObjects = async (boardId: number): Promise<BoardActionResponse[]> => {
  const response = await apiClient.get<BoardActionResponse[]>(API_ENDPOINTS.BOARD_OBJECTS(boardId));
  return response.data;
};

/**
 * Fetches comprehensive details for a specific board including members and settings.
 * This function retrieves complete board information including metadata, member list
 * with roles, canvas configuration, and ownership details necessary for board
 * management interfaces and permission-based UI rendering.
 * 
 * @param boardId - ID of the board to fetch details for
 * @returns Promise resolving to board details object with complete board information
 * @throws {Error} When the board doesn't exist or user lacks access permissions
 */
export const getBoardDetails = async (boardId: number): Promise<BoardDetails> => {
  const response = await apiClient.get<BoardDetails>(API_ENDPOINTS.GET_BOARD_DETAILS(boardId));
  return response.data;
};

/**
 * Invites a new member to join a board by email address.
 * This function adds a user to the board's member list with default permissions,
 * enabling collaborative access. The invited user must have a registered account
 * in the system to be successfully added as a member.
 * 
 * @param boardId - ID of the board to invite the member to
 * @param email - Email address of the user to invite as a member
 * @returns Promise resolving to the newly added member object with their details and role
 * @throws {Error} When the user doesn't exist, is already a member, or requester lacks admin permissions
 */
export const inviteMember = async (boardId: number, email: string): Promise<Member> => {
  const response = await apiClient.post<Member>(API_ENDPOINTS.INVITE_MEMBER(boardId), { email });
  return response.data;
};

/**
 * Removes a member from a board, revoking their access permissions.
 * This function allows board administrators to remove members from the collaboration
 * space, immediately terminating their access to the board and its resources.
 * Owners cannot be removed and users cannot remove themselves via this endpoint.
 * 
 * @param boardId - ID of the board to remove the member from
 * @param memberEmail - Email address of the member to remove
 * @returns Promise that resolves when the member is successfully removed
 * @throws {Error} When attempting to remove the owner, self-removal, or lacking admin permissions
 */
export const removeMember = async (boardId: number, memberEmail: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.REMOVE_MEMBER(boardId, memberEmail));
};

/**
 * Promotes a regular member to admin status within a board.
 * This function elevates a member's permissions, granting them administrative
 * privileges including the ability to manage other members, modify board settings,
 * and perform other restricted operations within the board context.
 * 
 * @param boardId - ID of the board where the member will be promoted
 * @param memberEmail - Email address of the member to promote to admin
 * @returns Promise resolving to the updated member object with admin role
 * @throws {Error} When the member doesn't exist, is already admin, or requester lacks permissions
 */
export const promoteMember = async (boardId: number, memberEmail: string): Promise<Member> => {
  const response = await apiClient.put<Member>(API_ENDPOINTS.PROMOTE_MEMBER(boardId, memberEmail));
  return response.data;
};

/**
 * Reverts the last drawing action performed on a board.
 * This function implements undo functionality for collaborative drawing,
 * removing the most recent canvas object or action from the board state
 * and broadcasting the change to all connected users for synchronization.
 * 
 * @param boardId - ID of the board where the undo operation will be performed
 * @returns Promise resolving to the undone action response for state reconciliation
 * @throws {Error} When there are no actions to undo or the user lacks permissions
 */
export const undoLastAction = async (boardId: number): Promise<BoardActionResponse> => {
  const response = await apiClient.post<BoardActionResponse>(API_ENDPOINTS.UNDO(boardId));
  return response.data;
};

/**
 * Restores a previously undone drawing action on a board.
 * This function implements redo functionality for collaborative drawing,
 * re-applying the most recently undone canvas action and broadcasting
 * the restoration to all connected users for synchronized state updates.
 * 
 * @param boardId - ID of the board where the redo operation will be performed
 * @returns Promise resolving to the restored action response for state reconciliation
 * @throws {Error} When there are no actions to redo or the user lacks permissions
 */
export const redoLastAction = async (boardId: number): Promise<BoardActionResponse> => {
  const response = await apiClient.post<BoardActionResponse>(API_ENDPOINTS.REDO(boardId));
  return response.data;
};

/**
 * Updates the display name of an existing board.
 * This function allows administrators to modify the board's name, which affects
 * how it appears in listings, navigation, and collaborative interfaces. The change
 * is immediately visible to all board members across the application.
 * 
 * @param boardId - ID of the board to rename
 * @param name - New name for the board (must meet validation requirements)
 * @returns Promise resolving to the updated board object with the new name
 * @throws {Error} When the name is invalid, empty, or user lacks admin permissions
 */
export const updateBoardName = async (boardId: number, name: string): Promise<Board> => {
  const response = await apiClient.put<Board>(API_ENDPOINTS.UPDATE_BOARD_NAME(boardId), { name });
  return response.data;
};

/**
 * Updates the descriptive text for a board.
 * This function allows administrators to modify the board's description,
 * providing context about the board's purpose, guidelines, or content to help
 * members understand the collaborative space's intended use.
 * 
 * @param boardId - ID of the board to update
 * @param description - New description text for the board (can be empty)
 * @returns Promise resolving to the updated board object with the new description
 * @throws {Error} When the description exceeds length limits or user lacks admin permissions
 */
export const updateBoardDescription = async (
  boardId: number,
  description: string,
): Promise<Board> => {
  const response = await apiClient.put<Board>(API_ENDPOINTS.UPDATE_BOARD_DESCRIPTION(boardId), {
    description,
  });
  return response.data;
};

/**
 * Removes the current user from a board's membership.
 * This function allows users to voluntarily exit a collaborative board,
 * removing themselves from the member list and revoking their own access.
 * Board owners cannot leave their own boards through this endpoint.
 * 
 * @param boardId - ID of the board to leave
 * @returns Promise that resolves when the user successfully leaves the board
 * @throws {Error} When attempting to leave as the board owner or if the board doesn't exist
 */
export const leaveBoard = async (boardId: number): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.LEAVE_BOARD(boardId));
};

/**
 * Uploads and sets a picture/thumbnail for a board.
 * This function handles image file upload for board visualization, allowing
 * administrators to set a representative image that appears in board listings
 * and provides visual identification for the collaborative workspace.
 * 
 * @param boardId - ID of the board to upload the picture for
 * @param file - Image file to upload (must meet size and format requirements)
 * @returns Promise resolving to the updated board object with the new picture URL
 * @throws {Error} When file is too large, wrong format, or user lacks admin permissions
 */
export const uploadBoardPicture = async (boardId: number, file: File): Promise<Board> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<Board>(
    API_ENDPOINTS.UPLOAD_BOARD_PICTURE(boardId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

/**
 * Removes the picture/thumbnail from a board.
 * This function deletes the board's associated image file, reverting to
 * the default appearance in board listings. This action is permanent and
 * requires administrative privileges to execute.
 * 
 * @param boardId - ID of the board whose picture should be deleted
 * @returns Promise resolving to the updated board object without picture
 * @throws {Error} When the board has no picture or user lacks admin permissions
 */
export const deleteBoardPicture = async (boardId: number): Promise<Board> => {
  const response = await apiClient.delete<Board>(API_ENDPOINTS.DELETE_BOARD_PICTURE(boardId));
  return response.data;
};

/**
 * Retrieves the chat message history for a specific board.
 * This function fetches all previously sent messages in the board's chat,
 * enabling message history restoration when users join or refresh the
 * collaborative workspace, maintaining conversation continuity.
 * 
 * @param boardId - ID of the board whose chat messages to retrieve
 * @returns Promise resolving to an array of chat messages with sender information and timestamps
 * @throws {Error} When the board doesn't exist or user lacks access permissions
 */
export const getBoardMessages = async (boardId: number): Promise<ChatMessageResponse[]> => {
  const response = await apiClient.get<ChatMessageResponse[]>(
    API_ENDPOINTS.GET_BOARD_MESSAGES(boardId),
  );
  return response.data;
};

/**
 * Updates the canvas configuration settings for a board.
 * This function allows administrators to modify canvas properties including
 * dimensions and background color, affecting the drawing workspace appearance
 * and constraints for all board members in real-time collaboration.
 * 
 * @param boardId - ID of the board whose canvas settings to update
 * @param settings - New canvas configuration including dimensions and background color
 * @returns Promise resolving to the updated board object with new canvas settings
 * @throws {Error} When settings are invalid, exceed limits, or user lacks admin permissions
 */
export const updateCanvasSettings = async (
  boardId: number,
  settings: UpdateCanvasSettingsRequest,
): Promise<Board> => {
  const response = await apiClient.put<Board>(
    API_ENDPOINTS.UPDATE_CANVAS_SETTINGS(boardId),
    settings,
  );
  return response.data;
};

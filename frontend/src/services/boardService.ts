import { API_ENDPOINTS } from 'constants/api.constants';
import type { Board, BoardDetails, CreateBoardRequest, Member } from 'types/board.types';
import type { BoardActionResponse } from 'types/boardObject.types';
import type { ChatMessageResponse } from 'types/message.types';

import apiClient from './apiClient';

export const getBoards = async (): Promise<Board[]> => {
    const response = await apiClient.get<Board[]>(API_ENDPOINTS.BOARDS);
    return response.data;
};

export const createBoard = async (boardData: CreateBoardRequest): Promise<Board> => {
    const response = await apiClient.post<Board>(API_ENDPOINTS.BOARDS, boardData);
    return response.data;
};

export const getBoardObjects = async (boardId: number): Promise<BoardActionResponse[]> => {
    const response = await apiClient.get<BoardActionResponse[]>(API_ENDPOINTS.BOARD_OBJECTS(boardId));
    return response.data;
};

export const getBoardDetails = async (boardId: number): Promise<BoardDetails> => {
    const response = await apiClient.get<BoardDetails>(API_ENDPOINTS.GET_BOARD_DETAILS(boardId));
    return response.data;
};

export const inviteMember = async (boardId: number, email: string): Promise<Member> => {
    const response = await apiClient.post<Member>(API_ENDPOINTS.INVITE_MEMBER(boardId), { email });
    return response.data;
};

export const removeMember = async (boardId: number, memberEmail: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.REMOVE_MEMBER(boardId, memberEmail));
};

export const promoteMember = async (boardId: number, memberEmail: string): Promise<Member> => {
    const response = await apiClient.put<Member>(API_ENDPOINTS.PROMOTE_MEMBER(boardId, memberEmail));
    return response.data;
};

export const undoLastAction = async (boardId: number): Promise<BoardActionResponse> => {
    const response = await apiClient.post<BoardActionResponse>(API_ENDPOINTS.UNDO(boardId));
    return response.data;
};

export const redoLastAction = async (boardId: number): Promise<BoardActionResponse> => {
    const response = await apiClient.post<BoardActionResponse>(API_ENDPOINTS.REDO(boardId));
    return response.data;
};

export const updateBoardName = async (boardId: number, name: string): Promise<Board> => {
    const response = await apiClient.put<Board>(API_ENDPOINTS.UPDATE_BOARD_NAME(boardId), { name });
    return response.data;
};

export const updateBoardDescription = async (boardId: number, description: string): Promise<Board> => {
    const response = await apiClient.put<Board>(API_ENDPOINTS.UPDATE_BOARD_DESCRIPTION(boardId), { description });
    return response.data;
};

export const leaveBoard = async (boardId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.LEAVE_BOARD(boardId));
};

export const uploadBoardPicture = async (boardId: number, file: File): Promise<Board> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Board>(API_ENDPOINTS.UPLOAD_BOARD_PICTURE(boardId), formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteBoardPicture = async (boardId: number): Promise<Board> => {
    const response = await apiClient.delete<Board>(API_ENDPOINTS.DELETE_BOARD_PICTURE(boardId));
    return response.data;
};

export const getBoardMessages = async (boardId: number): Promise<ChatMessageResponse[]> => {
    const response = await apiClient.get<ChatMessageResponse[]>(API_ENDPOINTS.GET_BOARD_MESSAGES(boardId));
    return response.data;
};

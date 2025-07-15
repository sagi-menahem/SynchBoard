// File: frontend/src/services/boardService.ts
import apiClient from './apiClient';
import type { Board, CreateBoardRequest, Member, BoardDetails } from '../types/board.types';
import type { BoardActionResponse } from '../types/boardObject.types';
import { API_ENDPOINTS } from '../constants/api.constants';

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
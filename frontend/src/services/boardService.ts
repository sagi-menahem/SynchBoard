// File: frontend/src/services/boardService.ts
import apiClient from './apiClient';
import type { Board, CreateBoardRequest } from '../types/board.types';
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

export const undoLastAction = async (boardId: number): Promise<BoardActionResponse> => {
    const response = await apiClient.post<BoardActionResponse>(API_ENDPOINTS.UNDO(boardId));
    return response.data;
};

export const redoLastAction = async (boardId: number): Promise<BoardActionResponse> => {
    const response = await apiClient.post<BoardActionResponse>(API_ENDPOINTS.REDO(boardId));
    return response.data;
};
// File: frontend/src/services/boardService.ts

import apiClient from './apiClient';
import type { Board, CreateBoardRequest } from '../types/board.types';
import type { BoardActionResponse } from '../types/websocket.types'; // 1. Import the type

/**
 * Fetches the list of boards for the currently authenticated user.
 */
export const getBoards = async (): Promise<Board[]> => {
  const response = await apiClient.get<Board[]>('/boards');
  return response.data;
};

/**
 * Sends a request to create a new board.
 */
export const createBoard = async (boardData: CreateBoardRequest): Promise<Board> => {
  const response = await apiClient.post<Board>('/boards', boardData);
  return response.data;
};

/**
 * Fetches all saved drawing objects for a specific board.
 * @param boardId The ID of the board.
 * @returns A promise that resolves to an array of board action objects.
 */
export const getBoardObjects = async (boardId: number): Promise<BoardActionResponse[]> => {
  const response = await apiClient.get<BoardActionResponse[]>(`/boards/${boardId}/objects`);
  return response.data;
};
// File: frontend/src/services/boardService.ts

import apiClient from './apiClient';
import type { Board, CreateBoardRequest } from '../types/board.types';
import type { BoardActionResponse } from '../types/boardObject.types';

export const getBoards = async (): Promise<Board[]> => {
  const response = await apiClient.get<Board[]>('/boards');
  return response.data;
};

export const createBoard = async (boardData: CreateBoardRequest): Promise<Board> => {
  const response = await apiClient.post<Board>('/boards', boardData);
  return response.data;
};

export const getBoardObjects = async (boardId: number): Promise<BoardActionResponse[]> => {
  const response = await apiClient.get<BoardActionResponse[]>(`/boards/${boardId}/objects`);
  return response.data;
};
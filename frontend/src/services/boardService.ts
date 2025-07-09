// File: frontend/src/services/boardService.ts

import apiClient from './apiClient';
import type { Board, CreateBoardRequest } from '../types/board.types'; // Import the new type

/**
 * Fetches the list of boards for the currently authenticated user.
 * @returns A promise that resolves to an array of Board objects.
 */
export const getBoards = async (): Promise<Board[]> => {
  const response = await apiClient.get<Board[]>('/boards');
  return response.data;
};

/**
 * Sends a request to create a new board.
 * @param boardData An object containing the new board's name and optional description.
 * @returns A promise that resolves to the newly created Board object.
 */
export const createBoard = async (boardData: CreateBoardRequest): Promise<Board> => {
  const response = await apiClient.post<Board>('/boards', boardData);
  return response.data;
};
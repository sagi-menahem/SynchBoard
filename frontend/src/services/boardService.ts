// File: frontend/src/services/boardService.ts

import apiClient from './apiClient';
import type { Board } from '../types/board.types';

/**
 * Fetches the list of boards for the currently authenticated user.
 * @returns A promise that resolves to an array of Board objects.
 */
export const getBoards = async (): Promise<Board[]> => {
  // The GET request is sent to the '/boards' endpoint relative to the base URL in apiClient.
  const response = await apiClient.get<Board[]>('/boards');
  
  // The actual data from the response body is returned.
  return response.data;
};
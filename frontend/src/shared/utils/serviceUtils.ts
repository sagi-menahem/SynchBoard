import apiClient from 'shared/lib/apiClient';

/**
 * Generic service utility for common HTTP operations
 */
export class ServiceUtils {
  /**
   * Generic POST request
   */
  static async post<TRequest, TResponse = any>(
    endpoint: string,
    data: TRequest,
  ): Promise<TResponse> {
    const response = await apiClient.post<TResponse>(endpoint, data);
    return response.data;
  }

  /**
   * Generic GET request
   */
  static async get<TResponse = any>(endpoint: string): Promise<TResponse> {
    const response = await apiClient.get<TResponse>(endpoint);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  static async put<TRequest, TResponse = any>(
    endpoint: string,
    data: TRequest,
  ): Promise<TResponse> {
    const response = await apiClient.put<TResponse>(endpoint, data);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  static async delete<TResponse = any>(endpoint: string): Promise<TResponse> {
    const response = await apiClient.delete<TResponse>(endpoint);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  static async patch<TRequest, TResponse = any>(
    endpoint: string,
    data: TRequest,
  ): Promise<TResponse> {
    const response = await apiClient.patch<TResponse>(endpoint, data);
    return response.data;
  }
}

/**
 * Convenience functions for common patterns
 */

export const postRequest = <TRequest, TResponse = any>(endpoint: string) => 
  (data: TRequest): Promise<TResponse> => ServiceUtils.post<TRequest, TResponse>(endpoint, data);

export const getRequest = <TResponse = any>(endpoint: string) => 
  (): Promise<TResponse> => ServiceUtils.get<TResponse>(endpoint);

export const putRequest = <TRequest, TResponse = any>(endpoint: string) => 
  (data: TRequest): Promise<TResponse> => ServiceUtils.put<TRequest, TResponse>(endpoint, data);

export const deleteRequest = <TResponse = any>(endpoint: string) => 
  (): Promise<TResponse> => ServiceUtils.delete<TResponse>(endpoint);

export const patchRequest = <TRequest, TResponse = any>(endpoint: string) => 
  (data: TRequest): Promise<TResponse> => ServiceUtils.patch<TRequest, TResponse>(endpoint, data);
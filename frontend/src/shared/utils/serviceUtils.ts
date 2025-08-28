import apiClient from 'shared/lib/apiClient';

/**
 * Generic service utility for common HTTP operations
 */
export const ServiceUtils = {
  /**
   * Generic POST request
   */
  async post<TRequest, TResponse = unknown>(
    endpoint: string,
    data: TRequest,
  ): Promise<TResponse> {
    const response = await apiClient.post<TResponse>(endpoint, data);
    return response.data;
  },

  /**
   * Generic GET request
   */
  async get<TResponse = unknown>(endpoint: string): Promise<TResponse> {
    const response = await apiClient.get<TResponse>(endpoint);
    return response.data;
  },

  /**
   * Generic PUT request
   */
  async put<TRequest, TResponse = unknown>(
    endpoint: string,
    data: TRequest,
  ): Promise<TResponse> {
    const response = await apiClient.put<TResponse>(endpoint, data);
    return response.data;
  },

  /**
   * Generic DELETE request
   */
  async delete<TResponse = unknown>(endpoint: string): Promise<TResponse> {
    const response = await apiClient.delete<TResponse>(endpoint);
    return response.data;
  },

  /**
   * Generic PATCH request
   */
  async patch<TRequest, TResponse = unknown>(
    endpoint: string,
    data: TRequest,
  ): Promise<TResponse> {
    const response = await apiClient.patch<TResponse>(endpoint, data);
    return response.data;
  },
};

/**
 * Convenience functions for common patterns
 */

export const postRequest = <TRequest, TResponse = unknown>(endpoint: string) => 
  (data: TRequest): Promise<TResponse> => ServiceUtils.post<TRequest, TResponse>(endpoint, data);

export const getRequest = <TResponse = unknown>(endpoint: string) => 
  (): Promise<TResponse> => ServiceUtils.get<TResponse>(endpoint);

export const putRequest = <TRequest, TResponse = unknown>(endpoint: string) => 
  (data: TRequest): Promise<TResponse> => ServiceUtils.put<TRequest, TResponse>(endpoint, data);

export const deleteRequest = <TResponse = unknown>(endpoint: string) => 
  (): Promise<TResponse> => ServiceUtils.delete<TResponse>(endpoint);

export const patchRequest = <TRequest, TResponse = unknown>(endpoint: string) => 
  (data: TRequest): Promise<TResponse> => ServiceUtils.patch<TRequest, TResponse>(endpoint, data);
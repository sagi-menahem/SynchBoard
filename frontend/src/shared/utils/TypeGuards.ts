export interface BackendError {
  message: string;
}

export const isBackendError = (data: unknown): data is BackendError => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    'message' in obj &&
    typeof obj.message === 'string' &&
    obj.message.trim().length > 0 &&
    obj.message.length <= 500
  );
};

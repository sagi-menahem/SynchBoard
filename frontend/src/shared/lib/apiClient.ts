/**
 * Configured Axios client for the SynchBoard application API.
 * Includes request/response interceptors for authentication, error handling,
 * session management, and internationalized user feedback through toast notifications.
 * Automatically handles JWT token injection, session expiration, and backend error translation.
 */

import axios, { type AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
  API_BASE_URL,
  AUTH_HEADER_CONFIG,
  PUBLIC_API_ENDPOINTS,
} from 'shared/constants/ApiConstants';
import i18n from 'shared/lib/i18n';
import { isBackendError } from 'shared/utils';
import { getToken, removeToken } from 'shared/utils/authUtils';
import logger from 'shared/utils/logger';

// Endpoints that fail silently without logging (expected to fail when backend is unavailable)
const SILENT_ENDPOINTS = ['/config/features'];

// Create configured axios instance with base URL and default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT authentication token for protected endpoints
apiClient.interceptors.request.use(
  (config) => {
    const isPublicEndpoint = config.url ? PUBLIC_API_ENDPOINTS.includes(config.url) : false;

    // Add Authorization header for protected endpoints
    if (!isPublicEndpoint) {
      const token = getToken();
      if (token) {
        config.headers[AUTH_HEADER_CONFIG.HEADER_NAME] =
          `${AUTH_HEADER_CONFIG.TOKEN_PREFIX}${token}`;
      } else {
        logger.warn('No auth token available for protected endpoint');
      }
    }
    return config;
  },
  (error) => {
    logger.error('API Request interceptor error', error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling, session management, and user feedback
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Check if this is a silent endpoint (expected failures when backend unavailable)
    const isSilentEndpoint = error.config?.url
      ? SILENT_ENDPOINTS.some((endpoint) => error.config?.url?.includes(endpoint))
      : false;

    // Log error details for non-silent endpoints only
    if (!isSilentEndpoint) {
      const errorDetails = [
        `${error.config?.method?.toUpperCase() ?? 'UNKNOWN'} ${error.config?.url ?? 'unknown'}`,
        `Status: ${error.response?.status ?? 'Network Error'}`,
        error.response?.data ? `Response: ${JSON.stringify(error.response.data)}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      logger.error(`[API] ${errorDetails}`);
    }

    // Check if this is an auth form request (these have their own error handling)
    const isAuthFormRequest = error.config?.url
      ? PUBLIC_API_ENDPOINTS.includes(error.config.url)
      : false;

    // Analyze error context to determine if session has expired
    const isBoardRequest = error.config?.url?.includes('/boards/');
    const responseData = error.response?.data as { message?: string } | undefined;
    const isUserNotFoundInResponse =
      error.response?.status === 500 && responseData?.message?.includes?.('User not found'); // 500 Internal Server Error - backend database issue
    const isUserNotFoundInMessage =
      error.response?.status === 500 && error.message?.includes?.('User not found'); // 500 Internal Server Error - user session corrupted
    const isUserNotFoundError = isUserNotFoundInResponse || isUserNotFoundInMessage;

    // Detect OAuth redirect errors (often indicate expired sessions)
    const isOAuthRedirectError =
      !error.response &&
      (error.message?.includes?.('CORS') ||
        error.message?.includes?.('blocked by CORS policy') ||
        error.code === 'ERR_NETWORK') &&
      getToken();

    const isHttpUnauthorized =
      error.response && [401, 403].includes(error.response.status) && !isAuthFormRequest; // 401 Unauthorized/403 Forbidden - invalid or expired credentials
    const isUserNotFoundErrorTimeout = isUserNotFoundError && !isAuthFormRequest;
    const isOAuthRedirectErrorTimeout = isOAuthRedirectError && !isAuthFormRequest;

    // Determine if this is a session timeout requiring user reauthentication
    const isSessionTimeout =
      isHttpUnauthorized || isUserNotFoundErrorTimeout || isOAuthRedirectErrorTimeout;

    if (isSessionTimeout) {
      if (
        error.response?.status === 401 || // 401 Unauthorized - token expired or invalid
        !isBoardRequest ||
        isUserNotFoundError ||
        isOAuthRedirectError
      ) {
        // Determine the specific reason for session invalidation for logging
        const reason = (() => {
          if (isUserNotFoundError) {
            return 'user not found in database';
          }
          if (isOAuthRedirectError) {
            return 'OAuth redirect (expired session)';
          }
          return `${error.response?.status} response`;
        })();
        logger.warn(`[API] Session invalidated due to ${reason}`, {
          currentPath: window.location.pathname,
          clearingToken: true,
          timestamp: new Date().toISOString(),
          isUserNotFoundError,
          isOAuthRedirectError,
        });
        removeToken();

        // Show session expired notification and redirect to auth page
        toast.error(i18n.t('auth:errors.sessionExpired'), { id: 'session-expired' });

        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    }

    // Handle structured backend errors with internationalized messages
    // Skip for auth form requests as they have their own error handling
    if (error.response && isBackendError(error.response.data) && !isAuthFormRequest) {
      const backendKey = error.response.data.message;

      // Try multiple i18n key patterns to find appropriate translation
      const possibleKeys = [
        `common:errors.${backendKey}`,
        `auth:${backendKey}`,
        `auth:errors.${backendKey}`,
        backendKey,
      ];

      for (const key of possibleKeys) {
        if (i18n.exists(key)) {
          toast.error(i18n.t(key), { id: key });
          break;
        }
      }
      // No fallback toast - let specific error handlers show their own messages
    } else if (!isAuthFormRequest) {
      // Log unexpected errors without structured backend messages, but don't show generic toast
      // Specific error handlers will show appropriate messages
      logger.error('Unexpected error without backend message', error);
    }

    return Promise.reject(error);
  },
);

export default apiClient;

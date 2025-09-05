/**
 * Hook for accessing application feature configuration.
 * Fetches the current feature availability from the backend API to determine
 * which UI components should be displayed based on available services.
 */

import { useState, useEffect } from 'react';
import apiClient from 'shared/lib/apiClient';
import logger from 'shared/utils/logger';

export interface FeatureConfig {
  emailVerificationEnabled: boolean;
  passwordResetEnabled: boolean;
  googleLoginEnabled: boolean;
}

/**
 * Custom hook for accessing feature configuration.
 * 
 * @returns FeatureConfig object with boolean flags for each optional feature,
 *          or null while loading
 */
export const useFeatureConfig = (): FeatureConfig | null => {
  const [config, setConfig] = useState<FeatureConfig | null>(null);

  useEffect(() => {
    const fetchFeatureConfig = async () => {
      try {
        const response = await apiClient.get<FeatureConfig>('/config/features');
        setConfig(response.data);
        logger.info('Feature configuration loaded:', response.data);
      } catch (error) {
        logger.error('Failed to load feature configuration:', error);
        // Default to all features disabled on error
        setConfig({
          emailVerificationEnabled: false,
          passwordResetEnabled: false,
          googleLoginEnabled: false
        });
      }
    };

    fetchFeatureConfig();
  }, []);

  return config;
};
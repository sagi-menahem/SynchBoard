import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import apiClient from 'shared/lib/apiClient';
import { PageLoader } from 'shared/ui';
import logger from 'shared/utils/logger';

/**
 * Feature configuration flags indicating which optional features are enabled.
 * These values are determined by the backend based on configured API keys.
 */
export interface FeatureConfig {
  emailVerificationEnabled: boolean;
  passwordResetEnabled: boolean;
  googleLoginEnabled: boolean;
}

/**
 * Default feature configuration used when API call fails.
 * All features default to disabled for safety.
 */
const DEFAULT_CONFIG: FeatureConfig = {
  emailVerificationEnabled: false,
  passwordResetEnabled: false,
  googleLoginEnabled: false,
};

/**
 * Context for accessing feature configuration throughout the application.
 * Guaranteed to have a valid FeatureConfig value after provider initialization.
 */
const FeatureConfigContext = createContext<FeatureConfig | null>(null);

interface FeatureConfigProviderProps {
  children: ReactNode;
}

/**
 * Provider component that fetches and caches feature configuration at app startup.
 * Blocks rendering of children until configuration is loaded to prevent UI flickering.
 * This ensures all child components have immediate access to feature flags without
 * needing to handle loading states individually.
 *
 * @param children - Child components that will have access to feature configuration
 */
export const FeatureConfigProvider: React.FC<FeatureConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<FeatureConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatureConfig = async () => {
      try {
        const response = await apiClient.get<FeatureConfig>('/config/features');
        setConfig(response.data);
      } catch (error) {
        logger.error('Failed to load feature configuration:', error);
        // Use default config on error to allow app to function
        setConfig(DEFAULT_CONFIG);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchFeatureConfig();
  }, []);

  // Block rendering until config is loaded to prevent UI flickering
  if (isLoading) {
    return <PageLoader />;
  }

  return <FeatureConfigContext.Provider value={config}>{children}</FeatureConfigContext.Provider>;
};

/**
 * Hook for accessing feature configuration from context.
 * Must be used within a FeatureConfigProvider.
 *
 * @returns FeatureConfig object with boolean flags for each optional feature
 * @throws Error if used outside of FeatureConfigProvider
 */
export const useFeatureConfig = (): FeatureConfig => {
  const context = useContext(FeatureConfigContext);

  if (context === null) {
    throw new Error('useFeatureConfig must be used within a FeatureConfigProvider');
  }

  return context;
};

export { FeatureConfigContext };

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import apiClient from 'shared/lib/apiClient';

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
 * Always has a valid FeatureConfig value (defaults are used until API responds).
 */
const FeatureConfigContext = createContext<FeatureConfig>(DEFAULT_CONFIG);

interface FeatureConfigProviderProps {
  children: ReactNode;
}

/**
 * Provider component that fetches and caches feature configuration at app startup.
 * Renders children immediately with default config to avoid blocking LCP.
 * Configuration is updated asynchronously when the API call completes.
 *
 * @param children - Child components that will have access to feature configuration
 */
export const FeatureConfigProvider: React.FC<FeatureConfigProviderProps> = ({ children }) => {
  // Initialize with default config to render immediately (no blocking)
  const [config, setConfig] = useState<FeatureConfig>(DEFAULT_CONFIG);
  const configFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent double fetching in React StrictMode
    if (configFetchedRef.current) return;
    configFetchedRef.current = true;

    // Defer the state update to after initial paint to avoid re-renders during LCP measurement
    const timeoutId = setTimeout(async () => {
      try {
        const response = await apiClient.get<FeatureConfig>('/config/features');
        setConfig(response.data);
      } catch {
        // Feature config endpoint failure is expected when backend is unavailable
        // Keep default config silently to allow app to function
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return <FeatureConfigContext.Provider value={config}>{children}</FeatureConfigContext.Provider>;
};

/**
 * Hook for accessing feature configuration from context.
 * Can be used anywhere in the app - returns defaults if outside provider.
 *
 * @returns FeatureConfig object with boolean flags for each optional feature
 */
export const useFeatureConfig = (): FeatureConfig => {
  return useContext(FeatureConfigContext);
};

export { FeatureConfigContext };

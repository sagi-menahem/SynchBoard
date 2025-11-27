/**
 * @deprecated Use `useFeatureConfig` from 'shared/context/FeatureConfigContext' instead.
 * This file is kept for backwards compatibility only.
 *
 * The feature configuration is now loaded globally by FeatureConfigProvider
 * and is guaranteed to be available (non-null) when accessed via the context hook.
 */

export { useFeatureConfig, type FeatureConfig } from 'shared/context/FeatureConfigContext';

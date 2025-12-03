// =============================================================================
// TIMING CONSTANTS
// =============================================================================

/**
 * Minimum loading delay in milliseconds.
 * Prevents jarring flashes when operations complete too quickly.
 * Ensures smooth UI transitions and better perceived performance.
 */
export const MINIMUM_LOADING_DELAY_MS = 200;

/**
 * Debounce delay for resize events in milliseconds.
 */
export const RESIZE_DEBOUNCE_MS = 100;

/**
 * Debounce delay for search input in milliseconds.
 */
export const SEARCH_DEBOUNCE_MS = 300;

// =============================================================================
// TIMING UTILITIES
// =============================================================================

/**
 * Creates a minimum delay callback that ensures operations take at least
 * the specified minimum duration. Useful for preventing UI flashing when
 * async operations complete too quickly.
 *
 * @param startTime - The timestamp when the operation started (Date.now())
 * @param callback - The function to call after the minimum delay
 * @param minDelayMs - Minimum delay in milliseconds (defaults to MINIMUM_LOADING_DELAY_MS)
 *
 * @example
 * ```ts
 * const startTime = Date.now();
 * fetchData()
 *   .then(handleSuccess)
 *   .catch(handleError)
 *   .finally(() => {
 *     ensureMinimumDelay(startTime, () => setIsLoading(false));
 *   });
 * ```
 */
export const ensureMinimumDelay = (
  startTime: number,
  callback: () => void,
  minDelayMs: number = MINIMUM_LOADING_DELAY_MS,
): void => {
  const elapsed = Date.now() - startTime;
  const remainingDelay = Math.max(0, minDelayMs - elapsed);

  if (remainingDelay === 0) {
    callback();
  } else {
    setTimeout(callback, remainingDelay);
  }
};

/**
 * Creates a promise-based minimum delay that can be awaited.
 * Returns a function that should be called when the operation completes.
 *
 * @param minDelayMs - Minimum delay in milliseconds (defaults to MINIMUM_LOADING_DELAY_MS)
 * @returns Object with startTime and ensureDelay function
 *
 * @example
 * ```ts
 * const { startTime, ensureDelay } = createMinimumDelayTimer();
 * await fetchData();
 * await ensureDelay(); // Waits remaining time if needed
 * setIsLoading(false);
 * ```
 */
export const createMinimumDelayTimer = (minDelayMs: number = MINIMUM_LOADING_DELAY_MS) => {
  const startTime = Date.now();

  const ensureDelay = (): Promise<void> => {
    const elapsed = Date.now() - startTime;
    const remainingDelay = Math.max(0, minDelayMs - elapsed);

    if (remainingDelay === 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => setTimeout(resolve, remainingDelay));
  };

  return { startTime, ensureDelay };
};

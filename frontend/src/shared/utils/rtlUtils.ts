import { ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react';

/**
 * Checks if a given language code represents a right-to-left language.
 *
 * @param language - Language code to check (e.g., 'en', 'he', 'ar')
 * @returns true if the language is RTL, false otherwise
 */
export const isRTL = (language: string): boolean => {
  const rtlLanguages = ['he', 'ar', 'fa', 'ur'];
  return rtlLanguages.includes(language);
};

/**
 * Returns the appropriate forward navigation arrow icon based on text direction.
 * In RTL layouts, forward navigation uses left arrow; in LTR layouts, uses right arrow.
 * Used for consistent directional navigation across different language interfaces.
 *
 * @returns {LucideIcon} ArrowLeft for RTL, ArrowRight for LTR
 */
export const getNavigationArrowIcon = (): LucideIcon => {
  const isRTLLayout = document.documentElement.dir === 'rtl';
  return isRTLLayout ? ArrowLeft : ArrowRight;
};

/**
 * Returns the appropriate back navigation arrow icon based on text direction.
 * In RTL layouts, back navigation uses right arrow; in LTR layouts, uses left arrow.
 * Used for consistent directional back/previous navigation across different language interfaces.
 *
 * @returns {LucideIcon} ArrowRight for RTL, ArrowLeft for LTR
 */
export const getBackArrowIcon = (): LucideIcon => {
  const isRTLLayout = document.documentElement.dir === 'rtl';
  return isRTLLayout ? ArrowRight : ArrowLeft;
};

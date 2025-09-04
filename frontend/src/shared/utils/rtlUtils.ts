import { ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react';

/**
 * Returns the appropriate forward navigation arrow icon based on text direction.
 * In RTL layouts, forward navigation uses left arrow; in LTR layouts, uses right arrow.
 * Used for consistent directional navigation across different language interfaces.
 * 
 * @returns {LucideIcon} ArrowLeft for RTL, ArrowRight for LTR
 */
export const getNavigationArrowIcon = (): LucideIcon => {
  const isRTL = document.documentElement.dir === 'rtl';
  return isRTL ? ArrowLeft : ArrowRight;
};

/**
 * Returns the appropriate back navigation arrow icon based on text direction.
 * In RTL layouts, back navigation uses right arrow; in LTR layouts, uses left arrow.
 * Used for consistent directional back/previous navigation across different language interfaces.
 * 
 * @returns {LucideIcon} ArrowRight for RTL, ArrowLeft for LTR
 */
export const getBackArrowIcon = (): LucideIcon => {
  const isRTL = document.documentElement.dir === 'rtl';
  return isRTL ? ArrowRight : ArrowLeft;
};

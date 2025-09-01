import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Returns the appropriate navigation arrow icon based on the current document direction.
 * In LTR languages (English): Right arrow indicates "forward/next"
 * In RTL languages (Hebrew): Left arrow indicates "forward/next" 
 */
export const getNavigationArrowIcon = (): LucideIcon => {
  const isRTL = document.documentElement.dir === 'rtl';
  return isRTL ? ArrowLeft : ArrowRight;
};

/**
 * Returns the appropriate back arrow icon based on the current document direction.
 * In LTR languages (English): Left arrow indicates "back/previous"
 * In RTL languages (Hebrew): Right arrow indicates "back/previous"
 */
export const getBackArrowIcon = (): LucideIcon => {
  const isRTL = document.documentElement.dir === 'rtl';
  return isRTL ? ArrowRight : ArrowLeft;
};
import { ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react';

export const getNavigationArrowIcon = (): LucideIcon => {
  const isRTL = document.documentElement.dir === 'rtl';
  return isRTL ? ArrowLeft : ArrowRight;
};

export const getBackArrowIcon = (): LucideIcon => {
  const isRTL = document.documentElement.dir === 'rtl';
  return isRTL ? ArrowRight : ArrowLeft;
};
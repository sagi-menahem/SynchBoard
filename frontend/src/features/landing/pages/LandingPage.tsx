import { useAuth } from 'features/auth/hooks';
import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';

import {
  CTASection,
  DivideX,
  FeaturesSection,
  FooterSection,
  HeroImageSection,
  HeroSection,
  LandingNavbar,
  LogoCloudSection,
  ScreenshotsSection,
} from '../components';

// Lazy load AuthModal to defer vaul, react-day-picker, and auth forms until user interaction
const AuthModal = lazy(() => import('../components/ui/AuthModal'));

import styles from './LandingPage.module.scss';

/**
 * Main landing page component that orchestrates all landing sections.
 * Matches the Nodus template structure with DivideX separators.
 * Redirects authenticated users to the boards page.
 */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Redirect authenticated users to boards
  useEffect(() => {
    if (token) {
      void navigate(APP_ROUTES.BOARD_LIST, { replace: true });
    }
  }, [token, navigate]);

  const handleGetStarted = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Don't render landing page if authenticated (will redirect)
  if (token) {
    return null;
  }

  return (
    <div className={styles.landingPage}>
      {/* Navbar - Desktop nav always visible, floating nav on scroll */}
      <LandingNavbar onGetStarted={handleGetStarted} />
      <DivideX />

      {/* Main content sections with dividers */}
      <main className={styles.main}>
        <HeroSection onGetStarted={handleGetStarted} />
        <DivideX />
        <HeroImageSection />
        <DivideX />
        <LogoCloudSection />
        <DivideX />
        <FeaturesSection />
        <DivideX />
        <ScreenshotsSection />
        <DivideX />
        <CTASection onGetStarted={handleGetStarted} />
        <DivideX />
      </main>

      <FooterSection onGetStarted={handleGetStarted} />

      {/* Auth modal - lazy loaded to reduce initial bundle size */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} />
        </Suspense>
      )}
    </div>
  );
};

export default LandingPage;

import { useAuth } from 'features/auth/hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import { PageTransition } from 'shared/ui';

import {
  AuthModal,
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

import styles from './LandingPage.module.scss';

/**
 * Main landing page component that orchestrates all landing sections.
 * Matches the Nodus template structure with DivideX separators.
 * Redirects authenticated users to the boards page.
 */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, isInitializing } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Redirect authenticated users to boards
  useEffect(() => {
    if (!isInitializing && token) {
      void navigate(APP_ROUTES.BOARD_LIST, { replace: true });
    }
  }, [token, isInitializing, navigate]);

  const handleGetStarted = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Show loading while checking auth
  if (isInitializing) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // Don't render landing page if authenticated (will redirect)
  if (token) {
    return null;
  }

  return (
    <PageTransition>
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

        {/* Auth modal */}
        <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} />
      </div>
    </PageTransition>
  );
};

export default LandingPage;

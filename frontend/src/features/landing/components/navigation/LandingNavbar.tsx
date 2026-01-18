import { GuestLanguageSwitcher } from 'features/settings/ui';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ExternalLink, Menu, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'shared/ui';
import ThemeSwitcher from 'shared/ui/components/forms/ThemeSwitcher';

import { NAV_LINKS } from '../../constants/landingContent';
import { Container } from '../layout';

import styles from './LandingNavbar.module.scss';

interface LandingNavbarProps {
  onGetStarted: () => void;
}

/**
 * Landing page navbar with three variants:
 * - Desktop: Always visible at top
 * - Floating: Appears on scroll (desktop only)
 * - Mobile: Hamburger menu with slide-out drawer
 */
const LandingNavbar: React.FC<LandingNavbarProps> = ({ onGetStarted }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = useCallback((href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const handleGetStartedClick = useCallback(() => {
    setIsMobileMenuOpen(false);
    onGetStarted();
  }, [onGetStarted]);

  return (
    <>
      {/* Desktop Nav - Always visible */}
      <Container as="nav">
        <DesktopNav
          onNavClick={handleNavClick}
          onGetStarted={handleGetStartedClick}
        />
        <MobileNavHeader
          isOpen={isMobileMenuOpen}
          onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
      </Container>

      {/* Floating Nav - Appears on scroll (desktop only) */}
      <FloatingNav
        onNavClick={handleNavClick}
        onGetStarted={handleGetStartedClick}
      />

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavClick={handleNavClick}
        onGetStarted={handleGetStartedClick}
      />
    </>
  );
};

interface NavProps {
  onNavClick: (href: string) => void;
  onGetStarted: () => void;
}

const Logo: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <a
    href="#"
    className={styles.logo}
    onClick={(e) => {
      e.preventDefault();
      onClick?.();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }}
  >
    <span className={styles.logoIcon}>S</span>
    <span className={styles.logoText}>SynchBoard</span>
  </a>
);

const NavLinks: React.FC<{ onNavClick: (href: string) => void }> = ({ onNavClick }) => {
  const { t } = useTranslation(['landing']);

  return (
    <div className={styles.navLinks}>
      {NAV_LINKS.map((link) => (
        <a
          key={link.id}
          href={link.href}
          className={styles.navLink}
          onClick={(e) => {
            if (!link.external) {
              e.preventDefault();
              onNavClick(link.href);
            }
          }}
          target={link.external ? '_blank' : undefined}
          rel={link.external ? 'noopener noreferrer' : undefined}
        >
          {t(link.labelKey)}
          {link.external && <ExternalLink size={14} />}
        </a>
      ))}
    </div>
  );
};

const DesktopNav: React.FC<NavProps> = ({ onNavClick, onGetStarted }) => {
  const { t } = useTranslation(['landing']);

  return (
    <div className={styles.desktopNav}>
      <Logo />
      <NavLinks onNavClick={onNavClick} />
      <div className={styles.navActions}>
        <GuestLanguageSwitcher />
        <ThemeSwitcher />
        <Button variant="primary" onClick={onGetStarted}>
          {t('landing:nav.getStarted')}
        </Button>
      </div>
    </div>
  );
};

const FloatingNav: React.FC<NavProps> = ({ onNavClick, onGetStarted }) => {
  const { t } = useTranslation(['landing']);
  const { scrollY } = useScroll();

  const springConfig = { stiffness: 300, damping: 30 };
  const y = useSpring(
    useTransform(scrollY, [100, 120], [-100, 10]),
    springConfig,
  );

  return (
    <motion.nav className={styles.floatingNav} style={{ y }}>
      <Logo />
      <NavLinks onNavClick={onNavClick} />
      <div className={styles.navActions}>
        <GuestLanguageSwitcher />
        <ThemeSwitcher />
        <Button variant="primary" onClick={onGetStarted}>
          {t('landing:nav.getStarted')}
        </Button>
      </div>
    </motion.nav>
  );
};

interface MobileNavHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileNavHeader: React.FC<MobileNavHeaderProps> = ({ isOpen, onToggle }) => (
  <div className={styles.mobileNavHeader}>
    <Logo />
    <button
      className={styles.menuButton}
      onClick={onToggle}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  </div>
);

interface MobileMenuProps extends NavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onNavClick,
  onGetStarted,
}) => {
  const { t } = useTranslation(['landing']);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.mobileMenuOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.mobileMenu}>
            <div className={styles.mobileMenuHeader}>
              <Logo onClick={onClose} />
              <button
                className={styles.menuButton}
                onClick={onClose}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className={styles.mobileNavLinks}>
              {NAV_LINKS.map((link, index) => (
                <motion.a
                  key={link.id}
                  href={link.href}
                  className={styles.mobileNavLink}
                  onClick={(e) => {
                    if (!link.external) {
                      e.preventDefault();
                      onNavClick(link.href);
                    } else {
                      onClose();
                    }
                  }}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  {t(link.labelKey)}
                  {link.external && <ExternalLink size={16} />}
                </motion.a>
              ))}
            </div>

            <div className={styles.mobileActions}>
              <Button variant="primary" onClick={onGetStarted} className={styles.mobileCta}>
                {t('landing:nav.getStarted')}
              </Button>
            </div>

            <div className={styles.mobileThemeActions}>
              <GuestLanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LandingNavbar;

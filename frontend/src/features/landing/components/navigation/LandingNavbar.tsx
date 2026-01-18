import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { GuestLanguageSwitcher } from 'features/settings/ui';
import { ExternalLink, Menu, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'shared/ui';
import ThemeSwitcher from 'shared/ui/components/forms/ThemeSwitcher';
import { Drawer } from 'vaul';

import { NAV_LINKS } from '../../constants/landingContent';
import { Container } from '../layout';

import styles from './LandingNavbar.module.scss';

interface LandingNavbarProps {
  onGetStarted: () => void;
}

/**
 * Landing page navbar with three variants:
 * - Desktop: Always visible at top
 * - Floating: Appears on scroll (desktop only) - uses CSS animations for better performance
 * - Mobile: Hamburger menu with slide-out drawer
 */
const LandingNavbar: React.FC<LandingNavbarProps> = ({ onGetStarted }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFloatingVisible, setIsFloatingVisible] = useState(false);

  // Handle scroll to show/hide floating nav - uses CSS animation instead of Framer Motion
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsFloatingVisible(window.scrollY > 120);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      {/* Desktop Nav - Always visible (no borders like Notus) */}
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

      {/* Floating Nav - Appears on scroll (desktop only) - CSS animated */}
      <nav className={`${styles.floatingNav} ${isFloatingVisible ? styles.floatingNavVisible : ''}`}>
        <Logo />
        <NavLinks onNavClick={handleNavClick} />
        <div className={styles.navActions}>
          <GuestLanguageSwitcher />
          <ThemeSwitcher />
          <Button variant="primary" onClick={handleGetStartedClick}>
            <FloatingNavCTA />
          </Button>
        </div>
      </nav>

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

// Separate component to avoid re-rendering parent on translation changes
const FloatingNavCTA: React.FC = () => {
  const { t } = useTranslation(['landing']);
  return <>{t('landing:nav.getStarted')}</>;
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
    <img src="/favicon-96x96.png" alt="SynchBoard" className={styles.logoIcon} width={32} height={32} />
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
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction="top"
    >
      <Drawer.Portal>
        <Drawer.Overlay className={styles.drawerOverlay} />
        <Drawer.Content className={styles.drawerContent}>
          <VisuallyHidden>
            <Drawer.Title>Mobile Navigation</Drawer.Title>
            <Drawer.Description>
              Navigation menu for SynchBoard landing page
            </Drawer.Description>
          </VisuallyHidden>
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
              {NAV_LINKS.map((link) => (
                <a
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
                >
                  {t(link.labelKey)}
                  {link.external && <ExternalLink size={16} />}
                </a>
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
          <div className={styles.drawerHandle} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default LandingNavbar;

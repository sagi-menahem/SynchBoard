import { ExternalLink, Globe, Mail } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'shared/ui';

import { GITHUB_URL, LIVE_DEMO_URL } from '../../../constants/landingContent';
import { Dot } from '../../common';
import { GitHubLogo, LinkedInLogo } from '../../icons/TechLogos';
import { Container } from '../../layout';

import styles from './FooterSection.module.scss';
interface FooterSectionProps {
  onGetStarted: () => void;
}

/**
 * Footer section with logo, links, and social connections.
 */
const FooterSection: React.FC<FooterSectionProps> = ({ onGetStarted }) => {
  const { t } = useTranslation(['landing']);
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { title: t('landing:nav.getStarted'), href: '#' },
    { title: t('landing:footer.links.github'), href: GITHUB_URL, external: true },
    { title: t('landing:footer.links.liveDemo'), href: LIVE_DEMO_URL, external: true },
    { title: t('landing:footer.links.documentation'), href: `${GITHUB_URL}#readme`, external: true },
  ];

  const socialLinks = [
    { icon: Globe, href: 'https://www.sagimenahem.tech/', label: 'Portfolio' },
    { icon: LinkedInLogo, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: GitHubLogo, href: GITHUB_URL, label: 'GitHub' },
    { icon: Mail, href: 'mailto:sagia1997@gmail.com', label: 'Email' },
  ];

  return (
    <Container>
      <Dot top left />
      <Dot top right />
      <div className={styles.footerGrid}>
        {/* Brand Column */}
        <div className={styles.brandColumn}>
          <div className={styles.logo}>
            <img src="/favicon.svg" alt="SynchBoard" className={styles.logoIcon} width={32} height={32} />
            <span className={styles.logoText}>SynchBoard</span>
          </div>
          <p className={styles.description}>{t('landing:footer.description')}</p>
          <Button className={styles.ctaButton} onClick={onGetStarted}>
            {t('landing:footer.cta')}
          </Button>
        </div>

        {/* Links Column */}
        <div className={styles.linksColumn}>
          <p className={styles.columnTitle}>{t('landing:footer.links.title')}</p>
          <div className={styles.linksList}>
            {companyLinks.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className={styles.link}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
              >
                {item.title}
                {item.external && <ExternalLink size={12} />}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <p className={styles.copyright}>
          &copy; {currentYear} {t('landing:footer.copyright')}
        </p>
        <div className={styles.socialLinks}>
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={social.label}
            >
              <social.icon className={styles.socialIcon} />
            </a>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default FooterSection;

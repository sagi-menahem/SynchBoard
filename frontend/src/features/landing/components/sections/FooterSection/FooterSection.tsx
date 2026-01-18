import { ExternalLink, Send } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'shared/ui';

import { GITHUB_URL, LIVE_DEMO_URL } from '../../../constants/landingContent';
import { GitHubLogo, LinkedInLogo, TwitterLogo } from '../../icons/TechLogos';
import { Container } from '../../layout';

import styles from './FooterSection.module.scss';

/**
 * Footer section with logo, links, tech stack, newsletter, and social links.
 * Multi-column layout matching the template design.
 */
const FooterSection: React.FC = () => {
  const { t } = useTranslation(['landing']);
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { title: t('landing:features.realtime.title'), href: '#features' },
    { title: t('landing:features.drawing.title'), href: '#features' },
    { title: t('landing:features.boards.title'), href: '#features' },
    { title: t('landing:features.security.title'), href: '#features' },
  ];

  const companyLinks = [
    { title: t('landing:nav.getStarted'), href: '#' },
    { title: t('landing:footer.links.github'), href: GITHUB_URL, external: true },
    { title: t('landing:footer.links.liveDemo'), href: LIVE_DEMO_URL, external: true },
    { title: t('landing:footer.links.documentation'), href: `${GITHUB_URL}#readme`, external: true },
  ];

  const socialLinks = [
    { icon: TwitterLogo, href: 'https://twitter.com', label: 'Twitter' },
    { icon: LinkedInLogo, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: GitHubLogo, href: GITHUB_URL, label: 'GitHub' },
  ];

  return (
    <Container>
      <div className={styles.footerGrid}>
        {/* Brand Column */}
        <div className={styles.brandColumn}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>S</span>
            <span className={styles.logoText}>SynchBoard</span>
          </div>
          <p className={styles.description}>{t('landing:footer.description')}</p>
          <Button className={styles.ctaButton}>{t('landing:footer.cta')}</Button>
        </div>

        {/* Product Column */}
        <div className={styles.linksColumn}>
          <p className={styles.columnTitle}>Features</p>
          {productLinks.map((item) => (
            <a key={item.title} href={item.href} className={styles.link}>
              {item.title}
            </a>
          ))}
        </div>

        {/* Company Column */}
        <div className={styles.linksColumn}>
          <p className={styles.columnTitle}>{t('landing:footer.links.title')}</p>
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

        {/* Tech Stack Column */}
        <div className={styles.linksColumn}>
          <p className={styles.columnTitle}>{t('landing:footer.tech.title')}</p>
          <span className={styles.techItem}>{t('landing:footer.tech.frontend')}</span>
          <span className={styles.techItem}>{t('landing:footer.tech.backend')}</span>
          <span className={styles.techItem}>{t('landing:footer.tech.database')}</span>
          <span className={styles.techItem}>{t('landing:footer.tech.realtime')}</span>
        </div>

        {/* Newsletter Column */}
        <div className={styles.newsletterColumn}>
          <p className={styles.columnTitle}>{t('landing:footer.newsletter.title')}</p>
          <div className={styles.newsletterInput}>
            <input
              type="email"
              placeholder={t('landing:footer.newsletter.placeholder')}
              className={styles.emailInput}
            />
            <Button className={styles.sendButton}>
              <Send size={16} />
            </Button>
          </div>
          <p className={styles.newsletterDescription}>
            {t('landing:footer.newsletter.description')}
          </p>
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

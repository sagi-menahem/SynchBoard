import React from 'react';
import { useTranslation } from 'react-i18next';

import { LegalPageLayout } from '../components';
import styles from '../components/LegalPageLayout.module.scss';

/**
 * Terms of Service page component.
 * Displays the terms of service content in the user's selected language.
 */
const TermsOfServicePage: React.FC = () => {
  const { t } = useTranslation(['legal']);

  return (
    <LegalPageLayout
      title={t('legal:terms.title')}
      pageTitle={t('legal:terms.pageTitle')}
      lastUpdated={t('legal:terms.lastUpdated')}
    >
      {/* Acceptance of Terms */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:terms.sections.acceptance.title')}</h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:terms.sections.acceptance.content')}</p>
        </div>
      </section>

      {/* Service Description */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:terms.sections.serviceDescription.title')}</h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:terms.sections.serviceDescription.content')}</p>
        </div>
      </section>

      {/* User Accounts */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:terms.sections.userAccounts.title')}</h2>
        <div className={styles.sectionContent}>
          <h3>{t('legal:terms.sections.userAccounts.registration.title')}</h3>
          <p>{t('legal:terms.sections.userAccounts.registration.content')}</p>

          <h3>{t('legal:terms.sections.userAccounts.security.title')}</h3>
          <p>{t('legal:terms.sections.userAccounts.security.content')}</p>
        </div>
      </section>

      {/* User Content */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:terms.sections.userContent.title')}</h2>
        <div className={styles.sectionContent}>
          <h3>{t('legal:terms.sections.userContent.ownership.title')}</h3>
          <p>{t('legal:terms.sections.userContent.ownership.content')}</p>

          <h3>{t('legal:terms.sections.userContent.license.title')}</h3>
          <p>{t('legal:terms.sections.userContent.license.content')}</p>

          <h3>{t('legal:terms.sections.userContent.prohibited.title')}</h3>
          <p>{t('legal:terms.sections.userContent.prohibited.intro')}</p>
          <ul className={styles.list}>
            <li>{t('legal:terms.sections.userContent.prohibited.items.illegal')}</li>
            <li>{t('legal:terms.sections.userContent.prohibited.items.harmful')}</li>
            <li>{t('legal:terms.sections.userContent.prohibited.items.infringing')}</li>
            <li>{t('legal:terms.sections.userContent.prohibited.items.malicious')}</li>
            <li>{t('legal:terms.sections.userContent.prohibited.items.private')}</li>
          </ul>
        </div>
      </section>

      {/* Board Sharing */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:terms.sections.boardSharing.title')}</h2>
        <div className={styles.sectionContent}>
          <h3>{t('legal:terms.sections.boardSharing.roles.title')}</h3>
          <p>{t('legal:terms.sections.boardSharing.roles.content')}</p>

          <h3>{t('legal:terms.sections.boardSharing.invitations.title')}</h3>
          <p>{t('legal:terms.sections.boardSharing.invitations.content')}</p>
        </div>
      </section>

      {/* Prohibited Uses */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:terms.sections.prohibitedUses.title')}</h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:terms.sections.prohibitedUses.intro')}</p>
          <ul className={styles.list}>
            <li>{t('legal:terms.sections.prohibitedUses.items.unauthorized')}</li>
            <li>{t('legal:terms.sections.prohibitedUses.items.interfere')}</li>
            <li>{t('legal:terms.sections.prohibitedUses.items.scrape')}</li>
            <li>{t('legal:terms.sections.prohibitedUses.items.impersonate')}</li>
            <li>{t('legal:terms.sections.prohibitedUses.items.spam')}</li>
          </ul>
        </div>
      </section>

      {/* Service Availability */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t('legal:terms.sections.serviceAvailability.title')}
        </h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:terms.sections.serviceAvailability.content')}</p>
        </div>
      </section>

      {/* Limitation of Liability */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:terms.sections.limitation.title')}</h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:terms.sections.limitation.content')}</p>
        </div>
      </section>

      {/* Changes to Terms */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:terms.sections.changes.title')}</h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:terms.sections.changes.content')}</p>
        </div>
      </section>

      {/* Contact Us */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:terms.sections.contact.title')}</h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:terms.sections.contact.content')}</p>
          <p>
            <a href={`mailto:${t('legal:common.contactEmail')}`} className={styles.contactLink}>
              {t('legal:common.contactEmail')}
            </a>
          </p>
        </div>
      </section>
    </LegalPageLayout>
  );
};

export default TermsOfServicePage;

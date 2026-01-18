import React from 'react';
import { useTranslation } from 'react-i18next';

import { LegalPageLayout } from '../components';
import styles from '../components/LegalPageLayout.module.scss';

/**
 * Privacy Policy page component.
 * Displays the privacy policy content in the user's selected language.
 */
const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation(['legal']);

  return (
    <LegalPageLayout
      title={t('legal:privacy.title')}
      pageTitle={t('legal:privacy.pageTitle')}
      lastUpdated={t('legal:privacy.lastUpdated')}
    >
      {/* Introduction */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:privacy.sections.introduction.title')}</h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:privacy.sections.introduction.content')}</p>
        </div>
      </section>

      {/* Information We Collect */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t('legal:privacy.sections.informationCollected.title')}
        </h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:privacy.sections.informationCollected.intro')}</p>

          <h3>{t('legal:privacy.sections.informationCollected.accountData.title')}</h3>
          <ul className={styles.list}>
            <li>{t('legal:privacy.sections.informationCollected.accountData.items.email')}</li>
            <li>{t('legal:privacy.sections.informationCollected.accountData.items.name')}</li>
            <li>{t('legal:privacy.sections.informationCollected.accountData.items.phone')}</li>
            <li>{t('legal:privacy.sections.informationCollected.accountData.items.dob')}</li>
            <li>{t('legal:privacy.sections.informationCollected.accountData.items.gender')}</li>
          </ul>

          <h3>{t('legal:privacy.sections.informationCollected.profileData.title')}</h3>
          <ul className={styles.list}>
            <li>{t('legal:privacy.sections.informationCollected.profileData.items.picture')}</li>
            <li>{t('legal:privacy.sections.informationCollected.profileData.items.preferences')}</li>
          </ul>

          <h3>{t('legal:privacy.sections.informationCollected.contentData.title')}</h3>
          <ul className={styles.list}>
            <li>{t('legal:privacy.sections.informationCollected.contentData.items.boards')}</li>
            <li>{t('legal:privacy.sections.informationCollected.contentData.items.chat')}</li>
            <li>{t('legal:privacy.sections.informationCollected.contentData.items.history')}</li>
          </ul>
        </div>
      </section>

      {/* How We Use Your Information */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:privacy.sections.howWeUse.title')}</h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:privacy.sections.howWeUse.intro')}</p>
          <ul className={styles.list}>
            <li>{t('legal:privacy.sections.howWeUse.items.service')}</li>
            <li>{t('legal:privacy.sections.howWeUse.items.account')}</li>
            <li>{t('legal:privacy.sections.howWeUse.items.sync')}</li>
            <li>{t('legal:privacy.sections.howWeUse.items.notifications')}</li>
            <li>{t('legal:privacy.sections.howWeUse.items.improve')}</li>
            <li>{t('legal:privacy.sections.howWeUse.items.security')}</li>
          </ul>
        </div>
      </section>

      {/* Third-Party Services */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:privacy.sections.thirdParty.title')}</h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:privacy.sections.thirdParty.intro')}</p>

          <h3>{t('legal:privacy.sections.thirdParty.google.title')}</h3>
          <p>{t('legal:privacy.sections.thirdParty.google.content')}</p>

          <h3>{t('legal:privacy.sections.thirdParty.gmail.title')}</h3>
          <p>{t('legal:privacy.sections.thirdParty.gmail.content')}</p>
        </div>
      </section>

      {/* Data Storage and Security */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:privacy.sections.dataStorage.title')}</h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:privacy.sections.dataStorage.intro')}</p>
          <ul className={styles.list}>
            <li>{t('legal:privacy.sections.dataStorage.items.passwords')}</li>
            <li>{t('legal:privacy.sections.dataStorage.items.jwt')}</li>
            <li>{t('legal:privacy.sections.dataStorage.items.https')}</li>
            <li>{t('legal:privacy.sections.dataStorage.items.files')}</li>
            <li>{t('legal:privacy.sections.dataStorage.items.tokens')}</li>
            <li>{t('legal:privacy.sections.dataStorage.items.resetCodes')}</li>
          </ul>
        </div>
      </section>

      {/* Your Rights */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:privacy.sections.yourRights.title')}</h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:privacy.sections.yourRights.intro')}</p>
          <ul className={styles.list}>
            <li>{t('legal:privacy.sections.yourRights.items.access')}</li>
            <li>{t('legal:privacy.sections.yourRights.items.update')}</li>
            <li>{t('legal:privacy.sections.yourRights.items.delete')}</li>
            <li>{t('legal:privacy.sections.yourRights.items.export')}</li>
            <li>{t('legal:privacy.sections.yourRights.items.withdraw')}</li>
          </ul>
        </div>
      </section>

      {/* Data Retention */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:privacy.sections.dataRetention.title')}</h2>
        <div className={styles.sectionContent}>
          <ul className={styles.list}>
            <li>{t('legal:privacy.sections.dataRetention.items.account')}</li>
            <li>{t('legal:privacy.sections.dataRetention.items.boards')}</li>
            <li>{t('legal:privacy.sections.dataRetention.items.verification')}</li>
            <li>{t('legal:privacy.sections.dataRetention.items.reset')}</li>
          </ul>
        </div>
      </section>

      {/* Contact Us */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('legal:privacy.sections.contact.title')}</h2>
        <div className={styles.sectionContent}>
          <p>{t('legal:privacy.sections.contact.content')}</p>
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

export default PrivacyPolicyPage;

import React from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from 'components/common';
import { useAuth } from 'hooks/auth';

import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
    const { logout } = useAuth();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: 'en' | 'he') => {
        i18n.changeLanguage(lng);
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.section}>
                <span className={styles.title}>{t('navbar.title')}</span>
            </div>

            <div className={styles.section}>
                <Button onClick={() => changeLanguage('en')} variant="secondary" className={styles.langButton}>
                    {t('navbar.language.en')}
                </Button>
                <Button onClick={() => changeLanguage('he')} variant="secondary" className={styles.langButton}>
                    {t('navbar.language.he')}
                </Button>
                <Button onClick={logout} variant="secondary">
                    {t('navbar.logout')}
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;

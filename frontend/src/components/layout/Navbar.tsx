// File: frontend/src/components/layout/Navbar.tsx

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { useTranslation } from 'react-i18next';

const Navbar: React.FC = () => {
    const { logout } = useAuth();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: 'en' | 'he') => {
        i18n.changeLanguage(lng);
    };

    return (
        <nav style={navStyle}>
            <div style={navSectionStyle}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{t('navbar.title')}</span>
            </div>
            
            <div style={navSectionStyle}>
                <Button onClick={() => changeLanguage('en')} variant="secondary" style={languageButtonStyle}>
                    {t('navbar.language.en')}
                </Button>
                <Button onClick={() => changeLanguage('he')} variant="secondary" style={languageButtonStyle}>
                    {t('navbar.language.he')}
                </Button>
                <Button onClick={logout} variant="secondary">
                    {t('navbar.logout')}
                </Button>
            </div>
        </nav>
    );
};

const navStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem 2rem',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxSizing: 'border-box',
};

const navSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
};

const languageButtonStyle: React.CSSProperties = {
    padding: '0.4em 0.8em',
    fontSize: '0.9em'
};

export default Navbar;
// File: frontend/src/components/auth/RegisterForm.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import Input from '../common/Input';
import { useRegisterForm } from '../../hooks/useRegisterForm';

interface RegisterFormProps {
    onRegistrationSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegistrationSuccess }) => {
    const { t } = useTranslation();
    const {
        email, password, firstName, lastName, phoneNumber, error,
        setEmail, setPassword, setFirstName, setLastName, setPhoneNumber, handleSubmit,
    } = useRegisterForm(onRegistrationSuccess);

    return (
        <form onSubmit={handleSubmit} style={{ width: '300px' }}>
            <h2>{t('registerForm.heading')}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div>
                <label htmlFor="register-email">{t('common.form.label.email')}</label>
                <Input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginTop: '1rem' }}>
                <label htmlFor="register-password">{t('common.form.label.password')}</label>
                <Input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div style={{ marginTop: '1rem' }}>
                <label htmlFor="register-firstName">{t('common.form.label.firstName')}</label>
                <Input id="register-firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div style={{ marginTop: '1rem' }}>
                <label htmlFor="register-lastName">{t('common.form.label.lastName')}</label>
                <Input id="register-lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <div style={{ marginTop: '1rem' }}>
                <label htmlFor="register-phoneNumber">{t('common.form.label.phoneNumber')}</label>
                <Input id="register-phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            </div>

            <Button type="submit" style={{ marginTop: '1.5rem', width: '100%' }}>
                {t('registerForm.button')}
            </Button>
        </form>
    );
};

export default RegisterForm;
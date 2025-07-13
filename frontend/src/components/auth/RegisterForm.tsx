// File: frontend/src/components/auth/RegisterForm.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import Input from '../common/Input';
import { useRegisterForm } from '../../hooks/useRegisterForm';
import styles from './AuthForm.module.css';

interface RegisterFormProps {
    onRegistrationSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegistrationSuccess }) => {
    const { t } = useTranslation();
    const {
        email, password, firstName, lastName, phoneNumber, isSubmitting,
        setEmail, setPassword, setFirstName, setLastName, setPhoneNumber, handleSubmit,
    } = useRegisterForm(onRegistrationSuccess);

    const inputs = [
        { id: 'register-email', label: 'email', type: 'email', value: email, setter: setEmail },
        { id: 'register-password', label: 'password', type: 'password', value: password, setter: setPassword },
        { id: 'register-firstName', label: 'firstName', type: 'text', value: firstName, setter: setFirstName },
        { id: 'register-lastName', label: 'lastName', type: 'text', value: lastName, setter: setLastName },
        { id: 'register-phoneNumber', label: 'phoneNumber', type: 'tel', value: phoneNumber, setter: setPhoneNumber },
    ];

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>{t('registerForm.heading')}</h2>

            {inputs.map(input => (
                <div key={input.id} className={styles.field}>
                    <label htmlFor={input.id}>{t(`common.form.label.${input.label}`)}</label>
                    <Input id={input.id} type={input.type} value={input.value} onChange={(e) => input.setter(e.target.value)} required disabled={isSubmitting} />
                </div>
            ))}

            <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? t('common.button.registering') : t('registerForm.button')}
            </Button>
        </form>
    );
};

export default RegisterForm;
import React from 'react';

import type { LucideIcon } from 'lucide-react';

import Input from './Input';
import PasswordInput from './PasswordInput';

interface FormFieldProps {
  id: string;
  label: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'number';
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
  className?: string;
  inputClassName?: string;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  name,
  type = 'text',
  required = false,
  disabled = false,
  placeholder,
  value,
  onChange,
  icon: Icon,
  className = '',
  inputClassName = '',
  error,
}) => {
  const InputComponent = type === 'password' ? PasswordInput : Input;
  
  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={id}>
        {Icon && <Icon size={14} />}
        {label}
      </label>
      <InputComponent
        id={id}
        name={name ?? id}
        type={type === 'password' ? undefined : type}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputClassName}
      />
      {error && (
        <div className="form-field-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
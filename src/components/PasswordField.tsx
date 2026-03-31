import React, { useId, useState } from 'react';

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
  className?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  onChange,
  placeholder,
  required = false,
  id,
  name,
  autoComplete,
  className = '',
}) => {
  const generatedId = useId();
  const [isVisible, setIsVisible] = useState(false);
  const inputId = id ?? generatedId;

  return (
    <div className="relative">
      <input
        id={inputId}
        name={name}
        type={isVisible ? 'text' : 'password'}
        required={required}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`block w-full rounded-xl border border-slate-300 px-4 py-3 pr-14 text-slate-900 outline-none focus:border-blue-500 ${className}`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        className="absolute inset-y-0 right-3 my-auto flex h-9 items-center rounded-lg px-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        aria-label={isVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        title={isVisible ? 'Masquer' : 'Afficher'}
      >
        {isVisible ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
            <path d="M9.4 5.1A10.9 10.9 0 0 1 12 4.8c5 0 8.3 4 9.4 5.7a1 1 0 0 1 0 1c-.5.8-1.5 2.1-3 3.3" />
            <path d="M6.7 6.7C4.8 8 3.5 9.7 2.6 11.5a1 1 0 0 0 0 1C3.7 14.2 7 18.2 12 18.2c1.6 0 3-.3 4.2-.8" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2.6 12.5a1 1 0 0 1 0-1C3.7 9.8 7 5.8 12 5.8s8.3 4 9.4 5.7a1 1 0 0 1 0 1C20.3 14.2 17 18.2 12 18.2s-8.3-4-9.4-5.7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default PasswordField;

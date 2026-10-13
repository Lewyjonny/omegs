import { Eye, EyeOff } from 'lucide-react';
import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FieldWrapperProps {
  label: string;
  error?: string;
  hint?: string;
  id: string;
  children: ReactNode;
  optional?: boolean;
}

function FieldWrapper({ label, error, hint, id, children, optional }: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy-800">
        {label}
        {optional && <span className="ml-1 font-normal text-navy-400">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-navy-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

type BaseProps = { label: string; error?: string; hint?: string; optional?: boolean };

export function TextField({ label, error, hint, optional, className = '', ...props }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <FieldWrapper label={label} error={error} hint={hint} id={id} optional={optional}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
    </FieldWrapper>
  );
}

export function PasswordField({ label, error, hint, ...props }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <FieldWrapper label={label} error={error} hint={hint} id={id}>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          className={`input pr-12 ${error ? 'input-error' : ''}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-navy-400 hover:text-navy-700"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </FieldWrapper>
  );
}

export function TextAreaField({ label, error, hint, optional, ...props }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <FieldWrapper label={label} error={error} hint={hint} id={id} optional={optional}>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={`input min-h-[132px] resize-y ${error ? 'input-error' : ''}`}
        {...props}
      />
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  error,
  hint,
  optional,
  children,
  ...props
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const id = useId();
  return (
    <FieldWrapper label={label} error={error} hint={hint} id={id} optional={optional}>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={`input ${error ? 'input-error' : ''}`}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}

export function Checkbox({
  label,
  error,
  ...props
}: { label: ReactNode; error?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const id = useId();
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`mt-0.5 h-4 w-4 rounded border-navy-300 text-mint-600 focus:ring-mint-500 ${error ? 'border-red-400' : ''}`}
          {...props}
        />
        <label htmlFor={id} className="text-sm text-navy-700">
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

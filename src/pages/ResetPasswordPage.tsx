import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { PasswordField } from '../components/ui/FormField';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { AuthLayout } from '../layouts/AuthLayout';
import { hasErrors, passwordIssues, type Errors } from '../lib/validation';
import { AuthError } from '../services/auth';
import { AuthModeNotice } from './authShared';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  usePageMeta('Choose a new password');
  const { user, loading: authLoading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<ResetForm>({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Errors<ResetForm>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (v: ResetForm) => {
    const e: Errors<ResetForm> = {};
    const issues = passwordIssues(v.password);
    if (!v.password) e.password = 'Please enter a new password.';
    else if (issues.length) e.password = `Password must include ${issues.length > 1 ? `${issues.slice(0, -1).join(', ')} and ${issues[issues.length - 1]}` : issues[0]}.`;
    if (!v.confirmPassword) e.confirmPassword = 'Please confirm your new password.';
    else if (v.confirmPassword !== v.password) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    const e = validate(form);
    setErrors(e);
    if (hasErrors(e)) return;
    setLoading(true);
    try {
      await updatePassword(form.password);
      navigate('/account', { replace: true, state: { passwordUpdated: true } });
    } catch (err) {
      setSubmitError(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: keyof ResetForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={
        <>
          Changed your mind?{' '}
          <Link to="/login" className="link">
            Back to login
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <AuthModeNotice />
        {submitError && <Alert tone="error">{submitError}</Alert>}
      </div>
      {authLoading ? (
        <div className="mt-6 min-h-[10rem]" aria-busy="true" />
      ) : !user ? (
        <Alert tone="error" title="This link is invalid or has expired" className="mt-6">
          Password reset links can only be used once and expire after an hour.{' '}
          <Link to="/forgot-password" className="link">
            Request a new link
          </Link>
          .
        </Alert>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
          <p className="text-sm text-slate-600">
            Setting a new password for <span className="font-medium text-slate-900">{user.email}</span>.
          </p>
          <PasswordField
            label="New password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            hint="At least 8 characters, including a letter and a number."
          />
          <PasswordField label="Confirm new password" name="confirmPassword" autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Save new password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

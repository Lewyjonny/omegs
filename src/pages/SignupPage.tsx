import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Checkbox, PasswordField, TextField } from '../components/ui/FormField';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { AuthLayout } from '../layouts/AuthLayout';
import { hasErrors, isEmail, isPhone, passwordIssues, type Errors } from '../lib/validation';
import { AuthError } from '../services/auth';
import { AuthModeNotice } from './authShared';
import { asset } from '../lib/asset';

interface SignupForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const initial: SignupForm = { fullName: '', email: '', phone: '', password: '', confirmPassword: '', terms: false };

export default function SignupPage() {
  usePageMeta('Create your account');
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string } | null;

  const [form, setForm] = useState<SignupForm>(initial);
  const [errors, setErrors] = useState<Errors<SignupForm>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (v: SignupForm) => {
    const e: Errors<SignupForm> = {};
    if (v.fullName.trim().length < 2) e.fullName = 'Please enter your full name.';
    if (!v.email.trim()) e.email = 'Please enter your email address.';
    else if (!isEmail(v.email)) e.email = 'Please enter a valid email address.';
    if (!v.phone.trim()) e.phone = 'Please enter your phone number.';
    else if (!isPhone(v.phone)) e.phone = 'Please enter a valid phone number.';
    const issues = passwordIssues(v.password);
    if (!v.password) e.password = 'Please create a password.';
    else if (issues.length) e.password = `Password must include ${issues.length > 1 ? `${issues.slice(0, -1).join(', ')} and ${issues[issues.length - 1]}` : issues[0]}.`;
    if (!v.confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (v.confirmPassword !== v.password) e.confirmPassword = 'Passwords do not match.';
    if (!v.terms) e.terms = 'You must accept the Terms and Privacy Policy to continue.';
    return e;
  };

  const update = (field: keyof SignupForm) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'terms' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    const e = validate(form);
    setErrors(e);
    if (hasErrors(e)) {
      const first = Object.keys(e)[0];
      document.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setLoading(true);
    try {
      const result = await signUp({ fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password });
      if (result.needsEmailConfirmation) {
        navigate('/login', { replace: true, state: { signedUp: form.email.trim(), from: state?.from } });
      } else {
        navigate(state?.from ?? '/account', { replace: true, state: { welcome: true } });
      }
    } catch (err) {
      setSubmitError(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already have an account?{' '}
          <Link to="/login" state={state} className="link">
            Log in
          </Link>
        </>
      }
      image={asset('/images/kitchen.webp')}
    >
      <div className="space-y-4">
        <AuthModeNotice />
        {submitError && <Alert tone="error">{submitError}</Alert>}
      </div>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
        <TextField label="Full name" name="fullName" autoComplete="name" value={form.fullName} onChange={update('fullName')} error={errors.fullName} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Email address" type="email" name="email" autoComplete="email" value={form.email} onChange={update('email')} error={errors.email} />
          <TextField label="Phone number" type="tel" name="phone" autoComplete="tel" inputMode="tel" value={form.phone} onChange={update('phone')} error={errors.phone} />
        </div>
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          hint="At least 8 characters, including a letter and a number."
        />
        <PasswordField label="Confirm password" name="confirmPassword" autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} />
        <Checkbox
          name="terms"
          checked={form.terms}
          onChange={update('terms')}
          error={errors.terms}
          label={
            <>
              I agree to the{' '}
              <Link to="/terms" className="link" target="_blank">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="link" target="_blank">
                Privacy Policy
              </Link>
              .
            </>
          }
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}

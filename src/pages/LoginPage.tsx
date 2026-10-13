import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Checkbox, PasswordField, TextField } from '../components/ui/FormField';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { AuthLayout } from '../layouts/AuthLayout';
import { hasErrors, isEmail, type Errors } from '../lib/validation';
import { AuthError } from '../services/auth';
import { AuthModeNotice } from './authShared';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  usePageMeta('Log in');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; reason?: string; signedUp?: string } | null;
  const from = state?.from ?? '/account';

  const [form, setForm] = useState<LoginForm>({ email: state?.signedUp ?? '', password: '' });
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors<LoginForm>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (values: LoginForm) => {
    const e: Errors<LoginForm> = {};
    if (!values.email.trim()) e.email = 'Please enter your email address.';
    else if (!isEmail(values.email)) e.email = 'Please enter a valid email address.';
    if (!values.password) e.password = 'Please enter your password.';
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
      await signIn(form.email.trim(), form.password, remember);
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitError(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={
        <>
          New to Omegs?{' '}
          <Link to="/signup" state={state} className="link">
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {state?.reason === 'auth-required' && <Alert tone="info">Please log in or create an account to book a cleaning.</Alert>}
        {state?.signedUp && <Alert tone="success" title="Check your inbox">We sent a confirmation link to {state.signedUp}. Confirm your email, then log in.</Alert>}
        <AuthModeNotice />
        {submitError && <Alert tone="error">{submitError}</Alert>}
      </div>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
        <TextField label="Email address" type="email" name="email" autoComplete="email" value={form.email} onChange={update('email')} error={errors.email} />
        <PasswordField label="Password" name="password" autoComplete="current-password" value={form.password} onChange={update('password')} error={errors.password} />
        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <Link to="/forgot-password" className="text-sm font-semibold text-mint-700 hover:text-mint-800">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  );
}

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/FormField';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { AuthLayout } from '../layouts/AuthLayout';
import { isEmail } from '../lib/validation';
import { AuthError } from '../services/auth';
import { AuthModeNotice } from './authShared';

export default function ForgotPasswordPage() {
  usePageMeta('Reset your password');
  const { requestPasswordReset, mode } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!isEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setSubmitError(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        <>
          Remembered it?{' '}
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
      {sent ? (
        <Alert tone="success" title={mode === 'demo' ? 'Demo: no email sent' : 'Check your inbox'} className="mt-6">
          {mode === 'demo'
            ? 'In demo mode no reset email is sent. Connect Supabase to enable real password resets.'
            : `If an account exists for ${email}, you'll receive a link to reset your password.`}
        </Alert>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
          <TextField label="Email address" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

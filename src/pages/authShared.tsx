import { Alert } from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';

export function AuthModeNotice() {
  const { mode } = useAuth();
  if (mode === 'supabase') return null;
  return (
    <Alert tone="demo" title="Demo authentication">
      Supabase isn't configured, so accounts are stored only in this browser for demonstration. No real account is created and this is not secure.
    </Alert>
  );
}

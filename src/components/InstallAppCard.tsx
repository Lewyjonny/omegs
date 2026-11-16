import { Download, PlusSquare, Share } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/Button';

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

export function InstallAppCard() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isInstalled);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setPrompt(null);
  };

  return (
    <div className="card mx-auto mb-12 max-w-2xl p-7 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-50 text-mint-700">
        <Download className="h-5 w-5" aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-semibold">Add Omegs to your home screen</h2>
      {installed ? (
        <p className="mt-2 text-sm text-navy-600">Omegs is installed on this device. Open it from your home screen any time.</p>
      ) : prompt ? (
        <>
          <p className="mt-2 text-sm text-navy-600">Install Omegs on this device for one-tap booking, no app store needed.</p>
          <Button className="mt-5" onClick={install}>
            Install Omegs
          </Button>
        </>
      ) : isIos() ? (
        <ol className="mx-auto mt-3 max-w-sm space-y-2 text-left text-sm text-navy-600">
          <li className="flex items-center gap-2">
            1. In Safari, tap <Share className="h-4 w-4 shrink-0" aria-label="Share" /> Share.
          </li>
          <li className="flex items-center gap-2">
            2. Tap <PlusSquare className="h-4 w-4 shrink-0" aria-hidden /> Add to Home Screen.
          </li>
          <li>3. Tap Add.</li>
        </ol>
      ) : (
        <p className="mt-2 text-sm text-navy-600">
          Open this page on your phone in Chrome or Safari, then choose <strong>Install app</strong> or <strong>Add to Home Screen</strong> from the
          browser menu.
        </p>
      )}
    </div>
  );
}

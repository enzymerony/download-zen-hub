import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const DISMISS_KEY = 'pwa_install_dismissed_at';

export function InstallAppButton() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);

  useEffect(() => {
    const dismissed = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - dismissed < 7 * 24 * 3600 * 1000) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); };
    const onInstalled = () => setEvt(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!evt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full border bg-background shadow-lg p-1">
      <Button size="sm" className="rounded-full" onClick={async () => {
        await evt.prompt();
        await evt.userChoice;
        setEvt(null);
      }}>
        <Download className="h-4 w-4 mr-1" /> Install App
      </Button>
      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" aria-label="Dismiss"
        onClick={() => { localStorage.setItem(DISMISS_KEY, String(Date.now())); setEvt(null); }}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
